import React from "react";
import { Copy, ExternalLink, Images, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DocLaporanHarian } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTanggal } from "@/lib/drive";

type Row = DocLaporanHarian;

type Props = {
  rows: Row[];
  onEdit: (row: Row) => void;
  onDelete: (row: Row) => void;
};

const copy = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} disalin ke clipboard`);
  } catch {
    toast.error("Gagal menyalin tautan");
  }
};

function Uraian({ row }: { row: Row }) {
  if (row.uraianStatus === "pending") {
    return (
      <div className="space-y-1.5 py-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <span className="text-xs text-muted-foreground italic">AI sedang menyusun...</span>
      </div>
    );
  }
  if (row.uraianStatus === "error" && !row.uraian) {
    return (
      <span className="text-xs text-destructive">
        Uraian AI belum selesai. Klik edit untuk mengisi manual atau minta AI ulang.
      </span>
    );
  }
  return <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">{row.uraian}</p>;
}

function Actions({ row, onEdit, onDelete }: { row: Row } & Omit<Props, "rows">) {
  return (
    <div className="flex gap-0.5">
      <Button
        size="icon"
        variant="ghost"
        className="size-8 text-muted-foreground hover:text-foreground"
        aria-label="Edit"
        onClick={() => onEdit(row)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="size-8 text-muted-foreground hover:text-destructive"
        aria-label="Hapus"
        onClick={() => onDelete(row)}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}

function DriveLink({ row }: { row: Row }) {
  if (!row.driveLink) return <span className="text-xs text-muted-foreground">-</span>;
  return (
    <div className="flex items-center gap-1">
      <Button asChild size="sm" variant="secondary" className="h-8 gap-1.5 text-xs font-semibold">
        <a href={row.driveLink} target="_blank" rel="noreferrer">
          <ExternalLink className="size-3.5" /> Buka
        </a>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="size-8 text-muted-foreground hover:text-foreground"
        aria-label="Salin link"
        onClick={() => copy(row.driveLink, "Link Google Drive")}
      >
        <Copy className="size-3.5" />
      </Button>
    </div>
  );
}

export default function LaporanTable({ rows, onEdit, onDelete }: Props) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border bg-card lg:block shadow-xs">
        <Table>
          <TableHeader className="bg-sidebar [&_th]:text-sidebar-foreground">
            <TableRow className="hover:bg-sidebar">
              <TableHead className="w-10 text-center font-bold">No</TableHead>
              <TableHead className="w-24">Hari</TableHead>
              <TableHead className="w-28">Tanggal</TableHead>
              <TableHead className="w-24">Jam</TableHead>
              <TableHead className="w-[24%]">Nama Kegiatan</TableHead>
              <TableHead className="w-[32%]">Uraian Hasil Kegiatan</TableHead>
              <TableHead>Bukti Dukung</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => {
              const { hari, tanggal } = formatTanggal(row.tanggal);
              return (
                <TableRow key={row._id} className="align-top hover:bg-muted/40 transition-colors">
                  <TableCell className="font-semibold text-center text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{hari}</TableCell>
                  <TableCell className="tabular-nums font-mono text-xs">{tanggal}</TableCell>
                  <TableCell className="tabular-nums font-mono text-xs">{row.jamKegiatan}</TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="font-semibold break-words text-foreground">{row.namaKegiatan}</div>
                    <Badge variant="secondary" className="mt-1.5 gap-1 text-[11px]">
                      <Images className="size-3 text-accent" /> {row.jumlahFoto} foto
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <Uraian row={row} />
                  </TableCell>
                  <TableCell>
                    <DriveLink row={row} />
                  </TableCell>
                  <TableCell>
                    <Actions row={row} onEdit={onEdit} onDelete={onDelete} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile / Tablet Cards */}
      <div className="space-y-3 lg:hidden">
        {rows.map((row, i) => {
          const { hari, tanggal } = formatTanggal(row.tanggal);
          return (
            <div key={row._id} className="space-y-3 rounded-xl border bg-card p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground tabular-nums font-medium">
                    #{i + 1} &middot; {hari}, {tanggal} &middot; {row.jamKegiatan}
                  </div>
                  <div className="pt-1 font-semibold break-words text-foreground text-sm">
                    {row.namaKegiatan}
                  </div>
                </div>
                <Actions row={row} onEdit={onEdit} onDelete={onDelete} />
              </div>

              <Uraian row={row} />

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                <Badge variant="secondary" className="gap-1 text-[11px]">
                  <Images className="size-3 text-accent" /> {row.jumlahFoto} foto
                </Badge>
                <DriveLink row={row} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
