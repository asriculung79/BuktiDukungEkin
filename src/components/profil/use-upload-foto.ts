import { toast } from "sonner";
import { useEkin } from "@/context/EkinContext";

export function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    if ("message" in error && typeof (error as any).message === "string") {
      return (error as any).message;
    }
  }
  return fallback;
}

export function initials(name: string): string {
  const parts = name.replace(/,.*$/, "").trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "A").concat(parts[1]?.[0] ?? "").toUpperCase();
}

export function useUploadFoto() {
  const { setFotoProfil } = useEkin();

  return async (file: Blob): Promise<boolean> => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5 MB");
      return false;
    }
    try {
      // Read as base64 DataURL for instant zero-latency preview and persistence
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setFotoProfil(dataUrl);
      toast.success("Foto profil diperbarui");
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Gagal mengunggah foto"));
      return false;
    }
  };
}
