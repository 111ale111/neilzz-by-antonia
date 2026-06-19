export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-bg transition-colors duration-700" />
      <div
        className="animate-drift-one absolute -top-32 left-[8%] h-[28rem] w-[28rem] rounded-full bg-blush/50 blur-[110px] dark:bg-blush/15"
      />
      <div
        className="animate-drift-two absolute top-[35%] right-[2%] h-[24rem] w-[24rem] rounded-full bg-sand/45 blur-[100px] dark:bg-sand/12"
      />
      <div
        className="animate-drift-three absolute bottom-[-10%] left-[28%] h-[26rem] w-[26rem] rounded-full bg-rose/20 blur-[120px] dark:bg-rose/10"
      />
      {/* Faint grain to keep the gradient from looking flat/plastic */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCc+PGZpbHRlciBpZD0nbicgeD0nMCcgeT0nMCc+PGZlVHVyYnVsZW5jZSB0eXBlPSdmcmFjdGFsTm9pc2UnIGJhc2VGcmVxdWVuY3k9JzAuOicgbnVtT2N0YXZlcz0nMicgc3RpdGNoVGlsZXM9J3N0aXRjaCcvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbHRlcj0ndXJsKCNuKScvPjwvc3ZnPg==')]" />
    </div>
  );
}
