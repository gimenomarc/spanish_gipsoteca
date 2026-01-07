import { useState } from "react";
import { Link } from "react-router-dom";
import MenuPanel from "./MenuPanel";

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

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

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
    <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
  </svg>
);

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} />
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-black/50 px-6 py-4 backdrop-blur-md md:px-10">
        <button
          onClick={() => setMenuOpen(true)}
          className="text-white transition-colors hover:text-accent"
          aria-label="Menu"
        >
          <MenuIcon />
        </button>
        <Link to="/" className="font-display text-base uppercase tracking-[0.35em] text-white md:text-lg">
          THE SPANISH GIPSOTECA
        </Link>
        <div className="flex items-center gap-3 md:gap-4">
          <button className="text-white transition-colors hover:text-accent" aria-label="User">
            <UserIcon />
          </button>
          <button className="text-white transition-colors hover:text-accent" aria-label="Instagram">
            <InstagramIcon />
          </button>
          <button className="text-white transition-colors hover:text-accent" aria-label="Search">
            <SearchIcon />
          </button>
          <button className="text-white transition-colors hover:text-accent" aria-label="Cart">
            <BagIcon />
          </button>
        </div>
      </header>
    </>
  );
}

