"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  Calendar,
  Gavel,
  ImageIcon,
  Loader2,
  LogOut,
  MessageSquare,
  Monitor,
  Search,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogoBar } from "@/components/logo-bar";
import { createClient } from "@/lib/supabase/client";
import { useSubmissions } from "@/hooks/use-submissions";
import type { Submission } from "@/lib/types";

function storagePathFromUrl(photoUrl: string): string | null {
  const marker = "/storage/v1/object/public/kren-wall/";
  const idx = photoUrl.indexOf(marker);
  return idx === -1
    ? null
    : decodeURIComponent(photoUrl.slice(idx + marker.length));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const router = useRouter();
  const { submissions, loading } = useSubmissions();
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<Submission | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toBan, setToBan] = useState<Submission | null>(null);
  const [banning, setBanning] = useState(false);
  const [banReason, setBanReason] = useState("");

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: submissions.length,
      photos: submissions.filter((s) => s.has_photo).length,
      today: submissions.filter(
        (s) => new Date(s.created_at).toDateString() === today
      ).length,
    };
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.message.toLowerCase().includes(q)
    );
  }, [submissions, query]);

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const supabase = createClient();
    try {
      if (toDelete.photo_url) {
        const path = storagePathFromUrl(toDelete.photo_url);
        if (path) {
          await supabase.storage.from("kren-wall").remove([path]);
        }
      }
      const { error } = await supabase
        .from("submissions")
        .delete()
        .eq("id", toDelete.id);
      if (error) throw new Error(error.message);
      toast.success("Kiriman dihapus.");
      setToDelete(null);
    } catch {
      toast.error("Gagal menghapus. Apakah kamu masih login?");
    } finally {
      setDeleting(false);
    }
  }

  async function handleBan() {
    if (!toBan) return;
    if (!toBan.ip && !toBan.device_id) {
      toast.error("Tidak ada IP atau device ID untuk diblokir.");
      return;
    }
    setBanning(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("banned_devices").insert({
        ip: toBan.ip || null,
        device_id: toBan.device_id || null,
        reason: banReason.trim() || "Melanggar aturan",
        banned_by: "admin",
      });
      if (error) throw new Error(error.message);
      toast.success(
        `IP ${toBan.ip || "-"} / device ${(toBan.device_id || "-").slice(0, 8)}… berhasil diblokir.`
      );
      setToBan(null);
      setBanReason("");
    } catch {
      toast.error("Gagal memblokir. Apakah kamu masih login?");
    } finally {
      setBanning(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-background to-muted/60">
      <header className="flex items-center justify-between px-4 pt-6 md:px-8">
        <LogoBar size="small" />
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/bans">
              <Gavel className="size-4" /> Banned
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="size-4" /> Keluar
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dasbor Admin
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantauan langsung semua kiriman di KREN Wall.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="glass">
            <CardContent className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <MessageSquare className="size-5 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Pesan</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <ImageIcon className="size-5 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {stats.photos}
                </p>
                <p className="text-xs text-muted-foreground">Total Foto</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="flex items-center gap-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="size-5 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.today}</p>
                <p className="text-xs text-muted-foreground">Pesan Hari Ini</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative mt-6">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau pesan…"
            aria-label="Cari kiriman berdasarkan nama atau pesan"
            className="pl-9"
          />
        </div>

        <Card className="glass mt-4 overflow-hidden py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="max-w-xs">Pesan</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead className="hidden md:table-cell">Perangkat</TableHead>
                  <TableHead className="w-24 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {query
                        ? `Tidak ada hasil untuk "${query}".`
                        : "Belum ada kiriman."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        {s.photo_url ? (
                          <div className="relative h-14 w-8 overflow-hidden rounded">
                            <Image
                              src={s.photo_url}
                              alt={`Foto dari ${s.name}`}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <Badge variant="secondary">Teks</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {s.message}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatDate(s.created_at)}
                      </TableCell>
                      <TableCell className="hidden max-w-[160px] md:table-cell">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Monitor className="size-3 shrink-0" aria-hidden />
                            <span className="truncate font-mono" title={s.ip || "-"}>
                              {s.ip || "-"}
                            </span>
                          </div>
                          {s.device_id && (
                            <p className="truncate font-mono text-[10px] text-muted-foreground/60" title={s.device_id}>
                              {s.device_id.slice(0, 8)}…
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setToBan(s)}
                            aria-label={`Blokir ${s.name}`}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Blokir IP / device"
                          >
                            <ShieldOff className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setToDelete(s)}
                            aria-label={`Hapus kiriman dari ${s.name}`}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <Dialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus kiriman ini?</DialogTitle>
            <DialogDescription>
              {toDelete
                ? `"${toDelete.message.slice(0, 80)}" dari ${toDelete.name} akan dihapus dari TV, galeri, dan penyimpanan. Tindakan ini tidak bisa dibatalkan.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setToDelete(null)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!toBan}
        onOpenChange={(open) => !open && setToBan(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Blokir pengguna</DialogTitle>
            <DialogDescription>
              {toBan && (
                <>
                  <strong>{toBan.name}</strong> — {toBan.message.slice(0, 60)}
                  <br />
                  {toBan.ip && <>IP: {toBan.ip}<br /></>}
                  {toBan.device_id && <>Device: {toBan.device_id.slice(0, 16)}…<br /></>}
                  <br />
                  <span className="text-destructive">Pengguna ini tidak akan bisa upload lagi.</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="ban-reason" className="text-sm font-medium">
              Alasan (opsional)
            </label>
            <Input
              id="ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Melanggar aturan"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setToBan(null); setBanReason(""); }}
              disabled={banning}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={banning}
            >
              {banning ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Ban className="size-4" />
              )}
              Blokir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
