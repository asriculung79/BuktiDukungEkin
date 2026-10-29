import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, Save, UserCog, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useEkin } from "@/context/EkinContext";
import FotoSection from "./foto-section";
import { errorMessage } from "./use-upload-foto";

const nip = z
  .string()
  .trim()
  .refine((s) => s === "" || /^\d{18}$/.test(s.replace(/\s/g, "")), "NIP terdiri dari 18 digit");

const schema = z.object({
  namaLengkap: z.string().trim().min(1, "Wajib diisi"),
  nip,
  pangkat: z.string(),
  jabatan: z.string(),
  atasanNama: z.string(),
  atasanNip: nip,
  atasanPangkat: z.string(),
  atasanJabatan: z.string(),
});

type FormValues = z.infer<typeof schema>;

type FieldDef = { name: keyof FormValues; label: string; placeholder: string; numeric?: boolean };

const PEGAWAI: FieldDef[] = [
  { name: "namaLengkap", label: "Nama Lengkap & Gelar", placeholder: "Ahmad Faisal, S.Kom" },
  { name: "nip", label: "NIP Pegawai", placeholder: "198805122011011003", numeric: true },
  { name: "pangkat", label: "Pangkat / Golongan", placeholder: "Penata Tk. I / III/d" },
  { name: "jabatan", label: "Jabatan Pegawai", placeholder: "Pranata Komputer Ahli Muda" },
];

const ATASAN: FieldDef[] = [
  { name: "atasanNama", label: "Nama Lengkap Atasan", placeholder: "Dr. Ir. Hendra Kusuma, M.T." },
  { name: "atasanNip", label: "NIP Atasan", placeholder: "197503141999031002", numeric: true },
  { name: "atasanPangkat", label: "Pangkat / Gol. Atasan", placeholder: "Pembina Utama Muda / IV/c" },
  { name: "atasanJabatan", label: "Jabatan Atasan", placeholder: "Kepala Dinas Kominfo" },
];

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

function FieldGrid({ form, defs }: { form: ReturnType<typeof useForm<FormValues>>; defs: FieldDef[] }) {
  return (
    <div className="grid gap-3 pt-3 sm:grid-cols-2">
      {defs.map((d) => (
        <FormField
          key={d.name}
          control={form.control}
          name={d.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">{d.label}</FormLabel>
              <FormControl>
                <Input placeholder={d.placeholder} inputMode={d.numeric ? "numeric" : undefined} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: typeof UserRound; children: string }) {
  return (
    <h3 className="flex items-center gap-2 border-b pb-2 text-sm font-semibold text-primary dark:text-accent">
      <Icon className="size-4" /> {children}
    </h3>
  );
}

export default function ProfilDialog({ open, onOpenChange }: Props) {
  const { profil, updateProfil } = useEkin();
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: profil
      ? {
          namaLengkap: profil.namaLengkap || profil.namaAkun || "",
          nip: profil.nip || "",
          pangkat: profil.pangkat || "",
          jabatan: profil.jabatan || "",
          atasanNama: profil.atasanNama || "",
          atasanNip: profil.atasanNip || "",
          atasanPangkat: profil.atasanPangkat || "",
          atasanJabatan: profil.atasanJabatan || "",
        }
      : undefined,
    resetOptions: { keepDirtyValues: true },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      updateProfil({
        ...values,
        nip: values.nip.replace(/\s/g, ""),
        atasanNip: values.atasanNip.replace(/\s/g, ""),
      });
      toast.success("Profil tersimpan");
      onOpenChange(false);
    } catch (error) {
      toast.error(errorMessage(error, "Gagal menyimpan profil"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent/20 text-primary dark:text-accent">
              <UserCog className="size-4" />
            </span>
            Profil &amp; Foto Pegawai ASN
          </DialogTitle>
          <DialogDescription>
            Pengaturan identitas pejabat ASN, pas foto profil menu, dan data atasan penilai.
          </DialogDescription>
        </DialogHeader>

        <FotoSection hasFoto={Boolean(profil?.fotoUrl)} name={profil?.namaLengkap || profil?.namaAkun || "Pegawai ASN"} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <SectionTitle icon={UserRound}>Data Pegawai ASN</SectionTitle>
              <FieldGrid form={form} defs={PEGAWAI} />
            </div>

            <div>
              <SectionTitle icon={Briefcase}>Data Atasan Langsung (Penilai Kinerja)</SectionTitle>
              <FieldGrid form={form} defs={ATASAN} />
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Spinner /> : <Save className="size-4" />} Simpan Profil
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
