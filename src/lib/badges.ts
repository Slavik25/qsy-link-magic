import {
  CalendarClock,
  Gem,
  Hourglass,
  Infinity as InfinityIcon,
  Images,
  Crown,
  Medal,
  Shield,
  type LucideIcon,
} from "lucide-react";

export type BadgeDef = {
  key: string;
  name: string;
  description: string;
  img?: string;
  icon?: LucideIcon;
  color?: string;
  action?: string;
  href?: string;
  unlocked?: (v: { verified: boolean; views: number }) => boolean;
};

export const BADGES: BadgeDef[] = [
  { key: "booster", name: "Server Booster", description: "Boostea el servidor oficial de QSY en Discord al menos 2 veces.", img: "/badges/booster.svg", action: "Boost", href: "https://discord.gg/qsy" },
  { key: "staff", name: "Staff", description: "Miembro oficial del equipo de QSY.", img: "/badges/staff.svg", action: "Discord", href: "https://discord.gg/qsy" },
  { key: "moderator", name: "Moderador", description: "Moderador oficial de QSY.", img: "/badges/moderador.svg", action: "Discord", href: "https://discord.gg/qsy" },
  { key: "premium", name: "Premium", description: "Supporter oficial del paquete Premium.", icon: Gem, color: "#c084fc", action: "Obtener", href: "/dashboard/premium" },
  { key: "vip", name: "V.I.P", description: "Contribuidor V.I.P oficial.", img: "/badges/vip.svg", action: "Obtener V.I.P", href: "/dashboard/premium" },
  {
    key: "verified",
    name: "Verificado",
    description: "Creador verificado o partner reconocido.",
    img: "/badges/verifiedusergreen.svg",
    action: "Comprar",
    href: "/dashboard/premium",
    unlocked: (v) => v.verified,
  },
  { key: "donor", name: "Donator", description: "Donó para apoyar el crecimiento de la plataforma.", img: "/badges/donator.png", action: "Comprar", href: "/dashboard/premium" },
  { key: "imagehost", name: "Image Host", description: "Acceso al Image Host de QSY: sube y aloja tus propias imágenes.", icon: Images, color: "#38bdf8", action: "Obtener acceso", href: "/dashboard/gallery" },
  { key: "early", name: "Early Supporter", description: "Insignia OG para los primeros 50 usuarios registrados.", img: "/badges/earlysupporter.svg", action: "Ver OG Tags", href: "/dashboard/profile/share" },
  { key: "og", name: "OG", description: "Uno de los primeros 50 miembros de QSY.", icon: Crown, color: "#fbbf24", action: "Ver nombres OG", href: "/dashboard/og" },
  { key: "king", name: "King", description: "Contribuidor especial y rey del ranking.", img: "/badges/king.svg", action: "Discord", href: "https://discord.gg/qsy" },
  { key: "partner", name: "Partner", description: "Partner oficial de QSY.", img: "/badges/partner.svg", action: "Discord", href: "https://discord.gg/qsy" },
  { key: "activedev", name: "Active Developer", description: "Contribuyó directamente al desarrollo del código.", img: "/badges/developeractivo.svg", action: "Discord", href: "https://discord.gg/qsy" },
  { key: "discorddev", name: "Discord Developer", description: "Desarrollador verificado en el ecosistema de Discord.", img: "/badges/bluediscorddeveloper.svg", action: "Discord", href: "https://discord.gg/qsy" },
  { key: "buggold", name: "Bug Hunter Gold", description: "Encontró vulnerabilidades críticas y ayudó a asegurar el sistema.", img: "/badges/discordbughuntergold.svg", action: "Discord", href: "https://discord.gg/qsy" },
  { key: "bug", name: "Bug Hunter", description: "Reportó bugs de la plataforma al equipo técnico.", img: "/badges/discordbughuntergreen.svg", action: "Reportar bug", href: "https://discord.gg/qsy" },
  { key: "year1", name: "1 Year Member", description: "Lleva más de 1 año en QSY.", icon: CalendarClock, color: "#60a5fa" },
  { key: "year2", name: "Veteran (2 años)", description: "Lleva más de 2 años en QSY.", icon: Shield, color: "#34d399" },
  { key: "year5", name: "Legend (5 años)", description: "Lleva más de 5 años en QSY.", icon: Medal, color: "#fbbf24" },
  { key: "year7", name: "Ancient (7 años)", description: "Lleva más de 7 años en QSY.", icon: Hourglass, color: "#f472b6" },
  { key: "year10", name: "Immortal (10 años)", description: "Lleva más de 10 años en QSY.", icon: InfinityIcon, color: "#f87171" },
];

export function badgeByKey(key: string) {
  return BADGES.find((b) => b.key === key);
}
