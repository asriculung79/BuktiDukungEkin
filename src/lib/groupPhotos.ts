import type { ParsedPhotoName } from "./parsePhotoName.ts";

export type PhotoInput = { id: string; parsed: ParsedPhotoName };

export type PhotoGroup = {
  kunciGrup: string;
  tanggal: string;
  jam: string; // earliest time in the group
  judul: string; // title as written on the earliest photo
  lokasi: string | null;
  fileIds: string[];
};

// Same title (case/spacing-insensitive) on the same day = one activity
export function groupKey(tanggal: string, judul: string): string {
  return `${tanggal}|${judul.toLowerCase().replace(/\s+/g, " ").trim()}`;
}

export function groupPhotos(photos: PhotoInput[]): PhotoGroup[] {
  const groups = new Map<string, PhotoGroup>();
  for (const { id, parsed } of photos) {
    const key = groupKey(parsed.tanggal, parsed.judul);
    const g = groups.get(key);
    if (!g) {
      groups.set(key, {
        kunciGrup: key,
        tanggal: parsed.tanggal,
        jam: parsed.jam,
        judul: parsed.judul,
        lokasi: parsed.lokasi,
        fileIds: [id],
      });
      continue;
    }
    g.fileIds.push(id);
    // "HH.mm.ss" compares correctly as a string
    if (parsed.jam < g.jam) {
      g.jam = parsed.jam;
      g.judul = parsed.judul;
      g.lokasi = parsed.lokasi ?? g.lokasi;
    }
  }
  return [...groups.values()].sort((a, b) => (a.tanggal + a.jam).localeCompare(b.tanggal + b.jam));
}
