import { CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export default function BrandLogo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.85_0.13_85)] to-[oklch(0.68_0.13_70)] text-[oklch(0.22_0.05_262)] shadow-sm">
        <CloudUpload className="size-5" />
      </div>
      <div className="leading-none">
        <div className={cn("font-serif text-base font-bold tracking-tight", light && "text-white")}>
          CLOUD EKIN
        </div>
        <div className="pt-0.5 text-[10px] font-semibold tracking-[0.25em] text-[oklch(0.72_0.13_80)]">
          PRO ASN
        </div>
      </div>
    </div>
  );
}
