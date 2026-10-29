// Maps an activity title to an RHK by keyword. Lowest RHK number wins when several match.
// Shared by backend and frontend.

export type RhkKeywords<Id> = { _id: Id; nomor: number; kataKunci: string[] };

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function matchRhk<Id, T extends RhkKeywords<Id>>(namaKegiatan: string, rhkList: T[]): T | null {
  const title = normalize(namaKegiatan);
  const sorted = [...rhkList].sort((a, b) => a.nomor - b.nomor);
  for (const rhk of sorted) {
    if (rhk.kataKunci.some((k) => k && title.includes(normalize(k)))) return rhk;
  }
  return null;
}
