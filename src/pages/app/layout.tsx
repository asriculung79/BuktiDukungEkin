import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, FolderSync, LayoutDashboard, QrCode, Smartphone, Target, Trophy, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@/components/ui/signin";
import { Skeleton } from "@/components/ui/skeleton";
import BrandLogo from "@/components/brand-logo";
import ProfilAvatar from "@/components/profil/profil-avatar";
import ProfilDialog from "@/components/profil/profil-dialog";
import DeviceShareModal from "@/components/DeviceShareModal";
import { Authenticated, AuthLoading, Unauthenticated } from "@/components/auth-helpers";
import { useEkin } from "@/context/EkinContext";

const NAV = [
  { label: "Dashboard", short: "Beranda", icon: LayoutDashboard, to: "/app" },
  { label: "Data RHK & Rencana Aksi", short: "RHK", icon: Target, to: "/app/rhk" },
  { label: "Google Drive", short: "Drive", icon: FolderSync, to: "/app/drive" },
  { label: "Laporan Harian", short: "Harian", icon: CalendarDays, to: "/app/laporan" },
  { label: "Rekap Realisasi", short: "Rekap", icon: Trophy, to: "/app/rekap" },
];

function SideNav() {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "bg-sidebar-accent font-semibold text-sidebar-primary shadow-xs"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )
          }
        >
          <item.icon className="size-4" /> {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-sidebar-border bg-sidebar py-1.5 md:hidden">
      {NAV.map((item) => (
        <NavLink key={item.label} to={item.to} end>
          {({ isActive }) => (
            <span
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[11px]",
                isActive ? "text-sidebar-primary font-bold" : "text-sidebar-foreground/60 font-medium",
              )}
            >
              <item.icon className="size-5" /> {item.short}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function UserBox({ onOpenProfil }: { onOpenProfil: () => void }) {
  const { user, profil } = useEkin();
  const nama = profil?.namaLengkap || user?.name || "Pegawai ASN";

  return (
    <div className="space-y-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
      <button
        type="button"
        onClick={onOpenProfil}
        className="flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg text-left hover:opacity-90 transition-opacity"
      >
        <ProfilAvatar className="size-11 text-base shrink-0" nameFallback={nama} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-sidebar-foreground">{nama}</div>
          <div className="truncate text-xs text-sidebar-foreground/60">{profil?.jabatan || user?.email}</div>
        </div>
      </button>
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="secondary" onClick={onOpenProfil} className="w-full">
          <UserCog className="size-4" /> Profil
        </Button>
        <SignInButton size="sm" variant="secondary" signOutText="Keluar" className="w-full" />
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [profilOpen, setProfilOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const openProfil = () => setProfilOpen(true);

  return (
    <>
      <AuthLoading>
        <div className="space-y-4 p-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
          <BrandLogo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Silakan masuk untuk mengelola data kinerja dan bukti dukung Anda.
          </p>
          <SignInButton signInText="Masuk" />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="flex min-h-screen bg-background text-foreground">
          {/* Desktop Sidebar */}
          <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between bg-sidebar p-4 md:flex border-r border-sidebar-border">
            <div className="space-y-6">
              <BrandLogo light className="px-2 pt-2" />
              <SideNav />
            </div>
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/25 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-950/45 hover:border-emerald-500/50 transition-colors cursor-pointer"
              >
                <Smartphone className="size-4 text-emerald-400" />
                <span>Uji di HP (Scan QR)</span>
              </button>
              <UserBox onOpenProfil={openProfil} />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="min-w-0 flex-1 pb-20 md:pb-8">
            {/* Mobile Header Bar */}
            <div className="flex items-center justify-between bg-sidebar px-4 py-3 md:hidden border-b border-sidebar-border">
              <BrandLogo light />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShareOpen(true)}
                  className="h-8 gap-1.5 border-emerald-500/30 bg-emerald-950/20 px-2.5 text-xs text-emerald-300 hover:bg-emerald-950/40"
                >
                  <QrCode className="size-3.5 text-emerald-400" />
                  <span>Uji HP</span>
                </Button>
                <button
                  type="button"
                  onClick={openProfil}
                  aria-label="Profil"
                  className="cursor-pointer"
                >
                  <ProfilAvatar className="size-8 text-sm" />
                </button>
                <SignInButton size="sm" variant="secondary" signOutText="Keluar" />
              </div>
            </div>

            {/* Page View with padding */}
            <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav />

          {/* Modals */}
          <ProfilDialog open={profilOpen} onOpenChange={setProfilOpen} />
          <DeviceShareModal open={shareOpen} onOpenChange={setShareOpen} />
        </div>
      </Authenticated>
    </>
  );
}
