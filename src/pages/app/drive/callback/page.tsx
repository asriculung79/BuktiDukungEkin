import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default function DriveCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/app/drive", { replace: true });
    }, 800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
      <Spinner className="size-8 text-accent" />
      <div className="text-center">
        <p className="font-serif text-lg font-semibold text-foreground">Menghubungkan Google Drive...</p>
        <p className="text-xs text-muted-foreground mt-1">Mengalihkan kembali ke dasbor Cloud Ekin Pro.</p>
      </div>
      <Button asChild size="sm" variant="outline" className="mt-2">
        <Link to="/app/drive">Klik jika tidak beralih otomatis</Link>
      </Button>
    </div>
  );
}
