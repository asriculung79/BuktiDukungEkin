import { useState } from "react";
import { 
  CheckCircle2, 
  FolderInput, 
  FolderSync, 
  RefreshCcw, 
  Unplug, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  ExternalLink 
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import SetupGuide from "./_components/setup-guide";
import FolderPickerDialog from "./_components/folder-picker-dialog";
import PhotoList from "./_components/photo-list";
import { useEkin } from "@/context/EkinContext";

export default function DrivePage() {
  const { 
    isDriveConnected, 
    driveEmail, 
    rawFolderId, 
    rawFolderName, 
    connectDrive, 
    disconnectDrive, 
    refreshRawPhotos, 
    syncNewPhotos, 
    syncRhkDriveFolders,
    rawPhotos
  } = useEkin();

  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [syncingPhotos, setSyncingPhotos] = useState(false);
  const [syncingRhk, setSyncingRhk] = useState(false);

  const handleConnect = async () => {
    setBusy(true);
    try {
      await connectDrive();
      toast.success("Google Drive berhasil dihubungkan!");
    } catch {
      toast.error("Gagal menghubungkan Google Drive. Mengaktifkan mode lokal.");
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      await disconnectDrive();
      toast.success("Google Drive diputuskan.");
    } catch {
      toast.error("Gagal memutuskan koneksi.");
    } finally {
      setBusy(false);
    }
  };

  const handleRefreshPhotos = async () => {
    setBusy(true);
    try {
      await refreshRawPhotos();
      toast.success("Daftar foto berhasil diperbarui.");
    } catch {
      toast.error("Gagal memperbarui foto.");
    } finally {
      setBusy(false);
    }
  };

  const handleSyncToLaporan = async () => {
    setSyncingPhotos(true);
    try {
      const res = await syncNewPhotos();
      toast.success(`Berhasil! ${res.kegiatanBaru} kegiatan baru dibuat dari ${res.dipindah} foto Timemark.`);
    } catch {
      toast.error("Gagal memproses foto ke laporan.");
    } finally {
      setSyncingPhotos(false);
    }
  };

  const handleSyncRhkFolders = async () => {
    setSyncingRhk(true);
    try {
      const res = await syncRhkDriveFolders();
      toast.success(`Berhasil membuat ${res.folderRhk} folder publik RHK di Google Drive.`);
    } catch {
      toast.error("Gagal sinkronisasi folder RHK.");
    } finally {
      setSyncingRhk(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-accent font-semibold">Integrasi Cloud</span>
            <Badge variant="outline" className="border-accent/40 text-accent text-[11px] font-mono">
              OAuth 2.0 Drive API
            </Badge>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground mt-1">Google Drive</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hubungkan akun Google Drive untuk membaca foto Timemark GPS secara otomatis dan membagikan bukti link publik e-Kinerja BKN.
          </p>
        </div>

        {isDriveConnected && (
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={handleSyncToLaporan} 
              disabled={syncingPhotos}
              className="bg-sidebar-primary text-sidebar-primary-foreground shadow-xs text-xs font-semibold"
            >
              {syncingPhotos ? <Spinner /> : <Sparkles className="size-4 mr-1 text-accent" />}
              Proses Foto ke Laporan
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSyncRhkFolders}
              disabled={syncingRhk}
              className="border-accent/30 hover:bg-accent/10 text-xs font-semibold"
            >
              {syncingRhk ? <Spinner /> : <Layers className="size-4 mr-1 text-accent" />}
              Folder RHK Publik
            </Button>
          </div>
        )}
      </div>

      {/* Connection Status Card */}
      {!isDriveConnected ? (
        <Card className="overflow-hidden border border-accent/30 shadow-sm py-0">
          <CardContent className="flex flex-col items-start gap-5 bg-[radial-gradient(ellipse_at_top_right,oklch(0.8_0.13_80/0.18),transparent_60%)] p-6 sm:flex-row sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sidebar text-sidebar-primary shadow-sm border border-sidebar-border">
                <FolderSync className="size-7" />
              </div>
              <div className="space-y-1">
                <div className="font-serif text-lg font-bold text-foreground">Google Drive Belum Terhubung</div>
                <p className="text-xs text-muted-foreground max-w-xl">
                  Hubungkan akun Google Drive Anda. Aplikasi akan membaca folder foto Timemark GPS harian dan mengelompokkannya secara otomatis berdasarkan tanggal dan judul kegiatan tanpa perlu unggah manual satu per satu.
                </p>
              </div>
            </div>
            <Button 
              onClick={handleConnect} 
              disabled={busy}
              className="bg-sidebar-primary text-sidebar-primary-foreground font-semibold shrink-0 shadow-sm"
            >
              {busy ? <Spinner /> : <FolderSync className="size-4 mr-2" />} 
              Hubungkan Google Drive
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border shadow-xs overflow-hidden py-0">
          <div className="bg-gradient-to-r from-accent/10 via-transparent to-sidebar-primary/10 border-b px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span className="text-xs font-medium text-foreground">Hak Akses Siap: drive.file & drive.metadata.readonly</span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">Mode Sinkronisasi Aktif</span>
          </div>
          <CardContent className="grid gap-5 p-5 md:grid-cols-2">
            <div className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-4/15 text-chart-4">
                <CheckCircle2 className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Terhubung Sebagai Akun Google</div>
                <div className="truncate font-semibold text-foreground text-sm">{driveEmail || "asn@gov.id"}</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  ● Token OAuth Aktif
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <FolderInput className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Folder Data Mentah Timemark</div>
                <div className="truncate font-semibold text-foreground text-sm">
                  {rawFolderName || "Belum dipilih"}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  ID: {rawFolderId || "root"}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t md:col-span-2">
              <Button size="sm" onClick={() => setPickerOpen(true)} className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                <FolderInput className="size-3.5 mr-1" /> {rawFolderId ? "Ganti Folder" : "Pilih Folder"}
              </Button>
              {rawFolderId && (
                <Button size="sm" variant="secondary" onClick={handleRefreshPhotos} disabled={busy} className="text-xs">
                  <RefreshCcw className={`size-3.5 mr-1 ${busy ? "animate-spin" : ""}`} /> Muat Ulang Foto
                </Button>
              )}
              {rawFolderId && (
                <a
                  href={`https://drive.google.com/drive/folders/${rawFolderId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted font-medium transition-colors"
                >
                  <ExternalLink className="size-3.5" /> Buka di Google Drive
                </a>
              )}
              <div className="ml-auto">
                <Button size="sm" variant="ghost" onClick={handleDisconnect} disabled={busy} className="text-xs text-destructive hover:bg-destructive/10">
                  <Unplug className="size-3.5 mr-1" /> Putuskan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guide Accordion */}
      <SetupGuide />

      {/* Photo List */}
      {isDriveConnected && rawFolderId && (
        <PhotoList folderId={rawFolderId} />
      )}

      {/* Folder Picker Modal */}
      <FolderPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} />
    </div>
  );
}
