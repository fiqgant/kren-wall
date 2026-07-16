"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Submission } from "@/lib/types";

interface Options {
  /** Only return submissions that include a photo (gallery). */
  photosOnly?: boolean;
}

/**
 * Loads all submissions and keeps them in sync via Supabase Realtime.
 * New rows are prepended instantly; deleted rows vanish instantly.
 */
export function useSubmissions({ photosOnly = false }: Options = {}) {
  const supabase = useMemo(() => createClient(), []);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setSubmissions((data as Submission[]) ?? []);
        setLoading(false);
      }
    }
    load();

    const channel = supabase
      .channel("submissions-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions" },
        (payload) => {
          const row = payload.new as Submission;
          setSubmissions((prev) =>
            prev.some((s) => s.id === row.id) ? prev : [row, ...prev]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "submissions" },
        (payload) => {
          const row = payload.old as { id: string };
          setSubmissions((prev) => prev.filter((s) => s.id !== row.id));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const visible = photosOnly
    ? submissions.filter((s) => s.has_photo && s.photo_url)
    : submissions;

  return { submissions: visible, loading };
}
