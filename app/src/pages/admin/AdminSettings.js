import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminSettings() {
  const { user, updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    setLoading(true);

    const { error } = await updatePassword(newPassword);

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Error al cambiar la contraseña' });
    } else {
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setNewPassword('');
      setConfirmPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white">
          Ajustes
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Configuración de tu cuenta
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-black border border-white/10 p-6 mb-6">
        <h2 className="text-sm uppercase tracking-[0.1em] text-white/70 mb-4">Cuenta</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50">Email</label>
            <p className="text-white">{user?.email}</p>
          </div>
          <div>
            <label className="text-xs text-white/50">Último acceso</label>
            <p className="text-white">
              {user?.last_sign_in_at 
                ? new Date(user.last_sign_in_at).toLocaleString('es-ES')
                : '—'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-black border border-white/10 p-6 mb-6">
        <h2 className="text-sm uppercase tracking-[0.1em] text-white/70 mb-4">Cambiar Contraseña</h2>
        
        {message.text && (
          <div className={`mb-4 p-3 text-sm ${
            message.type === 'error' 
              ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
              : 'bg-green-500/10 border border-green-500/30 text-green-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black px-6 py-2 text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>

      {/* Quick Links */}
      <div className="bg-black border border-white/10 p-6">
        <h2 className="text-sm uppercase tracking-[0.1em] text-white/70 mb-4">Scripts Útiles</h2>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-white/5 border border-white/10">
            <p className="text-white mb-1">Importar productos desde Excel</p>
            <code className="text-xs text-white/50 block">node scripts/import-products-excel.js</code>
          </div>
          <div className="p-3 bg-white/5 border border-white/10">
            <p className="text-white mb-1">Subir imágenes a Supabase</p>
            <code className="text-xs text-white/50 block">node scripts/upload-to-supabase.js</code>
          </div>
          <div className="p-3 bg-white/5 border border-white/10">
            <p className="text-white mb-1">Subir imágenes de About Us</p>
            <code className="text-xs text-white/50 block">node scripts/upload-about-images.js</code>
          </div>
        </div>
      </div>

      {/* Supabase Dashboard */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20">
        <p className="text-sm text-blue-400">
          <strong>💡 Tip:</strong> Para operaciones avanzadas, accede directamente al{' '}
          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-blue-300"
          >
            Dashboard de Supabase
          </a>
        </p>
      </div>
    </div>
  );
}
