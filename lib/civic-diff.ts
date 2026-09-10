import "server-only";

const SAMPLE_ROW_LIMIT = 20;
const SAMPLE_PREVIEW = 3;
const MAX_NOTABLE = 5;
const MAX_CELL_CHARS = 240;

export interface CivicDiffSummary {
  rows_added: number;
  rows_removed: number;
  rows_modified: number;
  total_rows_before: number;
  total_rows_after: number;
  columns: string[];
  sample_added: Record<string, string>[];
  sample_removed: Record<string, string>[];
  sample_modified: {
    before: Record<string, string>;
    after: Record<string, string>;
    changed_fields: string[];
  }[];
  notable_changes: string[];
}

export type CivicRowSnapshot = {
  row_count: number;
  col_names: string[];
  sample_rows: Record<string, string>[];
};

export type CivicContentDiff = CivicDiffSummary;

type CivicTable = {
  columns: string[];
  rows: Record<string, string>[];
  rowCount?: number;
};

export function formatDiffSummary(diff: CivicDiffSummary): string {
  const parts: string[] = [];
  if (diff.rows_added > 0) parts.push(`+${diff.rows_added} rows added`);
  if (diff.rows_removed > 0) parts.push(`${diff.rows_removed} rows removed`);
  if (diff.rows_modified > 0) parts.push(`${diff.rows_modified} rows modified`);
  return parts.join(" · ");
}

export function parseStoredDiff(value: unknown): CivicDiffSummary | null {
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

  if (isLegacyDiff(raw)) {
    return legacyToSummary(raw);
  }

  const rowsAdded = asCount(raw.rows_added);
  const rowsRemoved = asCount(raw.rows_removed);
  const rowsModified = asCount(raw.rows_modified);
  if (rowsAdded == null || rowsRemoved == null || rowsModified == null) {
    return null;
  }

  return {
    rows_added: rowsAdded,
    rows_removed: rowsRemoved,
    rows_modified: rowsModified,
    total_rows_before: asCount(raw.total_rows_before) ?? 0,
    total_rows_after: asCount(raw.total_rows_after) ?? 0,
    columns: asStringArray(raw.columns),
    sample_added: asRecordList(raw.sample_added),
    sample_removed: asRecordList(raw.sample_removed),
    sample_modified: asModifiedList(raw.sample_modified),
    notable_changes: asStringArray(raw.notable_changes),
  };
}

export async function diffCivicContent(
  before: string,
  after: string,
  datasetName: string,
): Promise<CivicDiffSummary> {
  const oldTable = parseCivicTable(before);
  const newTable = parseCivicTable(after);
  const columns = mergeColumns(oldTable.columns, newTable.columns);
  return buildDiff(oldTable, newTable, columns, datasetName);
}

export function extractCivicSnapshot(text: string): CivicRowSnapshot | null {
  const trimmed = text.trimStart();
  if (!trimmed || looksLikeHtml(trimmed)) return null;

  if (looksLikeJson(trimmed)) {
    const table = jsonToTable(trimmed);
    if (!table || table.columns.length === 0) return null;
    return snapshotFromTable(table);
  }

  const table = csvToTable(trimmed, { sampleOnly: true });
  if (!table || table.columns.length < 2) return null;
  return snapshotFromTable(table);
}

export function civicSnapshotToText(snapshot: CivicRowSnapshot): string {
  return tableToCsv(snapshot.col_names, snapshot.sample_rows);
}

export function refineDiffWithTotals(
  diff: CivicDiffSummary,
  totalBefore: number | null,
  totalAfter: number | null,
  datasetName: string,
): CivicDiffSummary {
  const next: CivicDiffSummary = {
    ...diff,
    total_rows_before: totalBefore ?? diff.total_rows_before,
    total_rows_after: totalAfter ?? diff.total_rows_after,
  };

  if (totalBefore != null && totalAfter != null) {
    const net = totalAfter - totalBefore;
    if (next.rows_added === 0 && next.rows_removed === 0 && net !== 0) {
      if (net > 0) next.rows_added = net;
      else next.rows_removed = -net;
    }
  }

  next.notable_changes = buildNotableChanges(next, datasetName);
  return next;
}

function snapshotFromTable(table: CivicTable): CivicRowSnapshot {
  return {
    row_count: table.rowCount ?? table.rows.length,
    col_names: table.columns,
    sample_rows: table.rows.slice(0, SAMPLE_ROW_LIMIT).map(clipRecord),
  };
}

function parseCivicTable(text: string): CivicTable {
  const trimmed = text.trim();
  if (!trimmed) return { columns: [], rows: [] };
  if (looksLikeJson(trimmed)) {
    return jsonToTable(trimmed) ?? { columns: [], rows: [] };
  }
  return csvToTable(trimmed) ?? { columns: [], rows: [] };
}

function csvToTable(
  text: string,
  options: { sampleOnly?: boolean } = {},
): CivicTable | null {
  const parsed = parseCsvCounted(text, options.sampleOnly ? SAMPLE_ROW_LIMIT : undefined);
  if (!parsed) return null;
  const rows = parsed.sample.map((cells) => recordFromCells(parsed.columns, cells));
  if (options.sampleOnly && parsed.rowCount > rows.length) {
    return { columns: parsed.columns, rows, rowCount: parsed.rowCount };
  }
  return { columns: parsed.columns, rows, rowCount: parsed.rowCount };
}

