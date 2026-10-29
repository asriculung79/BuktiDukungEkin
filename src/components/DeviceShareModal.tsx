import { useState } from "react";
import { Check, Copy, ExternalLink, QrCode, Smartphone, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeviceShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeviceShareModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  // Active running development URL
  const devUrl = "https://ais-dev-wz77iemtcpex2wj2fy53xc-614358219280.asia-southeast1.run.app";
  const targetUrl = typeof window !== "undefined" && window.location.origin.includes("run.app") 
    ? window.location.origin 
    : devUrl;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(targetUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = targetUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Smartphone className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Uji Coba di HP / Laptop Lain</h2>
              <p className="text-xs text-muted-foreground">Buka dan pasang sebagai aplikasi (PWA)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          {/* QR Code and Quick Scan */}
          <div className="flex flex-col sm:flex-row items-center gap-5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
            <div className="relative size-36 shrink-0 overflow-hidden rounded-xl border border-emerald-500/30 bg-white p-2 shadow-inner">
              <img
                src={qrCodeUrl}
                alt="Scan QR Code untuk HP"
                className="h-full w-full object-contain"
                loading="eager"
              />
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                <QrCode className="size-3.5" /> Scan Kamera HP
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Arahkan kamera HP Android atau iPhone Anda ke QR code ini untuk langsung membuka aplikasi di browser HP.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  Buka di Tab Baru <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Direct URL Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Tautan Publik (Siap Dibagikan):</label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 p-2">
              <input
                type="text"
                readOnly
                value={targetUrl}
                className="flex-1 bg-transparent px-2 text-xs font-mono text-foreground focus:outline-none truncate selection:bg-emerald-500/30"
              />
              <Button
                size="sm"
                variant={copied ? "default" : "secondary"}
                onClick={handleCopy}
                className="shrink-0 h-8 gap-1.5 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-emerald-300" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Salin Link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Step Guide for Android & iOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-border bg-background/50 p-3 space-y-1.5">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">1</span>
                Android (Chrome)
              </div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                <li>Buka link di Google Chrome.</li>
                <li>Tekan tombol titik tiga (⋮) di pojok kanan atas.</li>
                <li>Pilih <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Instal Aplikasi"</strong>.</li>
              </ol>
            </div>

            <div className="rounded-xl border border-border bg-background/50 p-3 space-y-1.5">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">2</span>
                iPhone (Safari)
              </div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                <li>Buka link di browser Safari.</li>
                <li>Tekan tombol <strong>Share</strong> (ikon kotak tanda panah atas).</li>
                <li>Geser ke bawah dan pilih <strong>"Add to Home Screen"</strong>.</li>
              </ol>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-blue-500/10 border border-blue-500/20 px-3.5 py-2.5 text-xs text-blue-300">
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 shrink-0 text-blue-400" />
              <span>Aplikasi otomatis tersinkronisasi dan langsung dapat digunakan tanpa instalasi server di HP.</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
