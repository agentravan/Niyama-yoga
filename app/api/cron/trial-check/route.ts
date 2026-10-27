import { NextResponse } from "next/server";
import { runTrialCheck } from "@/lib/lifecycle";

export const dynamic = "force-dynamic";

/** Called daily by Vercel Cron (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runTrialCheck();
    return NextResponse.json({ ok: true, processed: result.processed });
  } catch (e) {
    console.error("[cron] trial check failed", e);
    return NextResponse.json({ ok: false, error: "Trial check failed" }, { status: 500 });
  }
}
