import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, FolderTree, Target, Trophy, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useEkin } from "@/context/EkinContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import RhkRekapCard from "./_components/rhk-rekap-card";
import { percent } from "./_lib/utils";

function SyncDriveButton({ disabled }: { disabled: boolean }) {
  const { syncRhkDriveFolders } = useEkin();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const r = await syncRhkDriveFolders();
      toast.success(
        `${r.folderRhk} folder RHK siap di Google Drive, ${r.dipetakan} kegiatan baru disinkronkan.${
          r.sisa ? " Masih ada sisa, klik lagi." : ""
        }`,
      );
    } catch {
      toast.error("Gagal sinkronisasi folder RHK ke Google Drive");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      onClick={run}
      disabled={disabled || busy}
      className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 font-semibold text-xs"
    >
      {busy ? <Spinner /> : <FolderTree className="size-4" />}
      {busy ? "Menyinkronkan..." : "Sinkronkan folder RHK ke Drive"}
    </Button>
  );
}

export default function RekapPage() {
  const [tahun, setTahun] = useState(() => String(new Date().getFullYear()));
  const { getRekapByYear, isDriveConnected } = useEkin();
  const data = getRekapByYear(tahun);

  const totalTarget = data.rhk.reduce((s, r) => s + (r.targetKuantitas || 0), 0);
  const totalRealisasi = data.rhk.reduce((s, r) => s + (r.realisasi || 0), 0);
  const overall = percent(totalRealisasi, totalTarget);

  const stats = [
    { label: "Capaian keseluruhan", value: `${overall}%` },
    { label: "Realisasi / Target", value: `${totalRealisasi} / ${totalTarget}` },
    { label: "Total kegiatan", value: String(data.totalKegiatan ?? 0) },
    { label: "Tanpa RHK", value: String(data.tanpaRhk ?? 0) },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Banner with stats */}
      <div className="relative overflow-hidden rounded-2xl bg-sidebar p-6 text-sidebar-foreground md:p-8 shadow-lg border border-sidebar-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.8_0.13_80/0.28),transparent_60%)]" />
        <div className="relative space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-sidebar-primary uppercase">
                <Trophy className="size-4" /> Rekap Realisasi SKP
              </div>
              <h1 className="pt-2 font-serif text-2xl sm:text-3xl font-bold text-balance text-white">
                Capaian Realisasi SKP per RHK
              </h1>
              <p className="max-w-xl pt-1 text-xs sm:text-sm text-sidebar-foreground/75 leading-relaxed">
                Kegiatan otomatis dipetakan ke RHK berdasarkan kata kunci di judul foto Timemark. Satu kegiatan terhitung satu pemenuhan realisasi.
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-1 shadow-2xs">
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-sidebar-foreground hover:bg-sidebar-accent"
                aria-label="Tahun sebelumnya"
                onClick={() => setTahun(String(Number(tahun) - 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="w-14 text-center font-bold tabular-nums text-white">{tahun}</div>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-sidebar-foreground hover:bg-sidebar-accent"
                aria-label="Tahun berikutnya"
                onClick={() => setTahun(String(Number(tahun) + 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3.5 sm:p-4 shadow-2xs"
              >
                <div className="text-[11px] sm:text-xs text-sidebar-foreground/60">{s.label}</div>
                <div className="pt-1 font-serif text-xl sm:text-2xl font-bold text-sidebar-primary tabular-nums">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drive Sync Callout */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center shadow-xs">
        <FolderTree className="size-5 shrink-0 text-accent" />
        <p className="flex-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Buat folder <span className="font-semibold text-foreground">RHK RENCANA AKSI</span> di Google Drive. Setiap RHK mendapat subfolder publik berisi pintasan ke folder kegiatan yang cocok untuk BKN.
        </p>
        {isDriveConnected ? (
          <SyncDriveButton disabled={data.rhk.length === 0} />
        ) : (
          <Button asChild size="sm" className="bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
            <Link to="/app/drive">Hubungkan Google Drive</Link>
          </Button>
        )}
      </div>

      {data.tanpaRhk > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 text-xs sm:text-sm text-accent-foreground">
          <TriangleAlert className="size-4 shrink-0 translate-y-0.5 text-accent" />
          <p className="flex-1">
            {data.tanpaRhk} kegiatan belum cocok dengan kata kunci RHK mana pun. Tambahkan kata kunci di{" "}
            <Link to="/app/rhk" className="font-semibold underline">
              Data RHK
            </Link>{" "}
            agar kegiatan dapat direkap otomatis.
          </p>
        </div>
      )}

      {data.rhk.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Target />
            </EmptyMedia>
            <EmptyTitle>Belum ada RHK</EmptyTitle>
            <EmptyDescription>
              Isi RHK dan Rencana Aksi beserta kata kunci agar kegiatan harian dapat direkap secara otomatis.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size="sm">
              <Link to="/app/rhk">Isi Data RHK</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          {data.rhk.map((r, i) => (
            <RhkRekapCard key={r._id} rhk={r} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
