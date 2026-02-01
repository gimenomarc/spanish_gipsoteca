import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // días
  const [stats, setStats] = useState(null);
  const [recentVisits, setRecentVisits] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Obtener estadísticas resumidas usando la función SQL
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_analytics_summary', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      if (summaryError) throw summaryError;

      // Obtener visitas recientes
      const { data: visitsData, error: visitsError } = await supabase
        .from('analytics_visits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (visitsError) throw visitsError;

      // Obtener eventos recientes
      const { data: eventsData, error: eventsError } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (eventsError) throw eventsError;

      setStats(summaryData?.[0] || null);
      setRecentVisits(visitsData || []);
      setRecentEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white/70">Cargando analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white">
            Analytics
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Estadísticas de visitas y comportamiento de usuarios
          </p>
        </div>
        
        {/* Selector de rango de fechas */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none"
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
          <option value="365">Último año</option>
        </select>
      </div>

      {/* Estadísticas principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Visitas Totales"
            value={stats.total_visits || 0}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Visitantes Únicos"
            value={stats.unique_visitors || 0}
            icon="👤"
            color="green"
          />
          <StatCard
            title="Páginas Vistas"
            value={stats.total_page_views || 0}
            icon="📄"
            color="yellow"
          />
          <StatCard
            title="Duración Promedio"
            value={formatDuration(Math.round(stats.avg_session_duration || 0))}
            icon="⏱️"
            color="purple"
          />
        </div>
      )}

      {/* Métricas adicionales */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tasa de rebote */}
          <div className="bg-black border border-white/10 p-6">
            <h3 className="text-sm uppercase tracking-[0.15em] text-white/70 mb-4">
              Tasa de Rebote
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-light text-white">
                {Math.round(stats.bounce_rate || 0)}%
              </span>
              <span className="text-sm text-white/50">
                (sesiones con solo 1 página)
              </span>
            </div>
          </div>

          {/* Top páginas */}
          <div className="bg-black border border-white/10 p-6">
            <h3 className="text-sm uppercase tracking-[0.15em] text-white/70 mb-4">
              Páginas Más Visitadas
            </h3>
            <div className="space-y-2">
              {stats.top_pages && stats.top_pages.length > 0 ? (
                stats.top_pages.slice(0, 5).map((page, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-white/80 truncate flex-1">{page.path}</span>
                    <span className="text-white/50 ml-4">{page.views}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/50">No hay datos</p>
              )}
            </div>
          </div>

          {/* Top dispositivos */}
          <div className="bg-black border border-white/10 p-6">
            <h3 className="text-sm uppercase tracking-[0.15em] text-white/70 mb-4">
              Dispositivos
            </h3>
            <div className="space-y-2">
              {stats.top_devices && stats.top_devices.length > 0 ? (
                stats.top_devices.map((device, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-white/80 capitalize">{device.device}</span>
                    <span className="text-white/50 ml-4">{device.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/50">No hay datos</p>
              )}
            </div>
          </div>

          {/* Top navegadores */}
          <div className="bg-black border border-white/10 p-6">
            <h3 className="text-sm uppercase tracking-[0.15em] text-white/70 mb-4">
              Navegadores
            </h3>
            <div className="space-y-2">
              {stats.top_browsers && stats.top_browsers.length > 0 ? (
                stats.top_browsers.map((browser, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-white/80">{browser.browser}</span>
                    <span className="text-white/50 ml-4">{browser.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/50">No hay datos</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visitas recientes */}
      <div className="bg-black border border-white/10 p-6 mb-6">
        <h2 className="text-sm uppercase tracking-[0.15em] text-white/70 mb-4">
          Visitas Recientes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-2 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Fecha
                </th>
                <th className="text-left p-2 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Página
                </th>
                <th className="text-left p-2 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Dispositivo
                </th>
                <th className="text-left p-2 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Navegador
                </th>
                <th className="text-left p-2 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Referrer
                </th>
              </tr>
            </thead>
            <tbody>
              {recentVisits.length > 0 ? (
                recentVisits.map((visit) => (
                  <tr key={visit.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-2 text-xs text-white/70">
                      {formatDate(visit.created_at)}
                    </td>
                    <td className="p-2 text-xs text-white/80 font-mono">
                      {visit.page_path}
                    </td>
                    <td className="p-2 text-xs text-white/70 capitalize">
                      {visit.device_type || '—'}
                    </td>
                    <td className="p-2 text-xs text-white/70">
                      {visit.browser || '—'}
                    </td>
                    <td className="p-2 text-xs text-white/50 truncate max-w-xs">
                      {visit.referrer || 'Directo'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-sm text-white/50">
                    No hay visitas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Eventos recientes */}
      <div className="bg-black border border-white/10 p-6">
        <h2 className="text-sm uppercase tracking-[0.15em] text-white/70 mb-4">
          Eventos Recientes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-2 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Fecha
                </th>
                <th className="text-left p-2 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Tipo
                </th>
                <th className="text-left p-2 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Evento
                </th>
                <th className="text-left p-2 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Página
                </th>
                <th className="text-left p-2 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <tr key={event.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-2 text-xs text-white/70">
                      {formatDate(event.created_at)}
                    </td>
                    <td className="p-2 text-xs text-white/80">
                      <span className="px-2 py-1 bg-white/10 rounded">
                        {event.event_type}
                      </span>
                    </td>
                    <td className="p-2 text-xs text-white/80">
                      {event.event_name}
                    </td>
                    <td className="p-2 text-xs text-white/70 font-mono">
                      {event.page_path}
                    </td>
                    <td className="p-2 text-xs text-white/50">
                      {event.metadata ? JSON.stringify(event.metadata).substring(0, 50) + '...' : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-sm text-white/50">
                    No hay eventos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = 'white' }) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    white: 'text-white',
  };

  return (
    <div className="bg-black border border-white/10 p-6 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-white/50 mb-2">{title}</p>
          <p className={`text-4xl font-light ${colorClasses[color]}`}>{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}
