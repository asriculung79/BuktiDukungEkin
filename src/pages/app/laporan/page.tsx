import { useState } from "react";
import { Link } from "react-router-dom";
import { addMonths, format, parse } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, FolderSync, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { DocLaporanHarian } from "@/types";
import { useEkin } from "@/context/EkinContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LaporanTable from "./_components/laporan-table";
import EditKegiatanDialog from "./_components/edit-kegiatan-dialog";

type Row = DocLaporanHarian;

function MonthSwitcher({ bulan, onChange }: { bulan: string; onChange: (b: string) => void }) {
  const date = parse(bulan, "yyyy-MM", new Date());
  const shift = (n: number) => onChange(format(addMonths(date, n), "yyyy-MM"));

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-card p-1 shadow-2xs">
      <Button
        size="icon"
        variant="ghost"
        className="size-8"
        aria-label="Bulan sebelumnya"
        onClick={() => shift(-1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <div className="min-w-36 text-center text-sm font-semibold capitalize">
        {format(date, "MMMM yyyy", { locale: localeId })}
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="size-8"
        aria-label="Bulan berikutnya"
        onClick={() => shift(1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

function SyncButton({ disabled }: { disabled: boolean }) {
  const { syncNewPhotos } = useEkin();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const r = await syncNewPhotos();
      if (r.dipindah === 0) {
        toast(
          r.dilewati > 0
            ? `Tidak ada foto baru. ${r.dilewati} foto dilewati karena format tanggal di nama file tidak terbaca.`
            : "Tidak ada foto baru di folder data mentah.",
        );
      } else {
        toast.success(
          `${r.dipindah} foto berhasil diproses, ${r.kegiatanBaru} kegiatan baru ditambahkan ke laporan harian.${
            r.sisa ? " Masih ada foto lain, klik Proses lagi." : ""
          }`,
        );
      }
    } catch {
      toast.error("Gagal memproses foto");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      onClick={run}
      disabled={disabled || busy}
      className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 font-semibold"
    >
      {busy ? <Spinner /> : <RefreshCcw className="size-4" />}
      {busy ? "Memproses foto..." : "Proses foto baru"}
    </Button>
  );
}

export default function LaporanPage() {
  const [bulan, setBulan] = useState(() => format(new Date(), "yyyy-MM"));
  const { isDriveConnected, rawFolderId, getLaporanByMonth, deleteLaporan } = useEkin();
  const rows = getLaporanByMonth(bulan);

  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const ready = Boolean(isDriveConnected && rawFolderId);

  const confirmDelete = () => {
    if (!deleting) return;
    deleteLaporan(deleting._id);
    toast.success("Baris kegiatan dihapus dari laporan");
    setDeleting(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Laporan Harian</h1>
          <p className="pt-1 text-sm text-muted-foreground">
            Foto Timemark dipilah otomatis per tanggal/kegiatan. Foto sejenis dalam satu hari digabung menjadi satu baris dan satu link Google Drive.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MonthSwitcher bulan={bulan} onChange={setBulan} />
          <SyncButton disabled={!ready} />
        </div>
      </div>

      {!ready && (
        <div className="flex flex-col gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 sm:flex-row sm:items-center">
          <FolderSync className="size-5 shrink-0 text-accent" />
          <p className="flex-1 text-sm">
            Hubungkan Google Drive dan pilih folder data mentah agar foto Timemark GPS bisa diproses otomatis.
          </p>
          <Button asChild size="sm">
            <Link to="/app/drive">Buka Google Drive</Link>
          </Button>
        </div>
      )}

      {rows.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarDays />
            </EmptyMedia>
            <EmptyTitle>Belum ada kegiatan di bulan ini</EmptyTitle>
            <EmptyDescription>
              Klik "Proses foto baru" untuk memindahkan foto dari folder data mentah Timemark dan menyusun laporan harian secara otomatis.
            </EmptyDescription>
          </EmptyHeader>
          {ready && (
            <EmptyContent>
              <SyncButton disabled={false} />
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <LaporanTable rows={rows} onEdit={setEditing} onDelete={setDeleting} />
      )}

      <EditKegiatanDialog row={editing} onOpenChange={(o) => !o && setEditing(null)} />

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kegiatan ini dari laporan?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.namaKegiatan}" akan dihapus dari tabel laporan. Foto dan berkas asli di Google Drive tetap aman.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
