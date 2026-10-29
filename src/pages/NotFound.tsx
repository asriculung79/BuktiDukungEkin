import { Link } from "react-router-dom";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <FileQuestion className="size-8" />
      </div>
      <h1 className="pt-4 font-serif text-2xl font-bold">Halaman Tidak Ditemukan</h1>
      <p className="max-w-md pt-2 text-sm text-muted-foreground">
        Halaman yang Anda tuju tidak ada atau telah dipindahkan.
      </p>
      <div className="pt-6">
        <Button asChild>
          <Link to="/app">
            <ArrowLeft className="size-4" /> Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
