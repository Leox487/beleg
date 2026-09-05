// Minimal ambient types for the untyped `opentimestamps` (v0.4.9) package.
// Only the surface Beleg actually uses is declared; everything else is `any`.
declare module "opentimestamps" {
  namespace Ops {
    class Op {}
    class OpSHA256 extends Op {}
  }

  namespace Notary {
    class TimeAttestation {}
    class PendingAttestation extends TimeAttestation {
      uri: string;
    }
    class BitcoinBlockHeaderAttestation extends TimeAttestation {
      height: number;
    }
    class LitecoinBlockHeaderAttestation extends TimeAttestation {
      height: number;
    }
  }

  class Timestamp {
    msg: number[];
    getAttestations(): Set<Notary.TimeAttestation>;
  }

  class DetachedTimestampFile {
    timestamp: Timestamp;
    fileDigest(): number[];
    serializeToBytes(): Uint8Array;
    static fromHash(
      fileHashOp: Ops.Op,
      fdHash: number[] | Uint8Array | ArrayBuffer,
    ): DetachedTimestampFile;
    static deserialize(
      buffer: number[] | Uint8Array | ArrayBuffer,
    ): DetachedTimestampFile;
  }

  function stamp(
    detaches: DetachedTimestampFile | DetachedTimestampFile[],
    options?: { calendars?: string[]; m?: number },
  ): Promise<void>;

  function upgrade(
    detached: DetachedTimestampFile,
    options?: { calendars?: string[] },
  ): Promise<boolean>;

  function info(detached: DetachedTimestampFile, options?: { verbose?: boolean }): string;
}
