import React from "react";
import { AlertTriangle, CalendarDays, Clock, ImageOff, Images, RefreshCw } from "lucide-react";
import { useEkin } from "@/context/EkinContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { formatTanggal } from "@/lib/drive";

export default function PhotoList({ folderId }: { folderId: string }) {
  const { rawPhotos, refreshRawPhotos } = useEkin();
  const [loading, setLoading] = React.useState(false);

  const unreadable = rawPhotos.filter((p) => !p.parsed).length;

  const handleRefresh = async () => {
    setLoading(true);
    await refreshRawPhotos();
    setLoading(false);
  };

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2 font-serif text-lg">
            <Images className="size-5 text-accent" /> Foto di Folder Data Mentah
          </CardTitle>
          <CardDescription className="pt-1 text-xs">
            Tanggal, jam, dan judul kegiatan dibaca otomatis dari nama file foto Timemark GPS.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-semibold">{rawPhotos.length} foto terdeteksi</Badge>
          {unreadable > 0 && <Badge variant="destructive">{unreadable} tanggal tidak terbaca</Badge>}
          <Button size="icon" variant="ghost" className="size-8" onClick={handleRefresh} disabled={loading} title="Segarkan foto">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {rawPhotos.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ImageOff />
              </EmptyMedia>
              <EmptyTitle>Belum ada foto</EmptyTitle>
              <EmptyDescription>
                Unggah foto Timemark GPS ke folder ini di Google Drive.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rawPhotos.map((p) => {
                const t = p.parsed ? formatTanggal(p.parsed.tanggal) : null;
                return (
                  <div key={p.id} className="flex gap-3 rounded-xl border bg-card p-2.5 shadow-2xs hover:border-sidebar-primary/50 transition-colors">
                    {p.thumbnailLink ? (
                      <img
                        src={p.thumbnailLink}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="size-16 shrink-0 rounded-lg bg-muted object-cover"
                      />
                    ) : (
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Images className="size-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      {p.parsed && t ? (
                        <>
                          <div className="line-clamp-2 text-xs font-semibold text-foreground leading-snug">
                            {p.parsed.judul}
                          </div>
                          <div className="flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1 font-mono">
                              <CalendarDays className="size-3 text-accent" /> {t.hari}, {t.tanggal}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="size-3 text-accent" /> {p.parsed.jam}
                            </span>
                          </div>
                          {p.parsed.lokasi && (
                            <div className="truncate text-[10px] text-muted-foreground/80">
                              📍 {p.parsed.lokasi}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="truncate text-xs font-medium text-foreground">{p.name}</div>
                          <div className="text-[11px] text-destructive">Format tanggal tidak terbaca dari nama file</div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
