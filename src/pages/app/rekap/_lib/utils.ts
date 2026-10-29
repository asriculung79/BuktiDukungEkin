import { toast } from "sonner";

export const copyText = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} disalin`);
  } catch {
    toast.error("Gagal menyalin");
  }
};

export function percent(realisasi: number, target: number): number {
  if (target <= 0) return realisasi > 0 ? 100 : 0;
  return Math.round((realisasi / target) * 100);
}
