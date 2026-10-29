import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  DocRhk, 
  DocLaporanHarian, 
  DocProfil, 
  DrivePhotoItem, 
  DriveFolderItem, 
  RekapYearData, 
  RekapRhkData 
} from '../types';
import { parsePhotoName } from '../lib/parsePhotoName';
import { matchRhk } from '../lib/matchRhk';
import { groupPhotos } from '../lib/groupPhotos';
import { 
  initAuth, 
  googleSignIn, 
  getAccessToken, 
  setCachedAccessToken, 
  logoutGoogle 
} from '../lib/firebase';
import { 
  createDriveFolder, 
  makeFilePublic, 
  uploadFileToDrive, 
  listFilesInFolder 
} from '../lib/googleDrive';

interface EkinContextType {
  // Auth state
  user: { name: string; email: string; avatarUrl?: string } | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;

  // Profile state
  profil: DocProfil;
  updateProfil: (data: Partial<DocProfil>) => void;
  setFotoProfil: (url: string) => void;
  removeFotoProfil: () => void;

  // RHK state
  rhkList: DocRhk[];
  addRhk: (rhk: Omit<DocRhk, '_id'>) => void;
  updateRhk: (rhk: DocRhk) => void;
  deleteRhk: (id: string) => void;

  // Laporan Harian state
  laporanList: DocLaporanHarian[];
  getLaporanByMonth: (bulan: string) => DocLaporanHarian[];
  updateLaporan: (id: string, updates: Partial<DocLaporanHarian>) => void;
  deleteLaporan: (id: string) => void;
  regenerateAiUraian: (id: string) => Promise<void>;
  syncNewPhotos: () => Promise<{ dipindah: number; kegiatanBaru: number; dilewati: number; sisa: boolean }>;

  // Google Drive state
  isDriveConnected: boolean;
  driveEmail?: string;
  rawFolderId?: string;
  rawFolderName?: string;
  setRawFolder: (id: string, name: string) => void;
  rawPhotos: DrivePhotoItem[];
  refreshRawPhotos: () => Promise<void>;
  syncRhkDriveFolders: () => Promise<{ folderRhk: number; dipetakan: number; sisa: boolean }>;
  connectDrive: () => Promise<void>;
  disconnectDrive: () => Promise<void>;

  // Rekap state
  getRekapByYear: (tahun: string) => RekapYearData;
}

const DEFAULT_PROFIL: DocProfil = {
  namaLengkap: 'Dra. Hj. Nurul Hidayati, M.Pd.',
  namaAkun: 'Nurul Hidayati',
  nip: '197908152006042018',
  pangkat: 'Pembina / IV/a',
  jabatan: 'Guru Ahli Madya',
  atasanNama: 'Dr. Bambang Sutrisno, M.Si.',
  atasanNip: '197103121997031004',
  atasanPangkat: 'Pembina Tingkat I / IV/b',
  atasanJabatan: 'Kepala Sekolah SMP Negeri 1 Surabaya',
  fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
};

const DEFAULT_RHK: DocRhk[] = [
  {
    _id: 'rhk-1',
    nomor: 1,
    namaRhk: 'Terlaksananya perencanaan pembelajaran, pelaksanaan pembelajaran, dan penilaian hasil pembelajaran sesuai kurikulum',
    rencanaAksi: 'Menyusun Modul Ajar dan melaksanakan KBM serta asesmen sumatif.',
    targetKuantitas: 12,
    satuan: 'Laporan',
    kataKunci: ['kbm', 'mengajar', 'modul', 'aljabar', 'siswa', 'pembelajaran'],
    driveFolderId: 'folder-rhk-1',
    driveFolderName: 'RHK 1, Perencanaan & KBM',
    driveLink: 'https://drive.google.com/drive/folders/1MockRhkFolder_01?usp=sharing',
  },
  {
    _id: 'rhk-2',
    nomor: 2,
    namaRhk: 'Terlaksananya pembimbingan dan pelatihan peserta didik dalam kegiatan ekstrakurikuler atau kokurikuler',
    rencanaAksi: 'Membimbing tim olimpiade sains dan pendampingan proyek P5.',
    targetKuantitas: 4,
    satuan: 'Laporan Triwulan',
    kataKunci: ['bimbingan', 'osn', 'olimpiade', 'ekskul', 'p5'],
    driveFolderId: 'folder-rhk-2',
    driveFolderName: 'RHK 2, Bimbingan Siswa',
    driveLink: 'https://drive.google.com/drive/folders/1MockRhkFolder_02?usp=sharing',
  },
  {
    _id: 'rhk-3',
    nomor: 3,
    namaRhk: 'Terselesaikannya pengembangan keprofesian berkelanjutan (PKB) melalui diklat fungsional',
    rencanaAksi: 'Mengikuti seminar dan pelatihan kurikulum minimal 32 JP.',
    targetKuantitas: 2,
    satuan: 'Sertifikat',
    kataKunci: ['diklat', 'seminar', 'webinar', 'workshop', 'pelatihan'],
    driveFolderId: 'folder-rhk-3',
    driveFolderName: 'RHK 3, Diklat & Seminar',
    driveLink: 'https://drive.google.com/drive/folders/1MockRhkFolder_03?usp=sharing',
  },
  {
    _id: 'rhk-4',
    nomor: 4,
    namaRhk: 'Terlaksananya tugas kedinasan lainnya yang ditugaskan pimpinan',
    rencanaAksi: 'Melaksanakan tugas kepanitiaan dan menyusun SPJ kegiatan.',
    targetKuantitas: 2,
    satuan: 'SK & Laporan',
    kataKunci: ['rapat', 'panitia', 'koordinator', 'spj', 'dinas'],
    driveFolderId: 'folder-rhk-4',
    driveFolderName: 'RHK 4, Tugas Kedinasan Lain',
    driveLink: 'https://drive.google.com/drive/folders/1MockRhkFolder_04?usp=sharing',
  },
];

