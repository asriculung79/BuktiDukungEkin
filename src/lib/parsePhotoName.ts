// Parses Timemark GPS photo filenames, e.g.
//   "20261027_115052_No. 35, Jalan Soekarno Hatta_Judul-routing gaji ASN.jpg"
//   "2026-10-03 08.15.32__(Judul-input pajak bulan Juli).jpg"
// Shared by backend and frontend.

export type ParsedPhotoName = {
  tanggal: string; // YYYY-MM-DD (calendar day as written on the photo)
  jam: string; // HH.mm.ss
  judul: string;
  lokasi: string | null;
};

const DATETIME_RE =
  /(\d{4})[-_.]?(\d{2})[-_.]?(\d{2})[\s_T-]*(\d{2})[.:\-_]?(\d{2})[.:\-_]?(\d{2})/;
const JUDUL_RE = /judul\s*[-:]?\s*([^)]*)/i;

function isValidDate(y: number, m: number, d: number): boolean {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function cleanText(s: string): string {
  return s
    .replace(/[()]/g, " ")
    .replace(/_+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s\-,.]+|[\s\-,.]+$/g, "");
}

export function parsePhotoName(fileName: string): ParsedPhotoName | null {
  const base = fileName.replace(/\.[a-z0-9]{2,5}$/i, "");
  const match = DATETIME_RE.exec(base);
  if (!match) return null;
  const [full, y, mo, d, h, mi, s] = match;
  if (!isValidDate(Number(y), Number(mo), Number(d))) return null;
  if (Number(h) > 23 || Number(mi) > 59 || Number(s) > 59) return null;

  const rest = base.slice(match.index + full.length);
  const judulMatch = JUDUL_RE.exec(rest);
  const judul = cleanText(judulMatch ? judulMatch[1] : rest);
  const lokasiRaw = judulMatch ? cleanText(rest.slice(0, judulMatch.index)) : "";

  return {
    tanggal: `${y}-${mo}-${d}`,
    jam: `${h}.${mi}.${s}`,
    judul: judul || "Tanpa judul",
    lokasi: lokasiRaw || null,
  };
}
