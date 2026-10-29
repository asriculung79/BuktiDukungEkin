import { useCallback, useEffect, useRef, useState } from "react";

// Front-camera capture for pas foto. Always stop() when done so the camera light turns off.
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof navigator !== "undefined" && "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices;

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    if (!isSupported) return setError("Kamera tidak didukung di perangkat ini");
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setActive(true);
    } catch (e) {
      const name = e instanceof Error ? e.name : "";
      if (name === "NotAllowedError") setError("Izin kamera ditolak. Aktifkan kembali di pengaturan browser.");
      else if (name === "NotFoundError") setError("Kamera tidak ditemukan di perangkat ini.");
      else if (name === "NotReadableError") setError("Kamera sedang dipakai aplikasi lain.");
      else setError("Gagal membuka kamera.");
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const capture = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  }, []);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  return { videoRef, active, isLoading, error, isSupported, start, stop, capture };
}