const DEFAULT_LAPORAN: DocLaporanHarian[] = [
  {
    _id: 'lap-1',
    kunciGrup: '2026-10-24|kbm aljabar linier kelas viii-c',
    tanggal: '2026-10-24',
    jamKegiatan: '08.30.00',
    namaKegiatan: 'KBM Aljabar Linier Kelas VIII-C',
    lokasi: 'Ruang Kelas VIII-C',
    uraian: 'Terlaksananya kegiatan belajar mengajar berdiferensiasi materi Aljabar Linier dan asesmen formatif lembar kerja siswa.',
    uraianStatus: 'ai',
    driveFolderId: 'drive-folder-lap-1',
    driveLink: 'https://drive.google.com/drive/folders/1MockLapFolder_01?usp=sharing',
    jumlahFoto: 2,
    rhkShortcutRhkId: 'rhk-1',
  },
  {
    _id: 'lap-2',
    kunciGrup: '2026-10-27|bimbingan intensif persiapan osn',
    tanggal: '2026-10-27',
    jamKegiatan: '13.15.00',
    namaKegiatan: 'Bimbingan Intensif Persiapan OSN',
    lokasi: 'Laboratorium Komputer',
    uraian: 'Melaksanakan bimbingan intensif penyelesaian soal OSN Matematika untuk 6 siswa delegasi sekolah.',
    uraianStatus: 'ai',
    driveFolderId: 'drive-folder-lap-2',
    driveLink: 'https://drive.google.com/drive/folders/1MockLapFolder_02?usp=sharing',
    jumlahFoto: 3,
    rhkShortcutRhkId: 'rhk-2',
  },
  {
    _id: 'lap-3',
    kunciGrup: '2026-10-29|rapat koordinasi panitia p5',
    tanggal: '2026-10-29',
    jamKegiatan: '10.00.00',
    namaKegiatan: 'Rapat Koordinasi Panitia P5',
    lokasi: 'Ruang Rapat Guru',
    uraian: 'Terselenggaranya rapat koordinasi fasilitator proyek P5 tema Kewirausahaan dan penyusunan instrumen evaluasi karya.',
    uraianStatus: 'ai',
    driveFolderId: 'drive-folder-lap-3',
    driveLink: 'https://drive.google.com/drive/folders/1MockLapFolder_03?usp=sharing',
    jumlahFoto: 4,
    rhkShortcutRhkId: 'rhk-4',
  },
];

