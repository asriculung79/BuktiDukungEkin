import React, { useEffect, useRef, useState } from "react";
import { Camera, ChevronDown, CircleHelp, ExternalLink, Link2, Trash2, Upload, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCamera } from "@/hooks/use-camera";
import { useEkin } from "@/context/EkinContext";
import ProfilAvatar from "./profil-avatar";
import { errorMessage, useUploadFoto } from "./use-upload-foto";

type Props = { hasFoto: boolean; name: string };

const MYASN_URL = "https://myasn.bkn.go.id";

function CameraPanel({ onDone }: { onDone: () => void }) {
  const { videoRef, active, isLoading, error, capture, start, stop } = useCamera();
  const upload = useUploadFoto();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void start();
    return () => {
      stop();
    };
  }, [start, stop]);

  const take = async () => {
    const blob = await capture();
    if (!blob) return;
    setBusy(true);
    const ok = await upload(blob);
    setBusy(false);
    if (ok) onDone();
  };

  return (
    <div className="space-y-3 pt-4">
      <div className="relative mx-auto aspect-[3/4] w-48 overflow-hidden rounded-lg bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="size-full -scale-x-100 object-cover" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="text-white" />
          </div>
        )}
      </div>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
      <div className="flex justify-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Tutup kamera
        </Button>
        <Button type="button" size="sm" onClick={take} disabled={!active || busy}>
          {busy ? <Spinner /> : <Camera className="size-4" />} Ambil foto
        </Button>
      </div>
    </div>
  );
}

export default function FotoSection({ hasFoto, name }: Props) {
  const upload = useUploadFoto();
  const { removeFotoProfil, setFotoProfil } = useEkin();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);

  const run = async (task: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await task();
    } finally {
      setBusy(false);
    }
  };

  // Ctrl+V anywhere in the dialog: paste a copied image directly
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      const file = item?.getAsFile();
      if (!file) return;
      e.preventDefault();
      void run(() => upload(file));
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [upload]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void run(() => upload(file));
    e.target.value = "";
  };

  const onUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setFotoProfil(url.trim());
    toast.success("Foto profil berhasil diperbarui dari URL");
    setUrl("");
  };

  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <ProfilAvatar className="size-20 text-2xl" nameFallback={name} />
          <div className="space-y-1">
            <div className="text-sm font-semibold">Pas Foto ASN</div>
            <p className="text-xs text-muted-foreground">
              Format JPG/PNG, maksimal 5 MB. Pas foto resmi dengan latar belakang merah atau biru.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            <Upload className="size-4" /> Unggah berkas
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setCameraOpen((v) => !v)}
            disabled={busy}
          >
            <Camera className="size-4" /> {cameraOpen ? "Tutup" : "Kamera"}
          </Button>
          {hasFoto && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => run(async () => removeFotoProfil())}
              disabled={busy}
            >
              <Trash2 className="size-4" /> Hapus
            </Button>
          )}
        </div>
      </div>

      {cameraOpen && <CameraPanel onDone={() => setCameraOpen(false)} />}

      <Collapsible className="mt-3 border-t pt-3">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-full justify-between px-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-accent" /> Sinkronisasi Foto dari Akun MyASN Digital BKN
            </span>
            <ChevronDown className="size-3.5" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2 text-xs">
          <div className="flex items-center justify-between gap-2 rounded-lg bg-card p-2.5">
            <span className="text-muted-foreground">Buka portal MyASN BKN di tab baru untuk menyalin foto:</span>
            <Button asChild size="xs" variant="outline">
              <a href={MYASN_URL} target="_blank" rel="noreferrer" className="gap-1">
                Buka MyASN BKN <ExternalLink className="size-3" />
              </a>
            </Button>
          </div>
          <form onSubmit={onUrlSubmit} className="flex gap-2">
            <Input
              type="url"
              placeholder="Tempel tautan gambar MyASN atau URL foto..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-8 text-xs"
            />
            <Button type="submit" size="sm" disabled={busy || !url.trim()}>
              Simpan URL
            </Button>
          </form>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
