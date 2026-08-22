import { Link } from "@tanstack/react-router";
import qsyLogo from "@/assets/qsy-logo.png.asset.json";
import qsyLogoLight from "@/assets/qsy-logo-dark.png.asset.json";

const imgClass =
  "h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105";

export function QsyLogo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center ${className}`}>
      <img src={qsyLogo.url} alt="QSY" className={`${imgClass} qsy-logo-on-dark`} />
      <img src={qsyLogoLight.url} alt="QSY" className={`${imgClass} qsy-logo-on-light`} />
    </Link>
  );
}