function jsonToTable(text: string): CivicTable | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    const records = collectJsonRecords(parsed);
    if (!records || records.length === 0) return null;
    const columns = mergeColumns(
      [],
      records.flatMap((record) => Object.keys(record)),
    );
    if (columns.length === 0) return null;
    return {
      columns,
      rowCount: records.length,
      rows: records.map((record) => {
        const row: Record<string, string> = {};
        for (const column of columns) {
          row[column] = stringifyCell(record[column]);
        }
        return row;
      }),
    };
  } catch {
    return null;
  }
}

function collectJsonRecords(
  value: unknown,
): Record<string, unknown>[] | null {
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    if (value.every((row) => row && typeof row === "object" && !Array.isArray(row))) {
      return value as Record<string, unknown>[];
    }
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  for (const key of ["records", "data", "results", "rows", "value", "items"]) {
    const nested = collectJsonRecords(obj[key]);
    if (nested) return nested;
  }
  if (obj.result && typeof obj.result === "object") {
    const nested = collectJsonRecords(obj.result);
    if (nested) return nested;
  }
  return [obj];
}

function buildDiff(
  oldTable: CivicTable,
  newTable: CivicTable,
  columns: string[],
  datasetName: string,
): CivicDiffSummary {
  const oldMap = new Map<string, Record<string, string>>();
  const newMap = new Map<string, Record<string, string>>();
  oldTable.rows.forEach((row, index) => {
    oldMap.set(rowIdentity(row, columns, index), row);
  });
  newTable.rows.forEach((row, index) => {
    newMap.set(rowIdentity(row, columns, index), row);
  });

  const sample_added: Record<string, string>[] = [];
  const sample_removed: Record<string, string>[] = [];
  const sample_modified: CivicDiffSummary["sample_modified"] = [];
  const columnHits = new Map<string, number>();
  let rows_added = 0;
  let rows_removed = 0;
  let rows_modified = 0;

  for (const [key, row] of newMap) {
    const previous = oldMap.get(key);
    if (!previous) {
      rows_added += 1;
      if (sample_added.length < SAMPLE_PREVIEW) sample_added.push(clipRecord(row));
      continue;
    }
    const changed_fields = changedFields(previous, row, columns);
    if (changed_fields.length > 0) {
      rows_modified += 1;
      for (const field of changed_fields) {
        columnHits.set(field, (columnHits.get(field) ?? 0) + 1);
      }
      if (sample_modified.length < SAMPLE_PREVIEW) {
        sample_modified.push({
          before: clipRecord(previous),
          after: clipRecord(row),
          changed_fields,
        });
      }
    }
  }

  for (const [key, row] of oldMap) {
    if (!newMap.has(key)) {
      rows_removed += 1;
      if (sample_removed.length < SAMPLE_PREVIEW) {
        sample_removed.push(clipRecord(row));
      }
    }
  }

  const summary: CivicDiffSummary = {
    rows_added,
    rows_removed,
    rows_modified,
    total_rows_before: oldTable.rows.length,
    total_rows_after: newTable.rows.length,
    columns,
    sample_added,
    sample_removed,
    sample_modified,
    notable_changes: [],
  };
  summary.notable_changes = buildNotableChanges(summary, datasetName, columnHits);
  return summary;
}

