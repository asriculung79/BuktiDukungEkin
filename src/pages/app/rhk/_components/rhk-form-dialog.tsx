import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { DocRhk } from "@/types";
import { useEkin } from "@/context/EkinContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  nomor: z.coerce.number().int().min(1, "Minimal 1"),
  namaRhk: z.string().trim().min(1, "Wajib diisi"),
  rencanaAksi: z.string().trim().min(1, "Wajib diisi"),
  targetKuantitas: z.coerce.number().min(0, "Tidak boleh negatif"),
  satuan: z.string().trim().min(1, "Wajib diisi"),
  kataKunci: z
    .string()
    .refine((s) => s.split(",").some((k) => k.trim()), "Isi minimal 1 kata kunci"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: DocRhk | null;
  nextNomor: number;
};

function defaults(editing: DocRhk | null, nextNomor: number): FormValues {
  return editing
    ? {
        nomor: editing.nomor,
        namaRhk: editing.namaRhk,
        rencanaAksi: editing.rencanaAksi,
        targetKuantitas: editing.targetKuantitas,
        satuan: editing.satuan,
        kataKunci: editing.kataKunci.join(", "),
      }
    : {
        nomor: nextNomor,
        namaRhk: "",
        rencanaAksi: "",
        targetKuantitas: 1,
        satuan: "Laporan",
        kataKunci: "",
      };
}

export default function RhkFormDialog({ open, onOpenChange, editing, nextNomor }: Props) {
  const { addRhk, updateRhk } = useEkin();
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    values: defaults(editing, nextNomor),
  });

  const onSubmit = async (values: FormValues) => {
    const cleanKeywords = values.kataKunci
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      if (editing) {
        updateRhk({
          ...editing,
          nomor: values.nomor,
          namaRhk: values.namaRhk,
          rencanaAksi: values.rencanaAksi,
          targetKuantitas: values.targetKuantitas,
          satuan: values.satuan,
          kataKunci: cleanKeywords,
        });
        toast.success("RHK diperbarui");
      } else {
        addRhk({
          nomor: values.nomor,
          namaRhk: values.namaRhk,
          rencanaAksi: values.rencanaAksi,
          targetKuantitas: values.targetKuantitas,
          satuan: values.satuan,
          kataKunci: cleanKeywords,
        });
        toast.success("RHK ditambahkan");
      }
      onOpenChange(false);
    } catch {
      toast.error("Gagal menyimpan RHK");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit RHK" : "Tambah RHK"}</DialogTitle>
          <DialogDescription>
            Sesuaikan dengan target SKP Anda pada portal BKN / PMM.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-[90px_1fr] gap-3">
              <FormField
                control={form.control}
                name="nomor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. RHK</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="namaRhk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama RHK</FormLabel>
                    <FormControl>
                      <Input placeholder="Menyusun Perangkat Pembelajaran..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rencanaAksi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rencana Aksi</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Menyusun Modul Ajar dan asesmen berkala tiap bulan"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="targetKuantitas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target SKP</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="satuan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan</FormLabel>
                    <FormControl>
                      <Input placeholder="Laporan / Modul / Dokumen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="kataKunci"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kata kunci pemetaan foto</FormLabel>
                  <FormControl>
                    <Input placeholder="kbm, mengajar, modul ajar, asesmen" {...field} />
                  </FormControl>
                  <FormDescription>
                    Pisahkan dengan koma. Foto Timemark yang judulnya mengandung kata ini akan otomatis masuk ke RHK ini.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner /> : null} Simpan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
