import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Generar o recuperar session_id
function getSessionId() {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Detectar tipo de dispositivo
function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Detectar navegador
function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
}

// Detectar sistema operativo
function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
}

// Hook principal para trackear visitas de página
export function usePageView() {
  const location = useLocation();
  const sessionId = useRef(getSessionId());
  const lastPath = useRef(null);

  useEffect(() => {
    // Evitar trackear la misma página dos veces
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;

    const trackPageView = async () => {
      try {
        const deviceType = getDeviceType();
        const browser = getBrowser();
        const os = getOS();

        // Insertar visita
        await supabase.from('analytics_visits').insert({
          session_id: sessionId.current,
          page_path: location.pathname,
          page_title: document.title,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          device_type: deviceType,
          browser: browser,
          os: os,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        // Actualizar o crear sesión
        const { data: existingSession } = await supabase
          .from('analytics_sessions')
          .select('id, page_count')
          .eq('session_id', sessionId.current)
          .single();

        if (existingSession) {
          // Actualizar sesión existente
          await supabase
            .from('analytics_sessions')
            .update({
              last_visit_at: new Date().toISOString(),
              page_count: existingSession.page_count + 1,
              is_bounce: false, // Ya visitó más de una página
            })
            .eq('session_id', sessionId.current);
        } else {
          // Crear nueva sesión
          await supabase.from('analytics_sessions').insert({
            session_id: sessionId.current,
            device_type: deviceType,
            browser: browser,
            os: os,
            referrer: document.referrer || null,
            page_count: 1,
            is_bounce: true,
          });
        }
      } catch (error) {
        // Silenciar errores de analytics para no afectar la experiencia del usuario
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);
}

// Función para trackear eventos personalizados
export async function trackEvent(eventType, eventName, metadata = {}) {
  try {
    const sessionId = getSessionId();
    
    await supabase.from('analytics_events').insert({
      session_id: sessionId,
      event_type: eventType,
      event_name: eventName,
      page_path: window.location.pathname,
      metadata: metadata,
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

// Hook para trackear clicks en elementos
export function useClickTracking(elementId, eventName, metadata = {}) {
  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const handleClick = () => {
      trackEvent('click', eventName, {
        element_id: elementId,
        element_text: element.textContent?.trim().substring(0, 100),
        ...metadata,
      });
    };

    element.addEventListener('click', handleClick);
    return () => element.removeEventListener('click', handleClick);
  }, [elementId, eventName, metadata]);
}

// Funciones helper para eventos comunes
export const Analytics = {
  // Trackear vista de producto
  trackProductView: (productCode, categoryId) => {
    trackEvent('view_product', `View Product: ${productCode}`, {
      product_code: productCode,
      category_id: categoryId,
    });
  },

  // Trackear añadir al carrito
  trackAddToCart: (productCode, categoryId, quantity = 1) => {
    trackEvent('add_to_cart', `Add to Cart: ${productCode}`, {
      product_code: productCode,
      category_id: categoryId,
      quantity: quantity,
    });
  },

  // Trackear inicio de checkout
  trackCheckoutStart: () => {
    trackEvent('checkout_start', 'Checkout Started');
  },

  // Trackear búsqueda
  trackSearch: (searchTerm, resultsCount) => {
    trackEvent('search', `Search: ${searchTerm}`, {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  },

  // Trackear click en categoría
  trackCategoryClick: (categoryId, categoryName) => {
    trackEvent('click', `Category: ${categoryName}`, {
      category_id: categoryId,
      category_name: categoryName,
    });
  },
};
