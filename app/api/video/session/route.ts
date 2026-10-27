import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { getProfile, getUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/config";
import { hasAccess } from "@/lib/lifecycle";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_ROOM, VIDEO_PROVIDER, type VideoSession } from "@/lib/video";

const DAILY_API = "https://api.daily.co/v1";

async function daily(path: string, init?: RequestInit) {
  return fetch(`${DAILY_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
}

/** Issues a short-lived, per-member pass into a private class room. */
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const admin = isAdminEmail(user.email);
  const profile = await getProfile();
  if (!admin && (!profile || !hasAccess(profile))) {
    return NextResponse.json({ error: "Your trial or membership isn't active. Upgrade to join live classes." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { room?: string };
  const room = typeof body.room === "string" ? body.room : DEFAULT_ROOM;
  if (!/^[a-z0-9-]{3,60}$/.test(room)) return NextResponse.json({ error: "Invalid room." }, { status: 400 });
  if (room !== DEFAULT_ROOM) {
    const { data } = await createAdminClient().from("live_classes").select("id").eq("room_name", room).limit(1);
    if (!data?.length) return NextResponse.json({ error: "Unknown class room." }, { status: 404 });
  }

  const displayName = profile?.full_name ?? (admin ? "Instructor" : user.email!.split("@")[0]);

  if (VIDEO_PROVIDER === "jitsi") {
    // Unguessable room name so only people who pass this check can find the room.
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "niyama";
    const suffix = createHmac("sha256", secret).update(room).digest("hex").slice(0, 16);
    const session: VideoSession = {
      provider: "jitsi",
      domain: process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.jit.si",
      roomName: `${room}-${suffix}`,
      displayName,
      email: user.email!,
      moderator: admin,
    };
    return NextResponse.json(session);
  }

  if (!process.env.DAILY_API_KEY) {
    return NextResponse.json({ error: "Live video isn't configured yet (missing DAILY_API_KEY)." }, { status: 503 });
  }

  let res = await daily(`/rooms/${room}`);
  if (res.status === 404) {
    res = await daily("/rooms", {
      method: "POST",
      body: JSON.stringify({
        name: room,
        privacy: "private",
        properties: { enable_prejoin_ui: true, enable_chat: true, enable_screenshare: true, enable_knocking: false },
      }),
    });
  }
  if (!res.ok) {
    console.error("[video] Daily room error", res.status, await res.text());
    return NextResponse.json({ error: "Couldn't open the class room. Please try again." }, { status: 502 });
  }
  const roomInfo = (await res.json()) as { url: string };

  const tokenRes = await daily("/meeting-tokens", {
    method: "POST",
    body: JSON.stringify({
      properties: {
        room_name: room,
        user_name: displayName,
        user_id: user.id,
        is_owner: admin,
        exp: Math.floor(Date.now() / 1000) + 4 * 3600,
      },
    }),
  });
  if (!tokenRes.ok) {
    console.error("[video] Daily token error", tokenRes.status, await tokenRes.text());
    return NextResponse.json({ error: "Couldn't create your class pass. Please try again." }, { status: 502 });
  }
  const { token } = (await tokenRes.json()) as { token: string };

  const session: VideoSession = { provider: "daily", url: roomInfo.url, token };
  return NextResponse.json(session);
}
