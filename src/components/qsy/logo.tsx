import { Link } from "@tanstack/react-router";
import qsyLogo from "@/assets/qsy-logo.png.asset.json";

export function QsyLogo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center ${className}`}>
      <img
        src={qsyLogo.url}
        alt="QSY"
        className="h-9 w-auto qsy-logo-img object-contain transition-transform duration-300 group-hover:scale-105"
      />
    </Link>
  );
}
