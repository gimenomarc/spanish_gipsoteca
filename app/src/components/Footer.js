import { Link } from "react-router-dom";

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
  </svg>
);

const INSTAGRAM_URL = "https://www.instagram.com/thespanishgipsoteca/";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/80 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to="/" className="font-display text-xs uppercase tracking-[0.2em] text-white sm:text-sm sm:tracking-[0.3em]">
            <span className="hidden sm:inline">THE SPANISH GIPSOTECA</span>
            <span className="sm:hidden">TSG</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition hover:text-white"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>
        
        {/* Enlaces legales */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-center">
          <Link
            to="/terms"
            className="text-[10px] uppercase tracking-[0.1em] text-white/50 transition hover:text-white/70 sm:text-xs"
          >
            Términos y Condiciones
          </Link>
          <span className="text-white/30">·</span>
          <Link
            to="/privacy"
            className="text-[10px] uppercase tracking-[0.1em] text-white/50 transition hover:text-white/70 sm:text-xs"
          >
            Política de Privacidad
          </Link>
          <span className="text-white/30">·</span>
          <Link
            to="/cookies"
            className="text-[10px] uppercase tracking-[0.1em] text-white/50 transition hover:text-white/70 sm:text-xs"
          >
            Política de Cookies
          </Link>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/50 sm:text-xs sm:tracking-[0.2em]">
            © {currentYear} The Spanish Gipsoteca. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}