// Initial mock raw photos parsed from Timemark GPS naming convention
const INITIAL_RAW_PHOTOS: DrivePhotoItem[] = [
  {
    id: 'photo-raw-1',
    name: '20261029_115052_Ruang Kelas VIII_Judul-KBM Matematika Bab Persamaan.jpg',
    thumbnailLink: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=150&q=80',
    webViewLink: 'https://drive.google.com/file/d/1MockRawPhoto_01/view?usp=sharing',
    parsed: parsePhotoName('20261029_115052_Ruang Kelas VIII_Judul-KBM Matematika Bab Persamaan.jpg'),
  },
  {
    id: 'photo-raw-2',
    name: '20261029_115510_Ruang Kelas VIII_Judul-KBM Matematika Bab Persamaan.jpg',
    thumbnailLink: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=150&q=80',
    webViewLink: 'https://drive.google.com/file/d/1MockRawPhoto_02/view?usp=sharing',
    parsed: parsePhotoName('20261029_115510_Ruang Kelas VIII_Judul-KBM Matematika Bab Persamaan.jpg'),
  },
  {
    id: 'photo-raw-3',
    name: '20261030_091520_Laboratorium IPA_Judul-Bimbingan Praktikum Siswa.jpg',
    thumbnailLink: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80',
    webViewLink: 'https://drive.google.com/file/d/1MockRawPhoto_03/view?usp=sharing',
    parsed: parsePhotoName('20261030_091520_Laboratorium IPA_Judul-Bimbingan Praktikum Siswa.jpg'),
  },
  {
    id: 'photo-raw-4',
    name: '20261031_140000_Aula Sekolah_Judul-Rapat Dinas Evaluasi Kinerja.jpg',
    thumbnailLink: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=150&q=80',
    webViewLink: 'https://drive.google.com/file/d/1MockRawPhoto_04/view?usp=sharing',
    parsed: parsePhotoName('20261031_140000_Aula Sekolah_Judul-Rapat Dinas Evaluasi Kinerja.jpg'),
  },
];

const EkinContext = createContext<EkinContextType | null>(null);