function buildNotableChanges(
  diff: CivicDiffSummary,
  datasetName: string,
  columnHits?: Map<string, number>,
): string[] {
  const notes: string[] = [];
  if (diff.rows_added > 0) {
    notes.push(`${diff.rows_added} new rows added`);
  }
  if (diff.rows_removed > 0) {
    notes.push(
      `${diff.rows_removed} ${diff.rows_removed === 1 ? "row" : "rows"} removed`,
    );
  }
  if (diff.rows_modified > 0) {
    notes.push(
      `${diff.rows_modified} ${diff.rows_modified === 1 ? "row" : "rows"} modified`,
    );
  }

  const hits =
    columnHits ??
    columnHitsFromSamples(diff.sample_modified);
  const ranked = [...hits.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  for (const [column, count] of ranked) {
    if (notes.length >= MAX_NOTABLE) break;
    notes.push(
      `Column '${column}' changed in ${count} ${count === 1 ? "row" : "rows"}`,
    );
  }

  if (notes.length < MAX_NOTABLE && diff.sample_added[0]) {
    const firstCol = diff.columns[0];
    const value = firstCol ? diff.sample_added[0][firstCol] : "";
    if (value) {
      notes.push(`${addedNoun(datasetName)}: ${value}`);
    }
  }

  if (
    notes.length === 0 &&
    (diff.total_rows_before !== diff.total_rows_after ||
      diff.rows_added + diff.rows_removed + diff.rows_modified === 0)
  ) {
    notes.push("Sample rows are unchanged; the hash differs later in the file");
  }

  return notes.slice(0, MAX_NOTABLE);
}

function columnHitsFromSamples(
  samples: CivicDiffSummary["sample_modified"],
): Map<string, number> {
  const hits = new Map<string, number>();
  for (const sample of samples) {
    for (const field of sample.changed_fields) {
      hits.set(field, (hits.get(field) ?? 0) + 1);
    }
  }
  return hits;
}

function addedNoun(datasetName: string): string {
  const name = datasetName.toLowerCase();
  if (name.includes("contract")) return "New contract added";
  if (name.includes("lobby")) return "New lobbying registration added";
  if (name.includes("employee") || name.includes("payroll")) {
    return "New employee added";
  }
  if (name.includes("payment") || name.includes("check")) {
    return "New payment added";
  }
  if (name.includes("permit")) return "New permit added";
  return "New row added";
}

function rowIdentity(
  row: Record<string, string>,
  columns: string[],
  index: number,
): string {
  const first = columns[0];
  const key = first ? (row[first] ?? "").trim() : "";
  if (key) return key;
  const joined = columns.map((column) => row[column] ?? "").join("\u0001");
  return joined || `__i:${index}`;
}

function changedFields(
  before: Record<string, string>,
  after: Record<string, string>,
  columns: string[],
): string[] {
  return columns.filter((column) => (before[column] ?? "") !== (after[column] ?? ""));
}

function mergeColumns(a: string[], b: string[]): string[] {
  const seen = new Set<string>();
  const columns: string[] = [];
  for (const column of [...a, ...b]) {
    if (!column || seen.has(column)) continue;
    seen.add(column);
    columns.push(column);
  }
  return columns;
}

function uniqueHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>();
  return headers.map((raw, index) => {
    const base = raw.trim() || `column_${index + 1}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });
}

function recordFromCells(
  columns: string[],
  cells: string[],
): Record<string, string> {
  const row: Record<string, string> = {};
  columns.forEach((column, index) => {
    row[column] = cells[index] ?? "";
  });
  return row;
}

function clipRecord(row: Record<string, string>): Record<string, string> {
  const clipped: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    clipped[key] = clipCell(value);
  }
  return clipped;
}

function clipCell(value: string): string {
  if (value.length <= MAX_CELL_CHARS) return value;
  return `${value.slice(0, MAX_CELL_CHARS)}…`;
}

function stringifyCell(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function tableToCsv(
  columns: string[],
  rows: Record<string, string>[],
): string {
  const lines = [
    columns.map(escapeCsv).join(","),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column] ?? "")).join(",")),
  ];
  return lines.join("\n");
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsvCounted(
  text: string,
  sampleLimit?: number,
): { columns: string[]; sample: string[][]; rowCount: number } | null {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let total = 0;

  const pushRow = () => {
    row.push(field);
    if (row.some((cell) => cell.trim())) {
      if (sampleLimit == null || rows.length < sampleLimit + 1) {
        rows.push(row);
      }
      total += 1;
    }
    row = [];
    field = "";
  };

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
      pushRow();
      continue;
    }
    if (char !== "\r") field += char;
  }
  if (field.length > 0 || row.length > 0) pushRow();
  if (rows.length === 0) return null;
  const columns = uniqueHeaders(rows[0] ?? []);
  if (columns.length === 0) return null;
  return {
    columns,
    sample: rows.slice(1),
    rowCount: Math.max(0, total - 1),
  };
}

export function parseCsv(text: string): string[][] {
  const parsed = parseCsvCounted(text);
  if (!parsed) return [];
  return [parsed.columns, ...parsed.sample];
}

function looksLikeJson(text: string): boolean {
  const start = text.trimStart();
  return start.startsWith("{") || start.startsWith("[");
}

function looksLikeHtml(text: string): boolean {
  return /^\s*(<!doctype html|<html[\s>])/i.test(text);
}

function asCount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.max(0, Math.floor(value));
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const record: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    record[key] = item == null ? "" : String(item);
  }
  return record;
}

function asRecordList(value: unknown): Record<string, string>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function asModifiedList(
  value: unknown,
): CivicDiffSummary["sample_modified"] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = (item && typeof item === "object" ? item : {}) as Record<
      string,
      unknown
    >;
    return {
      before: asRecord(row.before),
      after: asRecord(row.after),
      changed_fields: asStringArray(row.changed_fields),
    };
  });
}

function isLegacyDiff(raw: Record<string, unknown>): boolean {
  return (
    typeof raw.added === "number" &&
    typeof raw.removed === "number" &&
    typeof raw.modified === "number" &&
    raw.rows_added == null
  );
}

function legacyToSummary(raw: Record<string, unknown>): CivicDiffSummary {
  const added = asCount(raw.added) ?? 0;
  const removed = asCount(raw.removed) ?? 0;
  const modified = asCount(raw.modified) ?? 0;
  const summary: CivicDiffSummary = {
    rows_added: added,
    rows_removed: removed,
    rows_modified: modified,
    total_rows_before: 0,
    total_rows_after: 0,
    columns: [],
    sample_added: [],
    sample_removed: [],
    sample_modified: [],
    notable_changes: [],
  };
  summary.notable_changes = buildNotableChanges(summary, "");
  return summary;
}
