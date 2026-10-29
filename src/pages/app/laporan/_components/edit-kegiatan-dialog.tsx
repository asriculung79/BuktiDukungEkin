import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DocLaporanHarian } from "@/types";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal"),
  jam: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Jam tidak valid"),
  namaKegiatan: z.string().trim().min(1, "Wajib diisi"),
  uraian: z.string(),
  driveLink: z.string(),
});

type FormValues = z.infer<typeof schema>;

// Stored as "HH.mm.ss"; <input type="time"> uses "HH:mm:ss"
const toInputTime = (jam: string) => jam.replaceAll(".", ":");
const fromInputTime = (t: string) => (t.length === 5 ? `${t}:00` : t).replaceAll(":", ".");

type Props = {
  row: DocLaporanHarian | null;
  onOpenChange: (open: boolean) => void;
};

export default function EditKegiatanDialog({ row, onOpenChange }: Props) {
  const { updateLaporan, regenerateAiUraian } = useEkin();
  const [saving, setSaving] = useState(false);
  const [askingAi, setAskingAi] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: row
      ? {
          tanggal: row.tanggal,
          jam: toInputTime(row.jamKegiatan),
          namaKegiatan: row.namaKegiatan,
          uraian: row.uraian,
          driveLink: row.driveLink || "",
        }
      : { tanggal: "", jam: "", namaKegiatan: "", uraian: "", driveLink: "" },
  });

  const onSubmit = async (values: FormValues) => {
    if (!row) return;
    setSaving(true);
    try {
      updateLaporan(row._id, {
        tanggal: values.tanggal,
        jamKegiatan: fromInputTime(values.jam),
        namaKegiatan: values.namaKegiatan,
        uraian: values.uraian,
        driveLink: values.driveLink,
      });
      toast.success("Kegiatan berhasil diperbarui");
      onOpenChange(false);
    } catch {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const askAi = async () => {
    if (!row) return;
    setAskingAi(true);
    try {
      await regenerateAiUraian(row._id);
      toast.success("Uraian kegiatan berhasil diperbarui oleh AI");
      onOpenChange(false);
    } catch {
      toast.error("Gagal meminta rekomendasi AI");
    } finally {
      setAskingAi(false);
    }
  };

  return (
    <Dialog open={row !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Kegiatan Harian</DialogTitle>
          <DialogDescription>
            Perubahan disimpan di laporan e-Kinerja Anda. Berkas di Google Drive tetap aman.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="tanggal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jam</FormLabel>
                    <FormControl>
                      <Input type="time" step={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="namaKegiatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kegiatan</FormLabel>
                  <FormControl>
                    <Input placeholder="KBM Aljabar Linier..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uraian"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Uraian Hasil Kegiatan</FormLabel>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-accent hover:text-accent font-semibold"
                      onClick={askAi}
                      disabled={askingAi}
                    >
                      {askingAi ? <Spinner /> : <Sparkles className="size-3.5" />} Minta AI Ulang
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Tersusunnya dokumen dan pelaksanaan kegiatan..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driveLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Google Drive Bukti Dukung</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://drive.google.com/drive/folders/..."
                      {...field}
                      className="font-mono text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner /> : null} Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
