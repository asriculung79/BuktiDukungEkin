import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google Gemini AI server-side using the recommended pattern
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Endpoint: AI Uraian Kinerja ASN Generator
app.post('/api/ai/suggest-uraian', async (req: Request, res: Response): Promise<void> => {
  try {
    const { activityKeyword, rhkContext, roleContext } = req.body;

    if (!activityKeyword) {
      res.status(400).json({ error: 'Kata kunci kegiatan diperlukan.' });
      return;
    }

    const prompt = `Anda adalah asisten spesialis penyusunan Sasaran Kinerja Pegawai (SKP) dan e-Kinerja Aparatur Sipil Negara (ASN / PNS / PPPK / Guru) sesuai PermenPAN-RB No. 6 Tahun 2022 di Indonesia.
Berdasarkan informasi berikut:
- Kegiatan dasar: "${activityKeyword}"
- Konteks RHK: "${rhkContext || 'Kinerja Pelayanan Publik / Pembelajaran'}"
- Jabatan/Peran: "${roleContext || 'Pegawai ASN / Guru'}"

Buatlah 3 (tiga) variasi kalimat Uraian Realisasi Kinerja yang formal, baku, profesional, dan berorientasi hasil (menggunakan kata kerja operasional seperti Melaksanakan, Menyusun, Mengkoordinasikan, Mengevaluasi, Mendokumentasikan).
Sertakan juga saran bukti dukung yang lazim diunggah ke Google Drive / e-Kinerja BKN (contoh: Laporan, Surat Tugas, Notula Rapat, Daftar Hadir, Foto Kegiatan, Modul Ajar).

Kembalikan jawaban DALAM FORMAT JSON dengan struktur:
{
  "suggestions": [
    {
      "title": "Variasi 1 (Lengkap)",
      "uraian": "Teks uraian kegiatan formal...",
      "buktiDukungSaran": "Nama jenis dokumen bukti dukung"
    },
    {
      "title": "Variasi 2 (Ringkas)",
      "uraian": "Teks uraian kegiatan ringkas...",
      "buktiDukungSaran": "Nama jenis dokumen bukti dukung"
    },
    {
      "title": "Variasi 3 (Berorientasi Output)",
      "uraian": "Teks uraian berfokus pada hasil kerja...",
      "buktiDukungSaran": "Nama jenis dokumen bukti dukung"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI uraian:', error);
    // Graceful fallback suggestions if API key is not configured or network error
    res.json({
      suggestions: [
        {
          title: "Format Standar ASN",
          uraian: `Melaksanakan kegiatan ${req.body.activityKeyword || 'tugas kedinasan'} secara cermat, bertanggung jawab, dan terdokumentasi sesuai standar operasional prosedur yang berlaku.`,
          buktiDukungSaran: "Laporan Pelaksanaan Kegiatan dan Dokumentasi Foto"
        },
        {
          title: "Format Berorientasi Hasil",
          uraian: `Menyelesaikan dan melaporkan output kegiatan ${req.body.activityKeyword || 'kinerja'} sebagai pemenuhan target Rencana Hasil Kerja (RHK) periode berjalan.`,
          buktiDukungSaran: "Notula, Daftar Hadir, dan Berita Acara"
        },
        {
          title: "Format Administrasi / Pembelajaran",
          uraian: `Menyusun dokumen pendukung dan mengevaluasi ketercapaian kegiatan ${req.body.activityKeyword || 'kinerja'} untuk meningkatkan mutu pelayanan.`,
          buktiDukungSaran: "Dokumen Rekapitulasi dan Lembar Pengesahan"
        }
      ]
    });
  }
});

// Endpoint: AI Formulasi RHK Generator
app.post('/api/ai/suggest-rhk', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, unitKerja } = req.body;

    const prompt = `Buatkan 4 (empat) contoh Rencana Hasil Kerja (RHK) ASN (3 RHK Utama dan 1 RHK Tambahan) yang relevan untuk jabatan: "${role || 'Guru / Pegawai Administrasi'}" di unit kerja: "${unitKerja || 'Instansi Pemerintah'}".
Format RHK harus sesuai standar PermenPAN-RB No. 6 Tahun 2022 (berorientasi hasil output/outcome).
Sertakan target kuantitas, satuan yang lazim, target waktu (12 bulan), target kualitas (100%), dan rencana aksi.

Kembalikan jawaban DALAM FORMAT JSON:
{
  "rhkList": [
    {
      "jenis": "utama",
      "deskripsi": "Contoh kalimat RHK Utama...",
      "targetKuantitas": 12,
      "satuanKuantitas": "Laporan",
      "rencanaAksi": "Menyusun agenda, mengumpulkan data, dan melaporkan secara berkala.",
      "folderName": "RHK 1 - Pelaksanaan Tugas Pokok"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating RHK:', error);
    res.json({
      rhkList: [
        {
          jenis: "utama",
          deskripsi: "Terlaksananya penyusunan perangkat kerja dan perencanaan kegiatan secara berkala",
          targetKuantitas: 12,
          satuanKuantitas: "Dokumen",
          rencanaAksi: "Menyusun instrumen rencana dan mengkoordinasikan dengan atasan langsung setiap awal bulan.",
          folderName: "RHK 1 - Perencanaan Kerja"
        },
        {
          jenis: "utama",
          deskripsi: "Terlaksananya pelayanan dan pendampingan teknis sesuai standar pelayanan prima",
          targetKuantitas: 12,
          satuanKuantitas: "Laporan",
          rencanaAksi: "Memberikan pelayanan harian dan mencatat rekapitulasi kepuasan layanan.",
          folderName: "RHK 2 - Pelayanan dan Pelaksanaan"
        },
        {
          jenis: "utama",
          deskripsi: "Tersusunnya laporan evaluasi kinerja dan tindak lanjut perbaikan mutu",
          targetKuantitas: 4,
          satuanKuantitas: "Laporan Triwulan",
          rencanaAksi: "Menganalisis capaian triwulanan dan merumuskan rekomendasi tindak lanjut.",
          folderName: "RHK 3 - Evaluasi Kinerja"
        },
        {
          jenis: "tambahan",
          deskripsi: "Terlaksananya peran serta dalam kepanitiaan atau tugas kedinasan lainnya yang ditugaskan pimpinan",
          targetKuantitas: 2,
          satuanKuantitas: "Surat Tugas",
          rencanaAksi: "Melaksanakan tugas kepanitiaan dan menyusun laporan pertanggungjawaban kegiatan.",
          folderName: "RHK Tambahan - Tugas Kedinasan Lain"
        }
      ]
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CloudEkin Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
