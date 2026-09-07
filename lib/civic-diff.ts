export type CivicContentDiff = {
  added: number;
  removed: number;
  modified: number;
  key: string | null;
  added_preview: string[];
  removed_preview: string[];
  modified_preview: { old: string; new: string }[];
};

const PREVIEW = 8;
const KEY_NAMES = new Set([
  "id",
  "uid",
  "uuid",
  "sr_number",
  "request_number",
  "contract_number",
  "contract_id",
  "employee_id",
  "vendor_id",
  "vendor_number",
  "po_number",
  "purchase_order",
  "payment_id",
  "check_number",
]);

export function formatDiffSummary(diff: CivicContentDiff): string {
  return `${diff.added} rows added, ${diff.removed} rows removed, ${diff.modified} rows modified`;
}

export function parseStoredDiff(value: unknown): CivicContentDiff | null {
  let raw: Record<string, unknown> | null = null;
  try {
    raw =
      typeof value === "string"
        ? (JSON.parse(value) as Record<string, unknown>)
        : value && typeof value === "object"
          ? (value as Record<string, unknown>)
          : null;
  } catch {
    return null;
  }
  if (!raw) return null;
  if (
    typeof raw.added !== "number" ||
    typeof raw.removed !== "number" ||
    typeof raw.modified !== "number"
  ) {
    return null;
  }
  return {
    added: raw.added,
    removed: raw.removed,
    modified: raw.modified,
    key: raw.key == null ? null : String(raw.key),
    added_preview: Array.isArray(raw.added_preview)
      ? raw.added_preview.map((row) => String(row))
      : [],
    removed_preview: Array.isArray(raw.removed_preview)
      ? raw.removed_preview.map((row) => String(row))
      : [],
    modified_preview: Array.isArray(raw.modified_preview)
      ? raw.modified_preview.map((row) => {
          const item = row as Record<string, unknown>;
          return {
            old: String(item.old ?? ""),
            new: String(item.new ?? ""),
          };
        })
      : [],
  };
}

export function diffTextFiles(
  oldText: string,
  newText: string,
  url: string,
): CivicContentDiff | null {
  const kind = snapshotKind(url, oldText) ?? snapshotKind(url, newText);
  if (kind === "csv") return diffTable(parseCsv(oldText), parseCsv(newText));
  if (kind === "json") {
    const oldRows = jsonToRows(oldText);
    const newRows = jsonToRows(newText);
    if (oldRows && newRows) return diffTable(oldRows, newRows);
    return diffLines(oldText, newText);
  }
  return null;
}

function snapshotKind(url: string, text: string): "csv" | "json" | null {
  const lower = url.toLowerCase();
  if (lower.includes("rows.csv") || lower.endsWith(".csv") || lower.includes("format=csv")) {
    return "csv";
  }
  if (lower.endsWith(".json") || lower.includes("format=json")) return "json";
  const trimmed = text.trimStart();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  if (trimmed.includes(",")) return "csv";
  return null;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n") {
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = "";
      continue;
    }
    if (char !== "\r") field += char;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim())) rows.push(row);
  }
  return rows;
}

function jsonToRows(text: string): string[][] | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    const records = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object"
        ? [parsed]
        : null;
    if (!records || records.length === 0) return null;
    if (!records.every((row) => row && typeof row === "object" && !Array.isArray(row))) {
      return null;
    }
    const keys = new Set<string>();
    for (const record of records) {
      for (const key of Object.keys(record as Record<string, unknown>)) keys.add(key);
    }
    const headers = [...keys];
    return [
      headers,
      ...records.map((record) =>
        headers.map((key) => stringifyCell((record as Record<string, unknown>)[key])),
      ),
    ];
  } catch {
    return null;
  }
}

