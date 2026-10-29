export const DRIVE_CALLBACK_PATH = "/app/drive/callback";

export function driveRedirectUri(): string {
  return `${window.location.origin}${DRIVE_CALLBACK_PATH}`;
}

export function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    if ("message" in error && typeof (error as any).message === "string") {
      return (error as any).message;
    }
    if ("data" in error && typeof (error as any).data === "object" && (error as any).data?.message) {
      return (error as any).data.message;
    }
  }
  return fallback;
}

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// "2026-10-03" -> { hari: "Sabtu", tanggal: "03-10-2026" }
export function formatTanggal(iso: string): { hari: string; tanggal: string } {
  if (!iso || !iso.includes("-")) {
    return { hari: "Hari ini", tanggal: iso || "" };
  }
  const [y, m, d] = iso.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return {
    hari: HARI[day] || "Senin",
    tanggal: `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`,
  };
}
