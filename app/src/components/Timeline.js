import { useEffect, useRef, useState } from 'react';

/**
 * Componente Timeline profesional con animaciones
 */

// Iconos SVG para cada tipo de evento
const icons = {
  education: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  ),
  work: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  achievement: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
};

function TimelineItem({ item, index, isVisible }) {
  const isEven = index % 2 === 0;
  
  return (
    <div 
      className={`relative flex items-start gap-6 group transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Conector a la línea central */}
      <div className="absolute left-[27px] top-8 w-8 h-px bg-gradient-to-r from-white/30 to-transparent"></div>
      
      {/* Círculo/Nodo del timeline */}
      <div className="relative flex-shrink-0 z-10">
        <div className={`
          w-14 h-14 rounded-full flex items-center justify-center
          transition-all duration-500 group-hover:scale-110
          ${item.current 
            ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30' 
            : 'bg-gradient-to-br from-white/20 to-white/5 border border-white/20 group-hover:border-white/40'
          }
        `}>
          <div className={item.current ? 'text-black' : 'text-white/70 group-hover:text-white'}>
            {icons[item.icon] || icons.education}
          </div>
        </div>
        
        {/* Pulse animation for current */}
        {item.current && (
          <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping"></div>
        )}
      </div>

      {/* Contenido */}
      <div className={`
        flex-1 pb-10 pt-1
        transition-all duration-500
      `}>
        {/* Fecha */}
        <div className="flex items-center gap-3 mb-2">
          <span className={`
            inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
            ${item.current 
              ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' 
              : 'bg-white/10 text-white/60 border border-white/10'
            }
          `}>
            {item.date}
          </span>
        </div>
        
        {/* Tarjeta de contenido */}
        <div className={`
          relative p-5 rounded-lg transition-all duration-300
          ${item.current 
            ? 'bg-gradient-to-br from-amber-400/10 to-transparent border border-amber-400/20' 
            : 'bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20'
          }
        `}>
          {/* Título */}
          <h4 className={`
            text-base sm:text-lg font-medium mb-1 tracking-wide
            ${item.current ? 'text-amber-400' : 'text-white group-hover:text-white'}
          `}>
            {item.title}
          </h4>
          
          {/* Subtítulo/Ubicación */}
          <p className="text-sm text-white/50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.location}
          </p>
          
          {/* Descripción opcional */}
          {item.description && (
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Timeline({ items, title }) {
  const [isVisible, setIsVisible] = useState(false);
  const timelineRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (timelineRef.current) {
      observer.observe(timelineRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={timelineRef} className="relative">
      {/* Título */}
      {title && (
        <h3 className="font-display text-sm uppercase tracking-[0.25em] text-white/50 mb-10 flex items-center gap-4">
          <span>{title}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></span>
        </h3>
      )}

      {/* Línea vertical del timeline */}
      <div className="absolute left-7 top-20 bottom-0 w-px">
        <div 
          className={`
            h-full bg-gradient-to-b from-amber-400/50 via-white/20 to-transparent
            transition-all duration-1000 origin-top
            ${isVisible ? 'scale-y-100' : 'scale-y-0'}
          `}
        ></div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <TimelineItem 
            key={index} 
            item={item} 
            index={index}
            isVisible={isVisible}
          />
        ))}
      </div>
    </div>
  );
}
