import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, FolderSync, QrCode, Smartphone, Target, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useEkin } from "@/context/EkinContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeviceShareModal from "@/components/DeviceShareModal";

const STEPS = [
  {
    icon: Target,
    title: "Isi RHK & Rencana Aksi",
    text: "Masukkan RHK, target SKP, dan kata kunci pemetaan foto.",
    to: "/app/rhk",
  },
  {
    icon: FolderSync,
    title: "Hubungkan Google Drive",
    text: "Pilih folder data mentah foto Timemark GPS.",
    to: "/app/drive",
  },
  {
    icon: CalendarDays,
    title: "Laporan Harian",
    text: "Foto dipilah per tanggal dan disusun rapi jadi tabel kegiatan.",
    to: "/app/laporan",
  },
  {
    icon: Trophy,
    title: "Rekap Realisasi",
    text: "Lihat realisasi per RHK dan salin link bukti dukung siap tempel di BKN.",
    to: "/app/rekap",
  },
];

export default function DashboardPage() {
  const [shareOpen, setShareOpen] = useState(false);
  const { user } = useAuth();
  const { rhkList, profil } = useEkin();
  const totalTarget = rhkList.reduce((s, r) => s + (r.targetKuantitas || 0), 0);
  const displayName = profil?.namaLengkap || user?.profile.name || "Pegawai ASN";

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-sidebar p-6 text-sidebar-foreground md:p-8 shadow-lg border border-sidebar-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.8_0.13_80/0.25),transparent_60%)]" />
        <div className="relative">
          <div className="text-sm text-sidebar-foreground/60 font-medium">Selamat datang,</div>
          <h1 className="pt-1 font-serif text-2xl sm:text-3xl font-bold text-balance text-white">
            {displayName}
          </h1>
          <p className="text-xs text-sidebar-primary mt-1 font-medium">
            {profil?.jabatan || "Pejabat Fungsional ASN"} &middot; {profil?.pangkat || "PNS/PPPK"}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6 sm:max-w-md">
            <div className="rounded-xl bg-sidebar-accent/50 p-3.5 border border-sidebar-border/60">
              <div className="text-xs text-sidebar-foreground/60">Jumlah RHK</div>
              <div className="pt-0.5 text-3xl font-bold text-sidebar-primary tabular-nums">
                {rhkList.length}
              </div>
            </div>
            <div className="rounded-xl bg-sidebar-accent/50 p-3.5 border border-sidebar-border/60">
              <div className="text-xs text-sidebar-foreground/60">Total Target SKP</div>
              <div className="pt-0.5 text-3xl font-bold text-sidebar-primary tabular-nums">
                {totalTarget}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Quick Action: Uji di HP */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Smartphone className="size-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-200">Uji Coba di HP & Pasang Aplikasi (PWA)</div>
              <div className="text-[11px] text-emerald-300/70">Scan QR Code dengan kamera HP atau buka link langsung</div>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => setShareOpen(true)}
            className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold gap-1.5 h-8 text-xs cursor-pointer shadow-sm"
          >
            <QrCode className="size-3.5" /> Buka di HP / Scan QR
          </Button>
        </div>
      </div>

      <DeviceShareModal open={shareOpen} onOpenChange={setShareOpen} />

      {/* Alur Kerja 4 Steps */}
      <div>
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-semibold tracking-tight">Alur Kerja Otomatisasi</h2>
          <span className="text-xs text-muted-foreground">Langkah 1 sampai 4</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="gap-0 py-5 hover:border-sidebar-primary/50 transition-all duration-200 shadow-xs hover:shadow-md">
              <CardContent className="flex h-full flex-col px-5">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    <s.icon className="size-5 text-accent" />
                  </div>
                  <span className="font-serif text-2xl font-bold text-muted-foreground/30">
                    0{i + 1}
                  </span>
                </div>
                <div className="pt-4 font-semibold text-foreground">{s.title}</div>
                <p className="flex-1 pt-1 text-xs text-muted-foreground leading-relaxed">
                  {s.text}
                </p>
                <div className="pt-4">
                  <Button asChild size="sm" className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 font-medium">
                    <Link to={s.to}>
                      Buka <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
