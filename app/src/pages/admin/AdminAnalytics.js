import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n) {
  return `${(n || 0).toFixed(2)}€`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function simplifyReferrer(referrer) {
  if (!referrer) return 'Directo';
  try {
    return new URL(referrer).hostname;
  } catch {
    return referrer;
  }
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatCard({ title, value, sub, icon }) {
  return (
    <div className="bg-black border border-white/10 p-4 md:p-6">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs uppercase tracking-[0.15em] text-white/50">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-light text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
    </div>
  );
}

function BarChart({ data, maxValue }) {
  if (!data || data.length === 0) return <p className="text-sm text-white/40">Sin datos</p>;
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-white/70 text-right">{item.label}</span>
          <div className="flex-1 bg-white/5 h-5 rounded-sm overflow-hidden">
            <div
              className="h-full bg-white/30 transition-all duration-500"
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-xs text-white/50 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function MonthChart({ data }) {
  if (!data || Object.keys(data).length === 0) return <p className="text-sm text-white/40">Sin datos</p>;
  const max = Math.max(...Object.values(data), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {Object.entries(data).map(([month, count]) => (
        <div key={month} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-white/60">{count > 0 ? count : ''}</span>
          <div className="w-full bg-white/5 rounded-sm overflow-hidden" style={{ height: '80px' }}>
            <div
              className="w-full bg-white/40 transition-all duration-500"
              style={{ height: `${Math.max((count / max) * 100, count > 0 ? 5 : 0)}%`, marginTop: 'auto' }}
            />
          </div>
          <span className="text-[10px] text-white/40 text-center leading-tight">{month}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminAnalytics() {
  const [tab, setTab] = useState('orders');
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);

  // Orders analytics
  const [orderStats, setOrderStats] = useState(null);

  // Traffic analytics
  const [trafficStats, setTrafficStats] = useState(null);
  const [trafficError, setTrafficError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    try {
      // ── ORDERS ──────────────────────────────────────────────
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      const all = orders || [];
      const checkouts = all.filter(o => o.order_type === 'checkout');
      const contacts = all.filter(o => o.order_type === 'contact');
      const totalRevenue = checkouts.reduce((s, o) => s + (o.total_amount || 0), 0);

      // Por estado
      const byStatus = ['pending', 'in_progress', 'completed', 'cancelled'].map(s => ({
        label: { pending: 'Pendiente', in_progress: 'En proceso', completed: 'Completado', cancelled: 'Cancelado' }[s],
        value: all.filter(o => o.status === s).length,
      }));

      // Por entrega
      const byDelivery = [
        { label: 'Recogida taller', value: checkouts.filter(o => o.delivery_type === 'pickup').length },
        { label: 'Envío domicilio', value: checkouts.filter(o => o.delivery_type === 'shipping').length },
      ];

      // Top productos
      const productCounts = {};
      checkouts.forEach(order => {
        (order.order_items || []).forEach(item => {
          const key = item.code || item.name || '?';
          if (!productCounts[key]) productCounts[key] = { name: item.name || item.code, count: 0 };
          productCounts[key].count += item.quantity || 1;
        });
      });
      const topProducts = Object.values(productCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
        .map(p => ({ label: p.name, value: p.count }));

      // Pedidos por mes (últimos 6 meses)
      const now = new Date();
      const byMonth = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString('es-ES', { month: 'short' });
        byMonth[key] = 0;
      }
      all.forEach(order => {
        const key = new Date(order.created_at).toLocaleString('es-ES', { month: 'short' });
        if (byMonth[key] !== undefined) byMonth[key]++;
      });

      // Últimos pedidos
      const recentOrders = all.slice(0, 8);

      setOrderStats({
        total: all.length,
        checkouts: checkouts.length,
        contacts: contacts.length,
        totalRevenue,
        avgTicket: checkouts.length > 0 ? totalRevenue / checkouts.length : 0,
        pending: all.filter(o => o.status === 'pending').length,
        byStatus,
        byDelivery,
        topProducts,
        byMonth,
        recentOrders,
      });

      // ── TRÁFICO ─────────────────────────────────────────────
      try {
        const [{ data: visits, error: vErr }, { data: sessions, error: sErr }] = await Promise.all([
          supabase.from('analytics_visits').select('*').gte('created_at', startDate.toISOString()).order('created_at', { ascending: false }),
          supabase.from('analytics_sessions').select('*').gte('created_at', startDate.toISOString()),
        ]);

        if (vErr || sErr) throw vErr || sErr;

        const v = visits || [];
        const sess = sessions || [];

        const bounceCount = sess.filter(s => s.is_bounce).length;
        const bounceRate = sess.length > 0 ? Math.round((bounceCount / sess.length) * 100) : 0;

        // Dispositivos
        const deviceMap = {};
        sess.forEach(s => { const d = s.device_type || 'Otro'; deviceMap[d] = (deviceMap[d] || 0) + 1; });
        const devices = Object.entries(deviceMap).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));

        // Navegadores
        const browserMap = {};
        sess.forEach(s => { const b = s.browser || 'Otro'; browserMap[b] = (browserMap[b] || 0) + 1; });
        const browsers = Object.entries(browserMap).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));

        // OS
        const osMap = {};
        sess.forEach(s => { const o = s.os || 'Otro'; osMap[o] = (osMap[o] || 0) + 1; });
        const os = Object.entries(osMap).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));

        // Top páginas
        const pageMap = {};
        v.forEach(visit => { const p = visit.page_path || '/'; pageMap[p] = (pageMap[p] || 0) + 1; });
        const topPages = Object.entries(pageMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));

        // Referrers
        const refMap = {};
        v.forEach(visit => { const r = simplifyReferrer(visit.referrer); refMap[r] = (refMap[r] || 0) + 1; });
        const topReferrers = Object.entries(refMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }));

        // Visitas por día (últimos 7 días dentro del rango)
        const dayMap = {};
        const daysToShow = Math.min(parseInt(dateRange), 7);
        for (let i = daysToShow - 1; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          dayMap[d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })] = 0;
        }
        v.forEach(visit => {
          const key = new Date(visit.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
          if (dayMap[key] !== undefined) dayMap[key]++;
        });

        setTrafficStats({
          totalVisits: v.length,
          uniqueSessions: sess.length,
          bounceRate,
          mobilePercent: sess.length > 0 ? Math.round((sess.filter(s => s.device_type === 'mobile').length / sess.length) * 100) : 0,
          devices,
          browsers,
          os,
          topPages,
          topReferrers,
          dayMap,
          recentVisits: v.slice(0, 12),
        });
        setTrafficError(false);
      } catch (trafficErr) {
        console.error('Traffic tables not ready:', trafficErr);
        setTrafficError(true);
      }
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-white/70">Cargando analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white">Analytics</h1>
          <p className="text-sm text-white/50 mt-1">Pedidos y tráfico de la web</p>
        </div>
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

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/10">
        {[['orders', '📦 Pedidos'], ['traffic', '📈 Tráfico Web']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
              tab === key ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: PEDIDOS ──────────────────────────────────────── */}
      {tab === 'orders' && orderStats && (
        <div className="space-y-8">
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total pedidos" value={orderStats.checkouts} icon="🛒" sub={`+${orderStats.contacts} contactos`} />
            <StatCard title="Ingresos" value={formatCurrency(orderStats.totalRevenue)} icon="💶" sub="pedidos completados" />
            <StatCard title="Ticket medio" value={formatCurrency(orderStats.avgTicket)} icon="🧾" />
            <StatCard title="Pendientes" value={orderStats.pending} icon="⏳" sub="requieren atención" />
          </div>

          {/* Chart + estado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-black border border-white/10 p-4 md:p-6">
              <h3 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-6">Pedidos por mes</h3>
              <MonthChart data={orderStats.byMonth} />
            </div>
            <div className="bg-black border border-white/10 p-4 md:p-6">
              <h3 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">Por estado</h3>
              <BarChart data={orderStats.byStatus} />
            </div>
          </div>

          {/* Entrega + top productos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-black border border-white/10 p-4 md:p-6">
              <h3 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">Tipo de entrega</h3>
              <BarChart data={orderStats.byDelivery} />
            </div>
            <div className="bg-black border border-white/10 p-4 md:p-6">
              <h3 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">Productos más pedidos</h3>
              {orderStats.topProducts.length > 0
                ? <BarChart data={orderStats.topProducts} />
                : <p className="text-sm text-white/40">Sin datos suficientes</p>}
            </div>
          </div>

          {/* Últimos pedidos */}
          <div className="bg-black border border-white/10 p-4 md:p-6">
            <h3 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">Últimos pedidos</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Fecha', 'Cliente', 'Tipo', 'Total', 'Estado'].map(h => (
                      <th key={h} className="text-left p-2 text-xs uppercase tracking-[0.1em] text-white/40 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orderStats.recentOrders.map(order => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-2 text-xs text-white/60">{formatDate(order.created_at)}</td>
                      <td className="p-2 text-xs text-white">{order.customer_name}</td>
                      <td className="p-2 text-xs text-white/60">{order.order_type === 'checkout' ? '🛒 Pedido' : '📧 Contacto'}</td>
                      <td className="p-2 text-xs text-white/80">{order.total_amount ? formatCurrency(order.total_amount) : '—'}</td>
                      <td className="p-2">
                        <span className={`text-xs px-2 py-0.5 rounded border ${
                          order.status === 'completed' ? 'border-green-500/30 text-green-400' :
                          order.status === 'cancelled' ? 'border-red-500/30 text-red-400' :
                          order.status === 'in_progress' ? 'border-yellow-500/30 text-yellow-400' :
                          'border-white/20 text-white/60'
                        }`}>
                          {order.status === 'pending' ? 'Pendiente' :
                           order.status === 'in_progress' ? 'En proceso' :
                           order.status === 'completed' ? 'Completado' : 'Cancelado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orderStats.recentOrders.length === 0 && (
                    <tr><td colSpan="5" className="p-4 text-center text-sm text-white/40">No hay pedidos en este período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: TRÁFICO ──────────────────────────────────────── */}
      {tab === 'traffic' && (
        trafficError ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-sm p-6 max-w-2xl">
            <h3 className="text-yellow-400 font-medium mb-2">⚠️ Tablas de analytics no encontradas</h3>
            <p className="text-sm text-white/70 mb-4">
              Para ver el tráfico web necesitas crear las tablas en Supabase. Sigue estos pasos:
            </p>
            <ol className="text-sm text-white/60 space-y-2 list-decimal list-inside">
              <li>Ve a <strong className="text-white">Supabase Dashboard → SQL Editor</strong></li>
              <li>Abre el archivo <code className="text-yellow-400 bg-black/50 px-1">app/scripts/analytics-schema.sql</code> del proyecto</li>
              <li>Copia el contenido y ejecútalo en el SQL Editor</li>
              <li>Vuelve aquí — los datos empezarán a llegar con las próximas visitas</li>
            </ol>
          </div>
        ) : trafficStats && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Visitas" value={trafficStats.totalVisits} icon="👁️" />
              <StatCard title="Sesiones" value={trafficStats.uniqueSessions} icon="👤" />
              <StatCard title="Tasa de rebote" value={`${trafficStats.bounceRate}%`} icon="↩️" sub="solo 1 página" />
              <StatCard title="Móvil" value={`${trafficStats.mobilePercent}%`} icon="📱" sub="del tráfico" />
            </div>

            {/* Visitas por día + páginas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black border border-white/10 p-4 md:p-6">
                <h3 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-6">Visitas por día</h3>
                <MonthChart data={trafficStats.dayMap} />
              </div>
              <div className="bg-black border border-white/10 p-4 md:p-6">
                <h3 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">Páginas más vistas</h3>
                <BarChart data={trafficStats.topPages} />
              </div>
            </div>

            {/* Dispositivos + navegadores + OS + referrers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-black border border-white/10 p-4 md:p-6">
                <h3 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">Dispositivos</h3>
                <BarChart data={trafficStats.devices} />
              </div>
              <div className="bg-black border border-white/10 p-4 md:p-6">
                <h3 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">Navegadores</h3>
                <BarChart data={trafficStats.browsers} />
              </div>
              <div className="bg-black border border-white/10 p-4 md:p-6">
                <h3 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">Sistema Operativo</h3>
                <BarChart data={trafficStats.os} />
              </div>
              <div className="bg-black border border-white/10 p-4 md:p-6">
                <h3 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">Origen (Referrer)</h3>
                <BarChart data={trafficStats.topReferrers} />
              </div>
            </div>

            {/* Visitas recientes */}
            <div className="bg-black border border-white/10 p-4 md:p-6">
              <h3 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4">Visitas recientes</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Fecha', 'Página', 'Dispositivo', 'Navegador', 'Origen'].map(h => (
                        <th key={h} className="text-left p-2 text-xs uppercase tracking-[0.1em] text-white/40 font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trafficStats.recentVisits.map(visit => (
                      <tr key={visit.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-2 text-xs text-white/60">{formatDate(visit.created_at)}</td>
                        <td className="p-2 text-xs text-white font-mono">{visit.page_path}</td>
                        <td className="p-2 text-xs text-white/60 capitalize">{visit.device_type || '—'}</td>
                        <td className="p-2 text-xs text-white/60">{visit.browser || '—'}</td>
                        <td className="p-2 text-xs text-white/50">{simplifyReferrer(visit.referrer)}</td>
                      </tr>
                    ))}
                    {trafficStats.recentVisits.length === 0 && (
                      <tr><td colSpan="5" className="p-4 text-center text-sm text-white/40">No hay visitas registradas aún</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
