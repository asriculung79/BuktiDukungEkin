import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/app", { replace: true });
    }, 600);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-svh gap-4">
      <Spinner className="size-8 text-accent" />
      <p className="text-sm text-muted-foreground font-serif">Mengautentikasi akun Cloud Ekin Pro ASN...</p>
    </div>
  );
}
