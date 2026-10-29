import { useState } from "react";
import { Check, Copy, ExternalLink, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function CopyBox({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Disalin");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2">
      <code className="min-w-0 flex-1 truncate text-xs">{value}</code>
      <Button size="icon" variant="ghost" className="size-7" onClick={copy} aria-label="Salin">
        {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
}

export default function SetupGuide() {
  const steps = [
    <>
      OAuth Google Drive telah terkonfigurasi dengan scope <code>drive.file</code> &amp; <code>drive.metadata.readonly</code>.
    </>,
    <>
      Klik tombol <b>"Hubungkan Google Drive"</b> untuk masuk menggunakan akun Google tempat foto Timemark GPS bukti dukung Anda disimpan.
    </>,
    <>
      Pilih folder data mentah (misal: <code>FOTO TIMEMARK GPS HARIAN</code>). Seluruh foto baru akan dipindai otomatis berdasarkan format nama file tanggal, jam, dan judul kegiatan.
    </>,
    <>
      Folder SKP yang dihasilkan secara otomatis disetel dengan izin berbagi <b>"Anyone with the link can view"</b>, sehingga tautan siap ditempel di portal <b>e-Kinerja BKN</b> maupun <b>PMM Kemdikbudristek</b> tanpa hambatan izin akses.
    </>,
  ];

  return (
    <Card className="border-sidebar-primary/30">
      <CardHeader>
        <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <ShieldCheck className="size-5 text-accent" />
        </div>
        <CardTitle className="pt-2 font-serif text-xl">Integrasi Google Drive Resmi e-Kinerja</CardTitle>
        <CardDescription>
          Terhubung langsung dengan aman. Cukup klik tombol di bawah untuk menyambungkan akun Google Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                <div className="text-foreground">{s}</div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
