import { useRef, useEffect, useState } from 'react';

/**
 * Wrapper que hace fade-in + slide-up al entrar en el viewport.
 * - delay: ms de retraso (útil para stagger en grids)
 * - direction: 'up' | 'down' | 'left' | 'right' | 'none'
 * - distance: px del desplazamiento inicial
 * - duration: ms de la transición
 */
export default function FadeIn({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 20,
  duration = 550,
  threshold = 0.1,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const getTransform = () => {
    if (visible) return 'none';
    switch (direction) {
      case 'up':    return `translateY(${distance}px)`;
      case 'down':  return `translateY(-${distance}px)`;
      case 'left':  return `translateX(${distance}px)`;
      case 'right': return `translateX(-${distance}px)`;
      default:      return 'none';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
