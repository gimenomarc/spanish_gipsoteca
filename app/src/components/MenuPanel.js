import { useState } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";

// Imagen de fondo del menú - puede ser local (public/) o desde Supabase Storage
// Para usar Supabase, reemplaza con la URL de Supabase Storage
const images = {
  hero: "/images/hero/hero-bg.jpg", // Imagen local en public/images/hero/hero-bg.jpg
  // hero: "https://vnefocljtdvkabfxwoqg.supabase.co/storage/v1/object/public/product-images/hero/hero-bg.jpg", // URL de Supabase
};

export default function MenuPanel({ open, onClose }) {
  const [castCollectionOpen, setCastCollectionOpen] = useState(false);
  const { categories, loading: loadingCategories } = useCategories();

  const mainMenuItems = [
    { label: "HOME", path: "/" },
    {
      label: "THE CAST COLLECTION",
      hasSubmenu: true,
      submenuKey: "cast",
      submenu: loadingCategories ? [] : Object.values(categories).map((cat) => ({
        label: cat.nameEn,
        path: `/shop/${cat.id}`,
      })),
    },
    { label: "SHOP", path: "/shop" },
    { label: "THE SG GALLERY", path: "/sg-gallery" },
    { label: "ABOUT US", path: "/about" },
    { label: "FAQs", path: "/faqs" },
    { label: "CONTACT", path: "/contact" },
  ];

  const toggleSubmenu = (key) => {
    if (key === "cast") {
      setCastCollectionOpen(!castCollectionOpen);
    }
  };

  const isSubmenuOpen = (key) => {
    if (key === "cast") return castCollectionOpen;
    return false;
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-full sm:w-80 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: images.hero ? `linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.9) 100%), url(${images.hero})` : "linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.95) 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#000000",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="relative h-full overflow-y-auto p-6 sm:p-8">
          <nav className="space-y-1 sm:space-y-2">
            {mainMenuItems.map((item, idx) => (
              <div key={idx}>
                {item.path && !item.hasSubmenu ? (
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className="flex w-full items-center justify-between py-2.5 text-left text-xs uppercase tracking-[0.15em] text-white transition-colors hover:text-accent sm:py-3 sm:text-sm sm:tracking-[0.2em]"
                  >
                    <span>{item.label}</span>
                  </Link>
                ) : item.hasSubmenu ? (
                  <button
                    onClick={() => toggleSubmenu(item.submenuKey)}
                    className="flex w-full items-center justify-between py-2.5 text-left text-xs uppercase tracking-[0.15em] text-white transition-colors hover:text-accent sm:py-3 sm:text-sm sm:tracking-[0.2em]"
                  >
                    <span>{item.label}</span>
                    <span className={`ml-2 text-xs transition-transform ${isSubmenuOpen(item.submenuKey) ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>
                ) : null}
                {item.hasSubmenu && isSubmenuOpen(item.submenuKey) && (
                  <div className="ml-3 space-y-0.5 border-l-2 border-white/10 pl-3 sm:ml-4 sm:space-y-1 sm:pl-4">
                    {item.submenu.length === 0 ? (
                      <p className="py-1.5 text-[10px] uppercase tracking-[0.1em] text-white/50 sm:py-2 sm:text-xs">
                        Cargando...
                      </p>
                    ) : (
                      item.submenu.map((subItem, subIdx) => (
                        <Link
                          key={subIdx}
                          to={subItem.path}
                          onClick={onClose}
                          className="block py-1.5 text-[10px] uppercase tracking-[0.1em] text-white/75 transition-colors hover:text-accent sm:py-2 sm:text-xs sm:tracking-[0.15em]"
                        >
                          {subItem.label}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
