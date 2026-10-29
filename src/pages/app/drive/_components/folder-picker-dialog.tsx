import { useState, useEffect } from "react";
import { ChevronRight, Folder, FolderOpen, Home, Search, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useEkin } from "@/context/EkinContext";
import { getAccessToken } from "@/lib/firebase";

type Crumb = { id: string; name: string };
type Props = { open: boolean; onOpenChange: (open: boolean) => void };

const PRESET_FOLDERS: Crumb[] = [
  { id: "folder-raw-timemark-asn", name: "FOTO TIMEMARK GPS HARIAN" },
  { id: "folder-raw-kbm-2026", name: "DOKUMENTASI KBM & ASESMEN 2026" },
  { id: "folder-raw-ekskul-p5", name: "KEGIATAN EKSKUL & PROYEK P5" },
  { id: "folder-raw-diklat-asn", name: "SERTIFIKAT & WEBINAR PKB" },
  { id: "folder-raw-panitia-dinas", name: "RAPAT DINAS & TUGAS LAIN" },
];

export default function FolderPickerDialog({ open, onOpenChange }: Props) {
  const { setRawFolder, rawFolderId } = useEkin();
  const [path, setPath] = useState<Crumb[]>([]);
  const [selected, setSelected] = useState<Crumb | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [folderList, setFolderList] = useState<Crumb[]>(PRESET_FOLDERS);
  const [newFolderName, setNewFolderName] = useState("");
  const [debounced] = useDebounce(search.trim(), 300);

  useEffect(() => {
    if (open) {
      loadFolders();
    }
  }, [open, path]);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (token) {
        const parentId = path.at(-1)?.id || "root";
        const q = parentId === "root"
          ? "mimeType = 'application/vnd.google-apps.folder' and trashed = false"
          : `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&pageSize=30`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.files && data.files.length > 0) {
            setFolderList(data.files.map((f: { id: string; name: string }) => ({ id: f.id, name: f.name })));
            setLoading(false);
            return;
          }
        }
      }
    } catch {
      // Fallback to presets
    }
    setFolderList(PRESET_FOLDERS);
    setLoading(false);
  };

  const filteredFolders = debounced
    ? folderList.filter((f) => f.name.toLowerCase().includes(debounced.toLowerCase()))
    : folderList;

  const openFolder = (f: Crumb) => {
    setSearch("");
    setPath(debounced ? [f] : [...path, f]);
    setSelected(f);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: Crumb = {
      id: `folder-custom-${Date.now()}`,
      name: newFolderName.trim().toUpperCase(),
    };
    setFolderList((prev) => [newFolder, ...prev]);
    setSelected(newFolder);
    setNewFolderName("");
    toast.success(`Folder "${newFolder.name}" ditambahkan`);
  };

  const save = () => {
    if (!selected) return;
    setRawFolder(selected.id, selected.name);
    toast.success(`Folder "${selected.name}" aktif sebagai sumber bukti dukung.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Pilih Folder Data Mentah</DialogTitle>
          <DialogDescription className="text-xs">
            Folder tempat foto Timemark GPS bukti kinerja Anda tersimpan di Google Drive.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 h-9 text-sm"
              placeholder="Cari nama folder..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {!debounced && (
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 hover:bg-muted font-medium text-foreground transition-colors"
                onClick={() => {
                  setPath([]);
                  setSelected(null);
                }}
              >
                <Home className="size-3.5 text-accent" /> Drive Saya
              </button>
              {path.map((c, i) => (
                <span key={c.id} className="flex items-center gap-1">
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                  <button
                    type="button"
                    className="cursor-pointer rounded px-1.5 py-0.5 hover:bg-muted font-medium"
                    onClick={() => {
                      setPath(path.slice(0, i + 1));
                      setSelected(c);
                    }}
                  >
                    {c.name}
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="h-64 space-y-1.5 overflow-y-auto rounded-lg border bg-muted/20 p-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)
            ) : filteredFolders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Folder className="size-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Tidak ada folder ditemukan</p>
                <p className="text-xs text-muted-foreground/75 mt-0.5">Ketik nama di bawah untuk membuat atau menetapkan folder baru.</p>
              </div>
            ) : (
              filteredFolders.map((f) => {
                const isSelected = selected?.id === f.id || (!selected && rawFolderId === f.id);
                return (
                  <div
                    key={f.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all border",
                      isSelected
                        ? "bg-accent/15 border-accent text-foreground font-semibold shadow-2xs"
                        : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
                      onClick={() => setSelected(f)}
                    >
                      {isSelected ? (
                        <FolderOpen className="size-4 shrink-0 text-accent" />
                      ) : (
                        <Folder className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate">{f.name}</span>
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => openFolder(f)}
                      aria-label="Buka folder"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Input
              placeholder="Nama folder baru..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="h-9 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateFolder();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="h-9 text-xs shrink-0"
            >
              <FolderPlus className="size-3.5 mr-1 text-accent" /> Tambah
            </Button>
          </div>
        </div>

        <DialogFooter className="items-center sm:justify-between gap-2 border-t pt-3">
          <span className="truncate text-xs text-muted-foreground">
            {selected ? (
              <span className="font-medium text-foreground">Dipilih: {selected.name}</span>
            ) : (
              "Pilih folder lalu klik Gunakan"
            )}
          </span>
          <Button onClick={save} disabled={!selected} className="bg-sidebar-primary text-sidebar-primary-foreground">
            Gunakan folder ini
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
