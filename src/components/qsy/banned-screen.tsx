import cryingCat from "@/assets/crying-cat.png";

/** Pantalla troll que ve cualquier usuario baneado del sitio. */
export function BannedScreen() {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center overflow-auto bg-[#050505] px-4 py-10 text-center">
      <div className="max-w-lg">
        <img
          src={cryingCat}
          alt="Gato llorando"
          width={768}
          height={768}
          className="mx-auto w-52 animate-[qsy-sob_1.2s_ease-in-out_infinite] drop-shadow-[0_20px_45px_rgba(124,92,255,0.35)] sm:w-64"
        />
        <h1 className="mt-6 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          te baneamos, crack
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          Te creíste hacker por abrir la consola y ahora estás fuera de todo QSY. Tu intento quedó
          grabado con fecha, hora y hasta la cara de vergüenza. El gatito llora por vos, nosotros no.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/50">
          Podés cerrar la pestaña, cambiar de navegador, hacer F5 mil veces: seguís baneado. Si
          querés volver, rezá para que un admin tenga buen día.
        </p>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.3em] text-white/30">
          qsy.rip · acceso revocado
        </p>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@keyframes qsy-sob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}",
        }}
      />
    </div>
  );
}
