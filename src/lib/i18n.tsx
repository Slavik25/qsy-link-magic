import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LANGS = [
  { code: "es", label: "Español", short: "ES", flag: "https://flagcdn.com/w40/es.png" },
  { code: "pt", label: "Português", short: "PT", flag: "https://flagcdn.com/w40/br.png" },
  { code: "en", label: "English", short: "EN", flag: "https://flagcdn.com/w40/gb.png" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];

/** Diccionario: clave = texto original en español (normalizado). */
const EN: Record<string, string> = {
  // nav / footer
  "Explore": "Explore",
  "Templates": "Templates",
  "Features": "Features",
  "Pricing": "Pricing",
  "Login": "Login",
  "Create your QSY": "Create your QSY",
  "Dashboard": "Dashboard",
  "Ver mi perfil": "View my profile",
  "Cerrar sesión": "Sign out",
  "Salir": "Log out",
  "cuenta": "account",
  "Crear cuenta": "Create account",
  "Producto": "Product",
  "Cuenta": "Account",
  "Demo": "Demo",
  "Tu identidad. Un solo link. Perfiles públicos para todo lo que eres, haces y creas.":
    "Your identity. One single link. Public profiles for everything you are, do and create.",
  // hero
  "Unifica todas tus redes": "Unify all your socials",
  "Tu identidad": "Your identity",
  "digital simplificada.": "made simple.",
  "Bio-link · Redes en vivo · Música · Analytics en tiempo real. Todo lo que eres, haces y creas desde un único perfil.":
    "Bio-link · Live socials · Music · Real-time analytics. Everything you are, do and create from one profile.",
  "Registrarse gratis": "Sign up free",
  "Explorar perfiles": "Explore profiles",
  "100% gratis · sin tarjeta · listo en 2 min": "100% free · no card · ready in 2 min",
  "100% gratis · sin tarjeta de crédito · listo en 2 min": "100% free · no credit card · ready in 2 min",
  "Visitas totales": "Total visits",
  "Creadores activos": "Active creators",
  "Links servidos": "Links served",
  "Badges verificados": "Verified badges",
  "Comunidad activa": "Active community",
  "Crea un perfil": "Create a profile",
  "que sea tuyo.": "that is truly yours.",
  "Miles de creadores ya tienen su QSY. Personaliza cada detalle y únete a la red.":
    "Thousands of creators already have their QSY. Customize every detail and join the network.",
  "Aún no hay perfiles públicos": "No public profiles yet",
  "Sé la primera persona de la red. Los perfiles que se creen aparecerán aquí automáticamente.":
    "Be the first on the network. New profiles will show up here automatically.",
  "Reservar mi username": "Reserve my username",
  // specs
  "Especificaciones · 100% gratis": "Specs · 100% free",
  "La estructura": "The ultimate",
  "definitiva.": "structure.",
  "Seis piezas que trabajan juntas para que tu perfil cargue al instante, se vea único y te diga exactamente qué funciona.":
    "Six pieces working together so your profile loads instantly, looks unique and tells you exactly what works.",
  "Perfiles personalizados": "Custom profiles",
  "Avatar, banner, bio, ubicación y badge verificado.": "Avatar, banner, bio, location and verified badge.",
  "Analytics en vivo": "Live analytics",
  "Visitas, clicks, CTR, país, dispositivo y referrer.": "Visits, clicks, CTR, country, device and referrer.",
  "Links ilimitados": "Unlimited links",
  "Ordena, activa y mide cada enlace en segundos.": "Sort, enable and measure every link in seconds.",
  "Temas personalizados": "Custom themes",
  "Blur, opacidad, glow, radios, colores y efectos.": "Blur, opacity, glow, radius, colors and effects.",
  "Redes sociales": "Social networks",
  "Discord, Instagram, TikTok, GitHub, Steam y más.": "Discord, Instagram, TikTok, GitHub, Steam and more.",
  "Música": "Music",
  "Añade tu track favorito y reprodúcelo en tu perfil.": "Add your favorite track and play it on your profile.",
  // modules
  "Módulos potentes": "Powerful modules",
  "Módulos que se": "Modules that feel",
  "sienten vivos.": "alive.",
  "Cada módulo se actualiza en tiempo real dentro de tu perfil. Sin código, sin configuración: conecta y listo.":
    "Every module updates in real time inside your profile. No code, no setup: connect and go.",
  "Módulo Discord": "Discord module",
  "Estado en vivo, actividad y servidor conectado directamente en tu perfil.":
    "Live status, activity and server connected right on your profile.",
  "Módulo Gaming": "Gaming module",
  "Steam, Roblox y Twitch: muestra qué juegas y cuándo estás online.":
    "Steam, Roblox and Twitch: show what you play and when you're online.",
  "Módulo Música": "Music module",
  "Spotify sincronizado con reproducción y portada animada.": "Spotify synced with playback and animated cover art.",
  "Módulo QR": "QR module",
  "Genera y descarga tu QR con acento personalizado en un click.":
    "Generate and download your QR with a custom accent in one click.",
  "En vivo": "Live",
  "Popular": "Popular",
  "Nuevo": "New",
  "Pro": "Pro",
  "+60 conexiones disponibles": "+60 connections available",
  "Probar ahora": "Try it now",
  "Jugando a": "Playing",
  "Partida competitiva": "Competitive match",
  "Reproduciendo ahora": "Now playing",
  "Sincronización automática cada 60s": "Auto sync every 60s",
  "Color de acento": "Accent color",
  "Logo centrado": "Centered logo",
  "Escaneo ilimitado": "Unlimited scans",
  "Descargar QR": "Download QR",
  "miembro desde 2021": "member since 2021",
  "En directo · 1.4k": "Live · 1.4k",
  "1.2k visitas": "1.2k visits",
  "412 horas": "412 hours",
  // domains / connections
  "Dominios premium": "Premium domains",
  "Elige tu": "Choose your",
  "dominio.": "domain.",
  "Reserva tu handle en cualquiera de nuestros dominios, o conecta el tuyo propio.":
    "Reserve your handle on any of our domains, or connect your own.",
  "Más de 60": "More than 60",
  "conexiones.": "connections.",
  "Todas tus plataformas, un solo lugar. Añade cuantas quieras.":
    "All your platforms in one place. Add as many as you want.",
  "Crear mi perfil ahora": "Create my profile now",
  // chips
  "Perfil verificado": "Verified profile",
  "Efectos de texto": "Text effects",
  "Temas custom": "Custom themes",
  "Música de fondo": "Background music",
  "Carga instantánea": "Instant loading",
  "QR descargable": "Downloadable QR",
  "23+ tipografías": "23+ typefaces",
  "Módulos gaming": "Gaming modules",
  "Cursores custom": "Custom cursors",
  // pricing
  "Precios": "Simple",
  "simples.": "pricing.",
  "Empieza gratis. Escala cuando quieras.": "Start free. Scale whenever you want.",
  "Empezar": "Get started",
  "/mes": "/mo",
  "Perfil público": "Public profile",
  "Hasta 10 links": "Up to 10 links",
  "Analytics 7 días": "7-day analytics",
  "Todos los templates": "All templates",
  "Analytics 90 días": "90-day analytics",
  "Música y efectos": "Music and effects",
  "Badge verificado": "Verified badge",
  "Todo lo de Pro": "Everything in Pro",
  "Dominio propio": "Custom domain",
  "Multi-perfil": "Multi-profile",
  "Soporte prioritario": "Priority support",
  "tu_usuario": "your_user",
  "Tienda": "Store",
};

const PT: Record<string, string> = {
  "Explore": "Explorar",
  "Templates": "Modelos",
  "Features": "Recursos",
  "Pricing": "Preços",
  "Login": "Entrar",
  "Create your QSY": "Crie seu QSY",
  "Dashboard": "Painel",
  "Ver mi perfil": "Ver meu perfil",
  "Cerrar sesión": "Sair",
  "Salir": "Sair",
  "cuenta": "conta",
  "Crear cuenta": "Criar conta",
  "Producto": "Produto",
  "Cuenta": "Conta",
  "Demo": "Demo",
  "Tu identidad. Un solo link. Perfiles públicos para todo lo que eres, haces y creas.":
    "Sua identidade. Um único link. Perfis públicos para tudo o que você é, faz e cria.",
  "Unifica todas tus redes": "Unifique todas as suas redes",
  "Tu identidad": "Sua identidade",
  "digital simplificada.": "digital simplificada.",
  "Bio-link · Redes en vivo · Música · Analytics en tiempo real. Todo lo que eres, haces y creas desde un único perfil.":
    "Bio-link · Redes ao vivo · Música · Analytics em tempo real. Tudo o que você é, faz e cria em um só perfil.",
  "Registrarse gratis": "Cadastre-se grátis",
  "Explorar perfiles": "Explorar perfis",
  "100% gratis · sin tarjeta · listo en 2 min": "100% grátis · sem cartão · pronto em 2 min",
  "100% gratis · sin tarjeta de crédito · listo en 2 min": "100% grátis · sem cartão de crédito · pronto em 2 min",
  "Visitas totales": "Visitas totais",
  "Creadores activos": "Criadores ativos",
  "Links servidos": "Links servidos",
  "Badges verificados": "Selos verificados",
  "Comunidad activa": "Comunidade ativa",
  "Crea un perfil": "Crie um perfil",
  "que sea tuyo.": "que seja seu.",
  "Miles de creadores ya tienen su QSY. Personaliza cada detalle y únete a la red.":
    "Milhares de criadores já têm o seu QSY. Personalize cada detalhe e entre na rede.",
  "Aún no hay perfiles públicos": "Ainda não há perfis públicos",
  "Sé la primera persona de la red. Los perfiles que se creen aparecerán aquí automáticamente.":
    "Seja a primeira pessoa da rede. Os perfis criados aparecerão aqui automaticamente.",
  "Reservar mi username": "Reservar meu usuário",
  "Especificaciones · 100% gratis": "Especificações · 100% grátis",
  "La estructura": "A estrutura",
  "definitiva.": "definitiva.",
  "Seis piezas que trabajan juntas para que tu perfil cargue al instante, se vea único y te diga exactamente qué funciona.":
    "Seis peças que trabalham juntas para o seu perfil carregar na hora, parecer único e mostrar o que funciona.",
  "Perfiles personalizados": "Perfis personalizados",
  "Avatar, banner, bio, ubicación y badge verificado.": "Avatar, banner, bio, localização e selo verificado.",
  "Analytics en vivo": "Analytics ao vivo",
  "Visitas, clicks, CTR, país, dispositivo y referrer.": "Visitas, cliques, CTR, país, dispositivo e referrer.",
  "Links ilimitados": "Links ilimitados",
  "Ordena, activa y mide cada enlace en segundos.": "Ordene, ative e meça cada link em segundos.",
  "Temas personalizados": "Temas personalizados",
  "Blur, opacidad, glow, radios, colores y efectos.": "Blur, opacidade, glow, raios, cores e efeitos.",
  "Redes sociales": "Redes sociais",
  "Discord, Instagram, TikTok, GitHub, Steam y más.": "Discord, Instagram, TikTok, GitHub, Steam e mais.",
  "Música": "Música",
  "Añade tu track favorito y reprodúcelo en tu perfil.": "Adicione sua música favorita e toque no seu perfil.",
  "Módulos potentes": "Módulos poderosos",
  "Módulos que se": "Módulos que parecem",
  "sienten vivos.": "vivos.",
  "Cada módulo se actualiza en tiempo real dentro de tu perfil. Sin código, sin configuración: conecta y listo.":
    "Cada módulo se atualiza em tempo real no seu perfil. Sem código, sem configuração: conecte e pronto.",
  "Módulo Discord": "Módulo Discord",
  "Estado en vivo, actividad y servidor conectado directamente en tu perfil.":
    "Status ao vivo, atividade e servidor conectados direto no seu perfil.",
  "Módulo Gaming": "Módulo Gaming",
  "Steam, Roblox y Twitch: muestra qué juegas y cuándo estás online.":
    "Steam, Roblox e Twitch: mostre o que você joga e quando está online.",
  "Módulo Música": "Módulo Música",
  "Spotify sincronizado con reproducción y portada animada.": "Spotify sincronizado com reprodução e capa animada.",
  "Módulo QR": "Módulo QR",
  "Genera y descarga tu QR con acento personalizado en un click.":
    "Gere e baixe seu QR com cor personalizada em um clique.",
  "En vivo": "Ao vivo",
  "Popular": "Popular",
  "Nuevo": "Novo",
  "Pro": "Pro",
  "+60 conexiones disponibles": "+60 conexões disponíveis",
  "Probar ahora": "Testar agora",
  "Jugando a": "Jogando",
  "Partida competitiva": "Partida competitiva",
  "Reproduciendo ahora": "Tocando agora",
  "Sincronización automática cada 60s": "Sincronização automática a cada 60s",
  "Color de acento": "Cor de destaque",
  "Logo centrado": "Logo centralizado",
  "Escaneo ilimitado": "Escaneamento ilimitado",
  "Descargar QR": "Baixar QR",
  "miembro desde 2021": "membro desde 2021",
  "En directo · 1.4k": "Ao vivo · 1.4k",
  "1.2k visitas": "1.2k visitas",
  "412 horas": "412 horas",
  "Dominios premium": "Domínios premium",
  "Elige tu": "Escolha seu",
  "dominio.": "domínio.",
  "Reserva tu handle en cualquiera de nuestros dominios, o conecta el tuyo propio.":
    "Reserve seu handle em qualquer um dos nossos domínios, ou conecte o seu.",
  "Más de 60": "Mais de 60",
  "conexiones.": "conexões.",
  "Todas tus plataformas, un solo lugar. Añade cuantas quieras.":
    "Todas as suas plataformas em um só lugar. Adicione quantas quiser.",
  "Crear mi perfil ahora": "Criar meu perfil agora",
  "Perfil verificado": "Perfil verificado",
  "Efectos de texto": "Efeitos de texto",
  "Temas custom": "Temas custom",
  "Música de fondo": "Música de fundo",
  "Carga instantánea": "Carregamento instantâneo",
  "QR descargable": "QR para baixar",
  "23+ tipografías": "23+ tipografias",
  "Módulos gaming": "Módulos gaming",
  "Cursores custom": "Cursores custom",
  "Precios": "Preços",
  "simples.": "simples.",
  "Empieza gratis. Escala cuando quieras.": "Comece grátis. Escale quando quiser.",
  "Empezar": "Começar",
  "/mes": "/mês",
  "Perfil público": "Perfil público",
  "Hasta 10 links": "Até 10 links",
  "Analytics 7 días": "Analytics 7 dias",
  "Todos los templates": "Todos os modelos",
  "Analytics 90 días": "Analytics 90 dias",
  "Música y efectos": "Música e efeitos",
  "Badge verificado": "Selo verificado",
  "Todo lo de Pro": "Tudo do Pro",
  "Dominio propio": "Domínio próprio",
  "Multi-perfil": "Multi-perfil",
  "Soporte prioritario": "Suporte prioritário",
  "tu_usuario": "seu_usuario",
  "Tienda": "Loja",
};

const DICTS: Record<LangCode, Record<string, string>> = { es: {}, en: EN, pt: PT };

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

type Ctx = { lang: LangCode; setLang: (c: LangCode) => void; t: (s: string) => string };

const LangContext = createContext<Ctx>({ lang: "es", setLang: () => {}, t: (s) => s });

export function useI18n() {
  return useContext(LangContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("es");

  useEffect(() => {
    const saved = localStorage.getItem("qsy-lang") as LangCode | null;
    if (saved && LANGS.some((l) => l.code === saved)) setLangState(saved);
  }, []);

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    try {
      localStorage.setItem("qsy-lang", code);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = code;
  }, []);

  // Traducción del DOM: reemplaza los textos conocidos en toda la página.
  useEffect(() => {
    const dict = DICTS[lang];
    document.documentElement.lang = lang;
    if (lang === "es") {
      // Volver al español requiere recargar los textos originales del render.
      if (document.documentElement.dataset["qsyTranslated"] === "1") {
        delete document.documentElement.dataset["qsyTranslated"];
        window.location.reload();
      }
      return;
    }
    document.documentElement.dataset["qsyTranslated"] = "1";

    const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE"]);

    function translateNode(root: Node) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = (node as Text).parentElement;
          if (!parent || SKIP.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const batch: Text[] = [];
      let current = walker.nextNode();
      while (current) {
        batch.push(current as Text);
        current = walker.nextNode();
      }
      for (const textNode of batch) {
        const value = textNode.nodeValue ?? "";
        const key = norm(value);
        if (!key) continue;
        const translated = dict[key];
        if (translated && translated !== key) {
          textNode.nodeValue = value.replace(key, translated);
        }
      }
    }

    translateNode(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) {
          const textNode = m.target as Text;
          const key = norm(textNode.nodeValue ?? "");
          const translated = dict[key];
          if (translated && translated !== key) textNode.nodeValue = translated;
        }
        m.addedNodes.forEach((n) => {
          if (n.nodeType === Node.TEXT_NODE) {
            const key = norm(n.nodeValue ?? "");
            const translated = dict[key];
            if (translated && translated !== key) n.nodeValue = translated;
          } else if (n.nodeType === Node.ELEMENT_NODE) {
            translateNode(n);
          }
        });
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [lang]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (s: string) => DICTS[lang][norm(s)] ?? s,
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
