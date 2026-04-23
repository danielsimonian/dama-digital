export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative w-full overflow-hidden"
      style={{ height: '100dvh' }}
    >
      {/* TODO: substituir pelo vídeo real da DAMA quando disponível */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/hero-placeholder.mp4"
      />
    </section>
  );
}
