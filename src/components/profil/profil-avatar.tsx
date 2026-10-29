import React from "react";
import { cn } from "@/lib/utils";
import { useEkin } from "@/context/EkinContext";
import { initials } from "./use-upload-foto";

type Props = { className?: string; nameFallback?: string };

// Pas foto ASN from profile, or gold initials tile when no photo is set
export default function ProfilAvatar({ className, nameFallback = "" }: Props) {
  const { profil } = useEkin();
  const name = profil?.namaLengkap || profil?.namaAkun || nameFallback || "Pegawai ASN";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[oklch(0.85_0.14_85)] to-[oklch(0.7_0.15_65)] font-serif font-bold text-[oklch(0.2_0.05_262)] select-none",
        className,
      )}
    >
      {profil?.fotoUrl ? (
        <img src={profil.fotoUrl} alt={name} className="size-full object-cover" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
