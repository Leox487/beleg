import "server-only";

import * as OTS from "opentimestamps";

/**
 * Thin server-only wrapper around the `opentimestamps` library.
 *
 * All proofs are stored/returned as base64 of the serialized `.ots` bytes so
 * they round-trip cleanly through the database `text` column.
 */

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

function detachedFromDigestHex(hashHex: string): OTS.DetachedTimestampFile {
  const digest = hexToBytes(hashHex);
  if (digest.length !== 32) {
    throw new Error(
      `Expected a 32-byte SHA-256 digest, got ${digest.length} bytes`,
    );
  }
  return OTS.DetachedTimestampFile.fromHash(new OTS.Ops.OpSHA256(), digest);
}

function proofToBase64(detached: OTS.DetachedTimestampFile): string {
  const bytes = detached.serializeToBytes();
  return Buffer.from(bytes).toString("base64");
}

function detachedFromBase64(b64: string): OTS.DetachedTimestampFile {
  const bytes = Array.from(Buffer.from(b64, "base64"));
  return OTS.DetachedTimestampFile.deserialize(bytes);
}

/**
 * Submit a hex SHA-256 digest (the chain tip hash) to the default public
 * OpenTimestamps calendars and return the pending proof as base64.
 */
export async function stampHashHex(hashHex: string): Promise<string> {
  const detached = detachedFromDigestHex(hashHex);
  await OTS.stamp(detached);
  return proofToBase64(detached);
}

export interface UpgradeResult {
  /** True if the proof gained new attestations (i.e. it changed). */
  changed: boolean;
  /** The (possibly upgraded) proof as base64. */
  proofBase64: string;
  /** True once a Bitcoin block attestation is present. */
  confirmed: boolean;
  /** Bitcoin block height of the attestation, if confirmed. */
  bitcoinBlockHeight: number | null;
}

/**
 * Attempt to upgrade a pending proof. If a Bitcoin attestation is now present,
 * `confirmed` is true and `bitcoinBlockHeight` is populated.
 */
export async function upgradeProofBase64(b64: string): Promise<UpgradeResult> {
  const detached = detachedFromBase64(b64);
  const changed = await OTS.upgrade(detached);

  let confirmed = false;
  let bitcoinBlockHeight: number | null = null;

  for (const att of detached.timestamp.getAttestations()) {
    if (att instanceof OTS.Notary.BitcoinBlockHeaderAttestation) {
      confirmed = true;
      bitcoinBlockHeight = att.height;
      break;
    }
  }

  return {
    changed,
    proofBase64: proofToBase64(detached),
    confirmed,
    bitcoinBlockHeight,
  };
}

/**
 * Decode a stored base64 proof back into raw `.ots` bytes for download.
 */
export function proofBase64ToBytes(b64: string): Buffer {
  return Buffer.from(b64, "base64");
}
