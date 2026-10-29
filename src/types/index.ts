export type DocId = string;

export interface DocRhk {
  _id: DocId;
  nomor: number;
  namaRhk: string;
  rencanaAksi: string;
  targetKuantitas: number;
  satuan: string;
  kataKunci: string[];
  driveFolderId?: string;
  driveFolderName?: string;
  driveLink?: string;
}

export interface DocLaporanHarian {
  _id: DocId;
  kunciGrup: string;
  tanggal: string; // YYYY-MM-DD
  jamKegiatan: string; // HH.mm.ss
  namaKegiatan: string;
  lokasi?: string | null;
  uraian: string;
  uraianStatus: 'pending' | 'ai' | 'manual' | 'error';
  driveFolderId: string;
  driveLink: string;
  jumlahFoto: number;
  rhkShortcutRhkId?: DocId;
}

export interface DocProfil {
  namaLengkap: string;
  namaAkun?: string;
  nip: string;
  pangkat: string;
  jabatan: string;
  atasanNama: string;
  atasanNip: string;
  atasanPangkat: string;
  atasanJabatan: string;
  fotoUrl?: string;
}

export interface DrivePhotoItem {
  id: string;
  name: string;
  thumbnailLink?: string;
  webViewLink?: string;
  parsed?: {
    tanggal: string;
    jam: string;
    judul: string;
    lokasi: string | null;
  } | null;
}

export interface DriveFolderItem {
  id: string;
  name: string;
  webViewLink?: string;
  parentFolderId?: string;
}

export interface RekapRhkData extends DocRhk {
  realisasi: number;
  jumlahFoto: number;
  kegiatan: DocLaporanHarian[];
}

export interface RekapYearData {
  tahun: string;
  totalKegiatan: number;
  tanpaRhk: number;
  rhk: RekapRhkData[];
}

// Aliases for compatibility
export type PegawaiProfile = DocProfil;
export type RHKItem = DocRhk;
export type LaporanHarian = DocLaporanHarian;
export type ActiveTab = 'dashboard' | 'rhk' | 'laporan' | 'drive' | 'rekap';
export type DriveFolderInfo = DriveFolderItem;
export type DriveFileInfo = DrivePhotoItem;
