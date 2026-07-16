"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Gavel, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import type { BannedDevice } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BansPage() {
  const [bans, setBans] = useState<BannedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [unbanning, setUnbanning] = useState<string | null>(null);

  async function loadBans() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("banned_devices")
      .select("*")
      .order("created_at", { ascending: false });
    setBans((data as BannedDevice[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadBans();
  }, []);

  async function handleUnban(id: string) {
    setUnbanning(id);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("banned_devices")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
      setBans((prev) => prev.filter((b) => b.id !== id));
      toast.success("Blokiran dicabut.");
    } catch {
      toast.error("Gagal mencabut blokiran.");
    } finally {
      setUnbanning(null);
    }
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-background to-muted/60">
      <header className="flex items-center justify-between px-4 pt-6 md:px-8">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin">
            <ArrowLeft className="size-4" /> Kembali
          </Link>
        </Button>
        <LogoBar size="small" />
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10">
            <Gavel className="size-5 text-destructive" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Pengguna Diblokir
            </h1>
            <p className="text-sm text-muted-foreground">
              IP dan device yang tidak bisa upload ke KREN Wall.
            </p>
          </div>
        </div>

        <Card className="glass mt-6 overflow-hidden py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Waktu Blokir</TableHead>
                  <TableHead className="w-20 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : bans.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Belum ada yang diblokir.
                    </TableCell>
                  </TableRow>
                ) : (
                  bans.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">
                        {b.ip ? (
                          <Badge variant="secondary" className="font-mono">
                            {b.ip}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {b.device_id ? (
                          <span title={b.device_id}>
                            {b.device_id.slice(0, 12)}…
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {b.reason || "Melanggar aturan"}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatDate(b.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnban(b.id)}
                          disabled={unbanning === b.id}
                          className="h-8 text-xs"
                        >
                          {unbanning === b.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            "Unban"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </main>
  );
}
