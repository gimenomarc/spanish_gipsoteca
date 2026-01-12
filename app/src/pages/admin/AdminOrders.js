import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'checkout', 'contact'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'in_progress', 'completed', 'cancelled'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        // Si es un error de permisos, mostrar mensaje específico
        if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('row-level security')) {
          console.error('⚠️ Error de permisos RLS. Asegúrate de estar autenticado y de que las políticas RLS estén correctamente configuradas.');
          alert('⚠️ Error de permisos. Verifica que estés autenticado y que las políticas RLS estén configuradas correctamente.');
        }
        throw error;
      }
      setOrders(data || []);
      console.log(`✅ ${data?.length || 0} pedidos cargados correctamente`);
    } catch (error) {
      // Si hay error, mantener orders vacío pero no bloquear la UI
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const updateOrderNotes = async (orderId, notes) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ notes })
        .eq('id', orderId);

      if (error) throw error;
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, notes });
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Error al actualizar las notas');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesType = filterType === 'all' || order.order_type === filterType;
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = !searchTerm || 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const getTypeLabel = (type) => {
    return type === 'checkout' ? '🛒 Pedido' : '📧 Contacto';
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white/70">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white mb-2">
          📦 Pedidos y Solicitudes
        </h1>
        <p className="text-sm text-white/50">
          {filteredOrders.length} de {orders.length} solicitudes
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre, email, teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none"
        >
          <option value="all">Todos los tipos</option>
          <option value="checkout">🛒 Pedidos</option>
          <option value="contact">📧 Contactos</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">⏳ Pendiente</option>
          <option value="in_progress">🔄 En proceso</option>
          <option value="completed">✅ Completado</option>
          <option value="cancelled">❌ Cancelado</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de pedidos */}
        <div className="lg:col-span-2">
          <div className="bg-black border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">Tipo</th>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">Cliente</th>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">Email</th>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">Fecha</th>
                    <th className="text-center p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">Estado</th>
                    <th className="text-right p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-white/50 text-sm">
                        No hay pedidos o solicitudes
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                          selectedOrder?.id === order.id ? 'bg-white/10' : ''
                        }`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="p-4">
                          <span className="text-sm text-white">{getTypeLabel(order.order_type)}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-white">{order.customer_name}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-white/70">{order.customer_email}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-white/50">
                            {new Date(order.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(order.status)}`}>
                            {order.status === 'pending' ? '⏳ Pendiente' :
                             order.status === 'in_progress' ? '🔄 En proceso' :
                             order.status === 'completed' ? '✅ Completado' :
                             '❌ Cancelado'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="text-xs text-white/70 hover:text-white transition-colors"
                          >
                            Ver →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detalle del pedido */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-black border border-white/10 p-6 sticky top-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-display uppercase tracking-[0.15em] text-white">
                    {getTypeLabel(selectedOrder.order_type)}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-white/50 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <span className={`inline-block px-3 py-1 text-xs rounded border ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status === 'pending' ? '⏳ Pendiente' :
                   selectedOrder.status === 'in_progress' ? '🔄 En proceso' :
                   selectedOrder.status === 'completed' ? '✅ Completado' :
                   '❌ Cancelado'}
                </span>
              </div>

              {/* Información del cliente */}
              <div className="mb-6 space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Cliente</p>
                  <p className="text-sm text-white">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Email</p>
                  <a href={`mailto:${selectedOrder.customer_email}`} className="text-sm text-accent hover:underline">
                    {selectedOrder.customer_email}
                  </a>
                </div>
                {selectedOrder.customer_phone && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Teléfono</p>
                    <a href={`tel:${selectedOrder.customer_phone}`} className="text-sm text-accent hover:underline">
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Fecha</p>
                  <p className="text-sm text-white/70">
                    {new Date(selectedOrder.created_at).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Información específica según tipo */}
              {selectedOrder.order_type === 'checkout' && (
                <div className="mb-6 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Tipo de entrega</p>
                    <p className="text-sm text-white">
                      {selectedOrder.delivery_type === 'pickup' ? '📍 Recogida en taller' : '🚚 Envío a domicilio'}
                    </p>
                  </div>
                  {selectedOrder.delivery_type === 'shipping' && (
                    <>
                      {selectedOrder.delivery_address && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Dirección</p>
                          <p className="text-sm text-white/70">{selectedOrder.delivery_address}</p>
                        </div>
                      )}
                      {selectedOrder.delivery_city && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Ciudad</p>
                          <p className="text-sm text-white/70">{selectedOrder.delivery_city}</p>
                        </div>
                      )}
                      {selectedOrder.delivery_postal_code && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Código Postal</p>
                          <p className="text-sm text-white/70">{selectedOrder.delivery_postal_code}</p>
                        </div>
                      )}
                    </>
                  )}
                  {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-2">Productos</p>
                      <div className="space-y-2">
                        {selectedOrder.order_items.map((item, idx) => (
                          <div key={idx} className="text-sm text-white/70 border-l-2 border-white/10 pl-3">
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-xs text-white/50">
                              Código: {item.code} | Cantidad: {item.quantity} | Precio: {item.price}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedOrder.total_amount && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Total</p>
                      <p className="text-lg font-medium text-white">{selectedOrder.total_amount.toFixed(2)}€</p>
                    </div>
                  )}
                </div>
              )}

              {selectedOrder.order_type === 'contact' && (
                <div className="mb-6 space-y-3">
                  {selectedOrder.subject && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Asunto</p>
                      <p className="text-sm text-white">{selectedOrder.subject}</p>
                    </div>
                  )}
                  {selectedOrder.message && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Mensaje</p>
                      <p className="text-sm text-white/70 whitespace-pre-wrap">{selectedOrder.message}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notas */}
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-2">Notas internas</p>
                <textarea
                  value={selectedOrder.notes || ''}
                  onChange={(e) => {
                    const updatedOrder = { ...selectedOrder, notes: e.target.value };
                    setSelectedOrder(updatedOrder);
                  }}
                  onBlur={(e) => updateOrderNotes(selectedOrder.id, e.target.value)}
                  placeholder="Añade notas sobre este pedido..."
                  className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none resize-none"
                  rows="4"
                />
              </div>

              {/* Cambiar estado */}
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-2">Cambiar estado</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'pending')}
                    className={`px-3 py-2 text-xs border transition-colors ${
                      selectedOrder.status === 'pending' 
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                        : 'bg-black border-white/20 text-white/70 hover:border-white/40'
                    }`}
                  >
                    ⏳ Pendiente
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'in_progress')}
                    className={`px-3 py-2 text-xs border transition-colors ${
                      selectedOrder.status === 'in_progress' 
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                        : 'bg-black border-white/20 text-white/70 hover:border-white/40'
                    }`}
                  >
                    🔄 En proceso
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    className={`px-3 py-2 text-xs border transition-colors ${
                      selectedOrder.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-black border-white/20 text-white/70 hover:border-white/40'
                    }`}
                  >
                    ✅ Completado
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    className={`px-3 py-2 text-xs border transition-colors ${
                      selectedOrder.status === 'cancelled' 
                        ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                        : 'bg-black border-white/20 text-white/70 hover:border-white/40'
                    }`}
                  >
                    ❌ Cancelado
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black border border-white/10 p-8 text-center">
              <p className="text-white/50 text-sm">
                Selecciona un pedido para ver los detalles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
