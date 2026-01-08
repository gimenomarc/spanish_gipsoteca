import { Link } from "react-router-dom";

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
  </svg>
);

const INSTAGRAM_URL = "https://www.instagram.com/thespanishgipsoteca/";

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" />
    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function Footer() {
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
        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.15em] text-white/50 sm:text-xs sm:tracking-[0.2em]">
          Crafted with React + Tailwind · Inspirado en la obra del escultor
        </p>
      </div>
    </footer>
  );
}


