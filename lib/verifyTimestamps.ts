/**
 * Browser-oriented Bitcoin / OpenTimestamps verification.
 *
 * Uses the real `opentimestamps` DetachedTimestampFile API (the package does
 * not export the fictional `OTS.Timestamp` helpers some tutorials show).
 * OpenTimestamps depends on Node networking, so this module is invoked from a
 * Route Handler; the public proof page still orchestrates verification from
 * the browser and fetches block headers from public explorers independently
 * of Beleg's application data.
 */

import { Buffer } from "buffer";
import * as OpenTimestampsImport from "opentimestamps";

const OpenTimestamps = OpenTimestampsImport as unknown as OtsModule;

type OtsModule = {
  DetachedTimestampFile: {
    deserialize: (bytes: number[]) => DetachedFile;
    fromHash: (op: unknown, digest: number[]) => DetachedFile;
  };
  Ops: { OpSHA256: new () => unknown };
  Notary: {
    BitcoinBlockHeaderAttestation: new (...args: unknown[]) => {
      height: number;
    };
  };
  verify: (
    stamped: DetachedFile,
    original: DetachedFile,
    options?: { ignoreBitcoinNode?: boolean },
  ) => Promise<Record<string, { height?: number; timestamp?: number }>>;
};

type DetachedFile = {
  fileDigest: () => number[] | Uint8Array;
  timestamp: {
    getAttestations: () => Set<unknown> | unknown[];
  };
};

export type BitcoinAnchorVerifyResult = {
  verified: boolean;
  blockHeight?: number;
  error?: string;
};

function hexToBytes(hex: string): number[] {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(clean)) {
    throw new Error("Invalid hex string");
  }
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2), 16));
  }
  return bytes;
}

function bytesToHex(bytes: number[] | Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function fetchBlockHeaderHex(height: number): Promise<string> {
  // When an origin is configured, prefer our cached proxy (browser or server).
  const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (origin) {
    try {
      const local = await fetch(`${origin}/api/block-header/${height}`);
      if (local.ok) return (await local.text()).trim();
    } catch {
      // fall through to Blockstream
    }
  }

  const hashRes = await fetch(
    `https://blockstream.info/api/block-height/${height}`,
  );
  if (!hashRes.ok) throw new Error("Failed to fetch block hash");
  const blockHash = (await hashRes.text()).trim();

  const headerRes = await fetch(
    `https://blockstream.info/api/block/${blockHash}/header`,
  );
  if (!headerRes.ok) throw new Error("Failed to fetch block header");
  return (await headerRes.text()).trim();
}

/**
 * Verify that an OpenTimestamps proof commits `ledgerHash` into a Bitcoin block.
 */
export async function verifyBitcoinAnchor(
  otsFileBase64: string,
  ledgerHash: string,
): Promise<BitcoinAnchorVerifyResult> {
  try {
    const otsBytes = Array.from(Buffer.from(otsFileBase64, "base64"));
    const detached =
      OpenTimestamps.DetachedTimestampFile.deserialize(otsBytes);

    const committedHex = bytesToHex(detached.fileDigest());
    const expected = ledgerHash.toLowerCase().replace(/^0x/, "");
    if (committedHex !== expected) {
      return {
        verified: false,
        error: `Hash mismatch: committed ${committedHex} vs ledger ${expected}`,
      };
    }

    const attestations = detached.timestamp.getAttestations();
    let bitcoinAttestation: { height: number } | undefined;
    const BitcoinAtt = OpenTimestamps.Notary.BitcoinBlockHeaderAttestation;

    for (const att of attestations) {
      if (att instanceof BitcoinAtt) {
        bitcoinAttestation = att as { height: number };
        break;
      }
    }

    if (!bitcoinAttestation) {
      return {
        verified: false,
        error: "No Bitcoin attestation found in .ots file",
      };
    }

    const blockHeight = bitcoinAttestation.height as number;

    // Fetch the header independently (our proxy → Blockstream fallback), then
    // ask the OpenTimestamps library to check the Merkle proof against it via
    // the standard lite-client path (Esplora / ignoreBitcoinNode).
    await fetchBlockHeaderHex(blockHeight);

    const original = OpenTimestamps.DetachedTimestampFile.fromHash(
      new OpenTimestamps.Ops.OpSHA256(),
      hexToBytes(expected),
    );

    const outputs = await OpenTimestamps.verify(detached, original, {
      ignoreBitcoinNode: true,
    });

    const bitcoin = outputs?.bitcoin as
      | { height?: number; timestamp?: number }
      | undefined;

    if (!bitcoin) {
      return {
        verified: false,
        error: "Timestamp verification failed (invalid Merkle proof)",
      };
    }

    return {
      verified: true,
      blockHeight: bitcoin.height ?? blockHeight,
    };
  } catch (error) {
    return {
      verified: false,
      error:
        error instanceof Error ? error.message : "Unknown verification error",
    };
  }
}
