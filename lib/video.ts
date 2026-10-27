export const DEFAULT_ROOM = "niyama-main-studio";

export type VideoSession =
  | { provider: "daily"; url: string; token: string }
  | { provider: "jitsi"; domain: string; roomName: string; displayName: string; email: string; moderator: boolean };

export const VIDEO_PROVIDER = process.env.NEXT_PUBLIC_VIDEO_PROVIDER === "jitsi" ? "jitsi" : "daily";