function stringifyCell(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function rowLine(headers: string[], cells: string[]): string {
  return headers
    .map((header, index) => `${header}=${cells[index] ?? ""}`)
    .join(" · ");
}

function pickKey(headers: string[], rows: string[][]): number | null {
  const named = headers.findIndex((header) =>
    KEY_NAMES.has(header.trim().toLowerCase()),
  );
  const candidates = named >= 0 ? [named] : headers.map((_, index) => index);
  for (const index of candidates) {
    const values = rows.map((row) => row[index] ?? "");
    if (values.length > 0 && values.every((value) => value) && new Set(values).size === values.length) {
      return index;
    }
  }
  return null;
}

function diffTable(oldRows: string[][], newRows: string[][]): CivicContentDiff {
  if (oldRows.length === 0 && newRows.length === 0) {
    return emptyDiff();
  }
  const headers = (newRows[0] ?? oldRows[0] ?? []).map((cell) => cell.trim());
  const oldData = oldRows.slice(1);
  const newData = newRows.slice(1);
  const keyIndex = pickKey(headers, [...oldData, ...newData].slice(0, 4000));

  if (keyIndex == null) {
    return diffByIndex(headers, oldData, newData);
  }

  const oldMap = new Map(oldData.map((row) => [row[keyIndex] ?? "", row]));
  const newMap = new Map(newData.map((row) => [row[keyIndex] ?? "", row]));
  const added_preview: string[] = [];
  const removed_preview: string[] = [];
  const modified_preview: { old: string; new: string }[] = [];
  let added = 0;
  let removed = 0;
  let modified = 0;

  for (const [key, row] of newMap) {
    const previous = oldMap.get(key);
    if (!previous) {
      added += 1;
      if (added_preview.length < PREVIEW) added_preview.push(rowLine(headers, row));
      continue;
    }
    if (previous.join("\0") !== row.join("\0")) {
      modified += 1;
      if (modified_preview.length < PREVIEW) {
        modified_preview.push({
          old: rowLine(headers, previous),
          new: rowLine(headers, row),
        });
      }
    }
  }
  for (const [key, row] of oldMap) {
    if (!newMap.has(key)) {
      removed += 1;
      if (removed_preview.length < PREVIEW) {
        removed_preview.push(rowLine(headers, row));
      }
    }
  }

  return {
    added,
    removed,
    modified,
    key: headers[keyIndex] ?? null,
    added_preview,
    removed_preview,
    modified_preview,
  };
}

function diffByIndex(
  headers: string[],
  oldData: string[][],
  newData: string[][],
): CivicContentDiff {
  const max = Math.max(oldData.length, newData.length);
  const added_preview: string[] = [];
  const removed_preview: string[] = [];
  const modified_preview: { old: string; new: string }[] = [];
  let added = 0;
  let removed = 0;
  let modified = 0;
  for (let i = 0; i < max; i += 1) {
    const oldRow = oldData[i];
    const newRow = newData[i];
    if (!oldRow && newRow) {
      added += 1;
      if (added_preview.length < PREVIEW) added_preview.push(rowLine(headers, newRow));
    } else if (oldRow && !newRow) {
      removed += 1;
      if (removed_preview.length < PREVIEW) {
        removed_preview.push(rowLine(headers, oldRow));
      }
    } else if (oldRow && newRow && oldRow.join("\0") !== newRow.join("\0")) {
      modified += 1;
      if (modified_preview.length < PREVIEW) {
        modified_preview.push({
          old: rowLine(headers, oldRow),
          new: rowLine(headers, newRow),
        });
      }
    }
  }
  return {
    added,
    removed,
    modified,
    key: null,
    added_preview,
    removed_preview,
    modified_preview,
  };
}

function diffLines(oldText: string, newText: string): CivicContentDiff {
  const oldLines = oldText.split(/\r?\n/);
  const newLines = newText.split(/\r?\n/);
  return diffByIndex(["line"], oldLines.map((line) => [line]), newLines.map((line) => [line]));
}

function emptyDiff(): CivicContentDiff {
  return {
    added: 0,
    removed: 0,
    modified: 0,
    key: null,
    added_preview: [],
    removed_preview: [],
    modified_preview: [],
  };
}
