import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, CalendarDays, FolderTree, Link2, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@/components/ui/signin";
import { Skeleton } from "@/components/ui/skeleton";
import BrandLogo from "@/components/brand-logo";
import { Authenticated, AuthLoading, Unauthenticated } from "@/components/auth-helpers";

const FEATURES = [
  {
    icon: FolderTree,
    title: "Folder harian otomatis",
    text: "Foto Timemark dipindah ke sub folder sesuai tanggal di nama file.",
  },
  {
    icon: Link2,
    title: "Link bukti dukung",
    text: "Setiap kegiatan mendapat satu link Google Drive publik siap tempel.",
  },
  {
    icon: CalendarDays,
    title: "Laporan harian rapi",
    text: "Hari, tanggal, jam, kegiatan, dan uraian hasil tersusun otomatis.",
  },
  {
    icon: Sparkles,
    title: "Uraian rekomendasi AI",
    text: "Uraian hasil kegiatan disarankan AI, tetap bisa Anda edit.",
  },
  {
    icon: Target,
    title: "Rekap per RHK",
    text: "Foto dipetakan ke RHK sesuai kata kunci, lengkap dengan realisasi SKP.",
  },
];

const fade = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.1 + i * 0.08, duration: 0.6, ease: "easeOut" as const },
});

function PrimaryCta() {
  return (
    <>
      <AuthLoading>
        <Skeleton className="h-11 w-44 bg-white/10" />
      </AuthLoading>
      <Unauthenticated>
        <SignInButton
          size="lg"
          signInText="Masuk untuk mulai"
          className="h-11 bg-[oklch(0.8_0.13_80)] px-6 font-semibold text-[oklch(0.2_0.05_262)] hover:bg-[oklch(0.85_0.13_82)]"
        />
      </Unauthenticated>
      <Authenticated>
        <Button asChild size="lg" className="h-11 bg-[oklch(0.8_0.13_80)] px-6 font-semibold text-[oklch(0.2_0.05_262)] hover:bg-[oklch(0.85_0.13_82)]">
          <Link to="/app">
            Buka aplikasi <ArrowRight className="size-4" />
          </Link>
        </Button>
      </Authenticated>
    </>
  );
}

export default function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.18_0.05_262)] text-white">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.8_0.13_80/0.22),transparent_55%),radial-gradient(ellipse_at_bottom_left,oklch(0.45_0.12_262/0.6),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/0.04)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <BrandLogo light />
        <PrimaryCta />
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pt-12 pb-20 md:pt-20">
        <motion.div {...fade(0)} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
          <span className="size-1.5 rounded-full bg-[oklch(0.8_0.13_80)]" /> Otomatisasi e-Kinerja ASN
        </motion.div>

        <motion.h1 {...fade(1)} className="max-w-3xl pt-6 font-serif text-4xl leading-[1.05] font-bold text-balance md:text-6xl">
          Bukti dukung harian <span className="text-[oklch(0.82_0.13_82)]">tersusun sendiri</span> dari Google Drive Anda.
        </motion.h1>

        <motion.p {...fade(2)} className="max-w-2xl pt-6 text-lg text-white/70">
          Unggah foto Timemark GPS ke satu folder. CLOUD EKIN memilah per tanggal, membuat link berbagi publik, menyusun laporan harian, dan merekap realisasi per RHK.
        </motion.p>

        <motion.div {...fade(3)} className="flex flex-wrap gap-3 pt-8">
          <PrimaryCta />
        </motion.div>

        <div className="grid gap-4 pt-16 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fade(4 + i)}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-[oklch(0.8_0.13_80/0.15)] text-[oklch(0.82_0.13_82)]">
                <f.icon className="size-5" />
              </div>
              <div className="pt-4 font-semibold text-white">{f.title}</div>
              <p className="pt-1 text-xs text-white/60 leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
