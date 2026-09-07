"use client";

import { useState } from "react";

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value: number): Uint8Array {
  const out = new Uint8Array(2);
  out[0] = value & 255;
  out[1] = (value >>> 8) & 255;
  return out;
}

function u32(value: number): Uint8Array {
  const out = new Uint8Array(4);
  out[0] = value & 255;
  out[1] = (value >>> 8) & 255;
  out[2] = (value >>> 16) & 255;
  out[3] = (value >>> 24) & 255;
  return out;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
}

function buildZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = new TextEncoder().encode(file.name);
    const crc = crc32(file.data);
    const local = concat([
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.byteLength),
      u32(file.data.byteLength),
      u16(name.byteLength),
      u16(0),
      name,
      file.data,
    ]);
    const central = concat([
      new Uint8Array([0x50, 0x4b, 0x01, 0x02]),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.byteLength),
      u32(file.data.byteLength),
      u16(name.byteLength),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.byteLength;
  }

  const centralDir = concat(centrals);
  const end = concat([
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.byteLength),
    u32(offset),
    u16(0),
  ]);
  return concat([...locals, centralDir, end]);
}

export function CivicProofZip({
  city,
  records,
}: {
  city: string;
  records: { id: string; dataset_id: string; ots_proof: string | null }[];
}) {
  const proofs = records.filter((row) => row.ots_proof);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (proofs.length === 0) return null;

  async function download() {
    setBusy(true);
    setError("");
    try {
      const files: { name: string; data: Uint8Array }[] = [];
      for (const row of proofs) {
        const res = await fetch(`/api/civic/proof/${row.id}`);
        if (!res.ok) continue;
        files.push({
          name: `beleg-civic-${row.dataset_id}-${row.id.slice(0, 8)}.ots`,
          data: new Uint8Array(await res.arrayBuffer()),
        });
      }
      if (files.length === 0) {
        setError("No proofs could be downloaded.");
        return;
      }
      const zip = buildZip(files);
      const blob = new Blob([new Uint8Array(zip)], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `beleg-civic-${city.toLowerCase().replace(/\s+/g, "-")}-proofs.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not build the ZIP.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="civic-zip">
      <button type="button" className="civic-btn" onClick={download} disabled={busy}>
        {busy ? "Preparing ZIP…" : "Download all proofs"}
      </button>
      {error ? <p className="civic-verify-empty">{error}</p> : null}
    </div>
  );
}
