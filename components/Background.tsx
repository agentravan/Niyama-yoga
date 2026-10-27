export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="animate-float absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-sage-300/40 blur-3xl dark:bg-sage-700/25" />
      <div
        className="animate-float absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-clay-300/30 blur-3xl dark:bg-clay-600/10"
        style={{ animationDelay: "-3s" }}
      />
      <div
        className="animate-float absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-sand-300/50 blur-3xl dark:bg-sage-800/30"
        style={{ animationDelay: "-6s" }}
      />
    </div>
  );
}