export const EkinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth
  const [user, setUser] = useState<{ name: string; email: string; avatarUrl?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('cloudekin_user');
      return saved ? JSON.parse(saved) : { name: 'Dra. Hj. Nurul Hidayati', email: 'nurul.asn@surabaya.go.id' };
    } catch {
      return { name: 'Dra. Hj. Nurul Hidayati', email: 'nurul.asn@surabaya.go.id' };
    }
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Profile
  const [profil, setProfil] = useState<DocProfil>(() => {
    try {
      const saved = localStorage.getItem('cloudekin_doc_profil');
      return saved ? JSON.parse(saved) : DEFAULT_PROFIL;
    } catch {
      return DEFAULT_PROFIL;
    }
  });

  // RHK
  const [rhkList, setRhkList] = useState<DocRhk[]>(() => {
    try {
      const saved = localStorage.getItem('cloudekin_doc_rhk');
      return saved ? JSON.parse(saved) : DEFAULT_RHK;
    } catch {
      return DEFAULT_RHK;
    }
  });

  // Laporan Harian
  const [laporanList, setLaporanList] = useState<DocLaporanHarian[]>(() => {
    try {
      const saved = localStorage.getItem('cloudekin_doc_laporan');
      return saved ? JSON.parse(saved) : DEFAULT_LAPORAN;
    } catch {
      return DEFAULT_LAPORAN;
    }
  });

  // Google Drive
  const [isDriveConnected, setIsDriveConnected] = useState(true);
  const [driveEmail, setDriveEmail] = useState<string | undefined>('nurul.asn@surabaya.go.id');
  const [rawFolderId, setRawFolderId] = useState<string | undefined>('folder-raw-timemark-asn');
  const [rawFolderName, setRawFolderName] = useState<string | undefined>('FOTO TIMEMARK GPS HARIAN');
  const [rawPhotos, setRawPhotos] = useState<DrivePhotoItem[]>(INITIAL_RAW_PHOTOS);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('cloudekin_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cloudekin_doc_profil', JSON.stringify(profil));
  }, [profil]);

  useEffect(() => {
    localStorage.setItem('cloudekin_doc_rhk', JSON.stringify(rhkList));
  }, [rhkList]);

  useEffect(() => {
    localStorage.setItem('cloudekin_doc_laporan', JSON.stringify(laporanList));
  }, [laporanList]);

  // Init Firebase Auth on mount
  useEffect(() => {
    const unsub = initAuth(
      (fbUser, token) => {
        setUser({
          name: fbUser.displayName || 'Pegawai ASN',
          email: fbUser.email || 'asn@gov.id',
          avatarUrl: fbUser.photoURL || undefined,
        });
        setIsDriveConnected(true);
        setDriveEmail(fbUser.email || undefined);
        setCachedAccessToken(token);
      },
      () => {
        // preserve logged in state if user already configured
      }
    );
    return () => unsub();
  }, []);

  const signIn = async () => {
    setIsLoadingAuth(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser({
          name: res.user.displayName || 'Pegawai ASN',
          email: res.user.email || 'asn@gov.id',
          avatarUrl: res.user.photoURL || undefined,
        });
        setIsDriveConnected(true);
        setDriveEmail(res.user.email || undefined);
      }
    } catch (e) {
      console.error('Sign in error:', e);
      // Fallback local sign in
      setUser({
        name: profil.namaLengkap || 'Pegawai ASN',
        email: 'asn.kinerja@surabaya.go.id',
      });
      setIsDriveConnected(true);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signOut = async () => {
    await logoutGoogle();
    setUser(null);
    setIsDriveConnected(false);
  };

  const updateProfil = (data: Partial<DocProfil>) => {
    setProfil((prev) => ({ ...prev, ...data }));
  };

  const setFotoProfil = (url: string) => {
    setProfil((prev) => ({ ...prev, fotoUrl: url }));
  };

  const removeFotoProfil = () => {
    setProfil((prev) => ({ ...prev, fotoUrl: undefined }));
  };

  const addRhk = (data: Omit<DocRhk, '_id'>) => {
    const newItem: DocRhk = {
      ...data,
      _id: `rhk-${Date.now()}`,
    };
    setRhkList((prev) => [...prev, newItem]);
  };

  const updateRhk = (updated: DocRhk) => {
    setRhkList((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  };

  const deleteRhk = (id: string) => {
    setRhkList((prev) => prev.filter((r) => r._id !== id));
  };

  const getLaporanByMonth = (bulan: string): DocLaporanHarian[] => {
    return laporanList
      .filter((l) => l.tanggal.startsWith(bulan))
      .sort((a, b) => (b.tanggal + b.jamKegiatan).localeCompare(a.tanggal + a.jamKegiatan));
  };

  const updateLaporan = (id: string, updates: Partial<DocLaporanHarian>) => {
    setLaporanList((prev) =>
      prev.map((l) => (l._id === id ? { ...l, ...updates } : l))
    );
  };

  const deleteLaporan = (id: string) => {
    setLaporanList((prev) => prev.filter((l) => l._id !== id));
  };

  const regenerateAiUraian = async (id: string) => {
    const item = laporanList.find((l) => l._id === id);
    if (!item) return;

    updateLaporan(id, { uraianStatus: 'pending' });

    try {
      const rhkParent = rhkList.find((r) => r._id === item.rhkShortcutRhkId);
      const res = await fetch('/api/ai/suggest-uraian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityKeyword: item.namaKegiatan,
          rhkContext: rhkParent?.namaRhk || '',
          roleContext: `${profil.jabatan} di ${profil.pangkat}`,
        }),
      });

      const data = await res.json();
      const firstSuggestion = data.suggestions?.[0]?.uraian;
      if (firstSuggestion) {
        updateLaporan(id, {
          uraian: firstSuggestion,
          uraianStatus: 'ai',
        });
      } else {
        updateLaporan(id, {
          uraian: `Terlaksananya kegiatan ${item.namaKegiatan} secara tertib dan terdokumentasi sesuai standar operasional prosedur.`,
          uraianStatus: 'ai',
        });
      }
    } catch {
      updateLaporan(id, {
        uraian: `Terlaksananya kegiatan ${item.namaKegiatan} secara tertib dan terdokumentasi sesuai standar operasional prosedur.`,
        uraianStatus: 'ai',
      });
    }
  };

  const syncNewPhotos = async () => {
    const validPhotos = rawPhotos.filter((p) => p.parsed !== null);
    const unreadableCount = rawPhotos.length - validPhotos.length;

    if (validPhotos.length === 0) {
      return { dipindah: 0, kegiatanBaru: 0, dilewati: unreadableCount, sisa: false };
    }

    const groups = groupPhotos(
      validPhotos.map((p) => ({
        id: p.id,
        parsed: p.parsed!,
      }))
    );

    let kegiatanBaruCount = 0;
    const newLaporanItems: DocLaporanHarian[] = [];

    for (const g of groups) {
      const existing = laporanList.find((l) => l.kunciGrup === g.kunciGrup);
      if (existing) {
        updateLaporan(existing._id, {
          jumlahFoto: existing.jumlahFoto + g.fileIds.length,
        });
      } else {
        kegiatanBaruCount++;
        const matched = matchRhk(g.judul, rhkList);

        const newLaporan: DocLaporanHarian = {
          _id: `lap-gen-${Date.now()}-${kegiatanBaruCount}`,
          kunciGrup: g.kunciGrup,
          tanggal: g.tanggal,
          jamKegiatan: g.jam,
          namaKegiatan: g.judul,
          lokasi: g.lokasi,
          uraian: `Terselenggaranya kegiatan ${g.judul} secara tertib, bertanggung jawab, dan terdokumentasi sesuai SKP ASN.`,
          uraianStatus: 'ai',
          driveFolderId: `folder-keg-${Date.now()}`,
          driveLink: `https://drive.google.com/drive/folders/1MockKegiatan_${g.tanggal.replace(/-/g, '')}?usp=sharing`,
          jumlahFoto: g.fileIds.length,
          rhkShortcutRhkId: matched?._id,
        };

        newLaporanItems.push(newLaporan);
      }
    }

    setLaporanList((prev) => [...newLaporanItems, ...prev]);

    return {
      dipindah: validPhotos.length,
      kegiatanBaru: kegiatanBaruCount,
      dilewati: unreadableCount,
      sisa: false,
    };
  };

  const setRawFolder = (id: string, name: string) => {
    setRawFolderId(id);
    setRawFolderName(name);
  };

  const refreshRawPhotos = async () => {
    // If real Drive token exists, query actual Drive folder
    const token = await getAccessToken();
    if (token && rawFolderId && !rawFolderId.startsWith('folder-raw-')) {
      try {
        const files = await listFilesInFolder(token, rawFolderId);
        const mapped = files.map((f) => ({
          id: f.id,
          name: f.name,
          webViewLink: f.webViewLink,
          parsed: parsePhotoName(f.name),
        }));
        setRawPhotos(mapped);
        return;
      } catch (err) {
        console.warn('Could not list real drive files, keeping current state:', err);
      }
    }
    // Refresh with current raw photos
    setRawPhotos([...INITIAL_RAW_PHOTOS]);
  };

  const syncRhkDriveFolders = async () => {
    const token = await getAccessToken();
    if (token) {
      try {
        const root = await createDriveFolder(token, `RHK RENCANA AKSI ASN - ${profil.namaLengkap}`);
        const updatedRhk = [...rhkList];

        for (const rhk of updatedRhk) {
          const sub = await createDriveFolder(token, `RHK ${rhk.nomor}, ${rhk.namaRhk.slice(0, 35)}`, root.id);
          rhk.driveFolderId = sub.id;
          rhk.driveFolderName = sub.name;
          rhk.driveLink = sub.webViewLink;
        }

        setRhkList(updatedRhk);
        return { folderRhk: updatedRhk.length, dipetakan: laporanList.length, sisa: false };
      } catch (err) {
        console.warn('Real drive creation warning, updating links locally:', err);
      }
    }

    // Local fallback update
    const updated = rhkList.map((r) => ({
      ...r,
      driveFolderId: `folder-${r._id}`,
      driveFolderName: `RHK ${r.nomor}, ${r.namaRhk.slice(0, 30)}`,
      driveLink: `https://drive.google.com/drive/folders/1RhkFolder_${r.nomor}_Publik?usp=sharing`,
    }));

    setRhkList(updated);
    return { folderRhk: updated.length, dipetakan: laporanList.length, sisa: false };
  };

  const connectDrive = async () => {
    await signIn();
  };

  const disconnectDrive = async () => {
    await signOut();
  };

  const getRekapByYear = (tahun: string): RekapYearData => {
    const yearReports = laporanList.filter((l) => l.tanggal.startsWith(tahun));
    let tanpaRhk = 0;

    const rhkRekap: RekapRhkData[] = rhkList.map((rhk) => {
      const matchedReports = yearReports.filter((l) => l.rhkShortcutRhkId === rhk._id);
      const totalFotos = matchedReports.reduce((sum, item) => sum + (item.jumlahFoto || 1), 0);

      return {
        ...rhk,
        realisasi: matchedReports.length,
        jumlahFoto: totalFotos,
        kegiatan: matchedReports,
      };
    });

    tanpaRhk = yearReports.filter((l) => !l.rhkShortcutRhkId).length;

    return {
      tahun,
      totalKegiatan: yearReports.length,
      tanpaRhk,
      rhk: rhkRekap,
    };
  };

  return (
    <EkinContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoadingAuth,
        signIn,
        signOut,
        profil,
        updateProfil,
        setFotoProfil,
        removeFotoProfil,
        rhkList,
        addRhk,
        updateRhk,
        deleteRhk,
        laporanList,
        getLaporanByMonth,
        updateLaporan,
        deleteLaporan,
        regenerateAiUraian,
        syncNewPhotos,
        isDriveConnected,
        driveEmail,
        rawFolderId,
        rawFolderName,
        setRawFolder,
        rawPhotos,
        refreshRawPhotos,
        syncRhkDriveFolders,
        connectDrive,
        disconnectDrive,
        getRekapByYear,
      }}
    >
      {children}
    </EkinContext.Provider>
  );
};

export const useEkin = () => {
  const context = useContext(EkinContext);
  if (!context) {
    throw new Error('useEkin must be used within an EkinProvider');
  }
  return context;
};
