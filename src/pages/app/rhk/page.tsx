import { useState } from "react";
import { Pencil, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DocRhk } from "@/types";
import { useEkin } from "@/context/EkinContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import RhkFormDialog from "./_components/rhk-form-dialog";

export default function RhkPage() {
  const { rhkList, deleteRhk } = useEkin();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DocRhk | null>(null);
  const [deleting, setDeleting] = useState<DocRhk | null>(null);

  const nextNomor = (rhkList.reduce((m, r) => Math.max(m, r.nomor), 0) ?? 0) + 1;

  const openForm = (item: DocRhk | null) => {
    setEditing(item);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteRhk(deleting._id);
    toast.success("RHK berhasil dihapus");
    setDeleting(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Data RHK &amp; Rencana Aksi</h1>
          <p className="pt-1 text-sm text-muted-foreground">
            Sesuai target SKP Anda. Kata kunci dipakai untuk memetakan foto bukti dukung secara otomatis.
          </p>
        </div>
        <Button onClick={() => openForm(null)} className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 font-semibold">
          <Plus className="size-4" /> Tambah RHK
        </Button>
      </div>

      {rhkList.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Target />
            </EmptyMedia>
            <EmptyTitle>Belum ada RHK</EmptyTitle>
            <EmptyDescription>
              Tambahkan RHK pertama Anda, misalnya "Menyusun Perangkat Pembelajaran" dengan kata kunci "kbm, modul".
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => openForm(null)}>
              <Plus className="size-4" /> Tambah RHK
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-3">
          {rhkList.map((r) => (
            <Card key={r._id} className="py-0 hover:border-sidebar-primary/50 transition-colors shadow-xs">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-sidebar text-sidebar-primary shadow-xs">
                  <span className="text-[9px] font-semibold tracking-widest text-sidebar-foreground/60">
                    RHK
                  </span>
                  <span className="font-serif text-lg leading-none font-bold">{r.nomor}</span>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="font-semibold break-words text-foreground text-sm sm:text-base leading-snug">
                    {r.namaRhk}
                  </div>
                  <p className="text-xs break-words text-muted-foreground leading-relaxed">
                    {r.rencanaAksi}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.kataKunci.map((k) => (
                      <Badge key={k} variant="secondary" className="text-[11px] font-medium">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Target SKP</div>
                    <div className="font-semibold text-sm tabular-nums">
                      {r.targetKuantitas} {r.satuan}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Edit"
                      onClick={() => openForm(r)}
                      className="size-8 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Hapus"
                      onClick={() => setDeleting(r)}
                      className="size-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RhkFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        nextNomor={nextNomor}
      />

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus RHK {deleting?.nomor}?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.namaRhk}" akan dihapus permanen dari daftar RHK Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
