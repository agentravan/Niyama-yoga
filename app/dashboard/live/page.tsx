import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { ClassList, isLiveNow } from "@/components/ClassList";
import { getProfile, getUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/config";
import { hasAccess } from "@/lib/lifecycle";
import { createClient } from "@/lib/supabase/server";
import type { LiveClass } from "@/lib/types";
import { DEFAULT_ROOM } from "@/lib/video";
import { LiveRoom } from "./LiveRoom";

export const metadata: Metadata = { title: "Live Classes" };

export default async function LivePage() {
  const [user, profile] = await Promise.all([getUser(), getProfile()]);
  const admin = isAdminEmail(user?.email);
  const access = admin || (!!profile && hasAccess(profile));

  const supabase = await createClient();
  const { data } = await supabase
    .from("live_classes")
    .select("*")
    .gte("starts_at", new Date(Date.now() - 4 * 3_600_000).toISOString())
    .order("starts_at")
    .limit(12);
  const classes = ((data ?? []) as LiveClass[]).filter(
    (c) => new Date(c.starts_at).getTime() + c.duration_minutes * 60_000 > Date.now(),
  );
  const current = classes.find(isLiveNow) ?? classes[0];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="font-display mb-4 text-3xl font-semibold">Live studio</h1>
        {access ? (
          <LiveRoom
            room={current?.room_name ?? DEFAULT_ROOM}
            title={current && isLiveNow(current) ? current.title : "Niyama Main Studio"}
          />
        ) : (
          <div className="glass flex aspect-video min-h-[360px] flex-col items-center justify-center rounded-[2rem] p-8 text-center">
            <Lock className="h-10 w-10 text-clay-500" />
            <h2 className="font-display mt-4 text-2xl font-semibold">Live classes are for members</h2>
            <p className="muted mt-2 max-w-sm">
              {profile ? "Your free trial has ended. Upgrade to keep practising live with us." : "Start your free trial to join live classes."}
            </p>
            <Link href={profile ? "/dashboard/membership?action=upgrade" : "/start"} className="btn-primary mt-6">
              {profile ? "Upgrade membership" : "Start free trial"}
            </Link>
          </div>
        )}
        <p className="muted mt-3 text-xs">
          Tip: use Chrome, Edge or Safari and allow camera &amp; microphone access when prompted.
        </p>
      </div>
      <aside>
        <h2 className="font-display mb-4 text-xl font-semibold">Schedule</h2>
        <ClassList classes={classes} />
      </aside>
    </div>
  );
}
