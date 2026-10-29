import { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, ClipboardCopy, Copy, ExternalLink, FolderOpen, Images } from "lucide-react";
import { RekapRhkData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { formatTanggal } from "@/lib/drive";
import { copyText, percent } from "../_lib/utils";

function ProgressRing({ value }: { value: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(value, 100);

  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 72 72" className="size-20 -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" className="stroke-muted" />
        <motion.circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className={value >= 100 ? "stroke-chart-4" : "stroke-accent"}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (clamped / 100) * c }}
          transition={{ duration: 0.9, ease: "easeOut" as const }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums">
        {value}%
      </div>
    </div>
  );
}

export default function RhkRekapCard({ rhk, index }: { rhk: RekapRhkData; index: number }) {
  const [open, setOpen] = useState(false);
  const pct = percent(rhk.realisasi, rhk.targetKuantitas);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: "easeOut" as const }}
      className="overflow-hidden rounded-2xl border bg-card shadow-xs hover:border-sidebar-primary/50 transition-colors"
    >
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-sidebar text-sidebar-primary shadow-xs">
            <span className="text-[9px] font-semibold tracking-widest text-sidebar-foreground/60">
              RHK
            </span>
            <span className="font-serif text-lg leading-none font-bold">{rhk.nomor}</span>
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="font-semibold break-words text-foreground text-sm sm:text-base leading-snug">
              {rhk.namaRhk}
            </div>
            <p className="text-xs break-words text-muted-foreground leading-relaxed">
              {rhk.rencanaAksi}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {rhk.kataKunci.map((k) => (
                <Badge key={k} variant="secondary" className="text-[11px] font-medium">
                  {k}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:w-64 shrink-0">
          <ProgressRing value={pct} />
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground font-medium">Realisasi / Target</div>
            <div className="font-serif text-2xl font-bold tabular-nums">
              {rhk.realisasi}
              <span className="text-base text-muted-foreground font-normal"> / {rhk.targetKuantitas}</span>
            </div>
            <div className="truncate text-xs text-muted-foreground mt-0.5">
              {rhk.satuan} &middot; {rhk.jumlahFoto} foto bukti
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t bg-muted/40 px-5 py-3">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => copyText(rhk.rencanaAksi, "Nama rencana aksi")}
          className="text-xs font-semibold"
        >
          <ClipboardCopy className="size-3.5" /> Salin rencana aksi
        </Button>
        {rhk.driveLink ? (
          <>
            <Button
              size="sm"
              onClick={() => copyText(rhk.driveLink ?? "", "Link folder RHK untuk BKN")}
              className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 text-xs font-semibold"
            >
              <Copy className="size-3.5" /> Salin link BKN
            </Button>
            <Button asChild size="sm" variant="ghost" className="text-xs">
              <a href={rhk.driveLink} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" /> Buka folder Drive
              </a>
            </Button>
          </>
        ) : (
          <span className="text-xs text-muted-foreground italic">
            Link folder muncul setelah sinkronisasi Drive
          </span>
        )}
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between border-t px-5 py-3 text-xs font-medium hover:bg-muted/40 transition-colors">
          <span className="flex items-center gap-2">
            <FolderOpen className="size-4 text-accent" /> {rhk.realisasi} kegiatan terpetakan ke RHK ini
          </span>
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          {rhk.kegiatan.length === 0 ? (
            <p className="px-5 pb-4 text-xs text-muted-foreground italic">
              Belum ada kegiatan yang judul fotonya mengandung kata kunci RHK ini.
            </p>
          ) : (
            <ul className="divide-y border-t text-xs">
              {rhk.kegiatan.map((k) => {
                const { hari, tanggal } = formatTanggal(k.tanggal);
                return (
                  <li key={k._id} className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-foreground">{k.namaKegiatan}</div>
                      <div className="text-[11px] text-muted-foreground tabular-nums">
                        {hari}, {tanggal} &middot; {k.jamKegiatan} &middot;{" "}
                        <Images className="inline size-3" /> {k.jumlahFoto} foto
                      </div>
                    </div>
                    {k.driveLink && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        aria-label="Salin link kegiatan"
                        onClick={() => copyText(k.driveLink, "Link kegiatan")}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
