import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message || 'Error al iniciar sesión');
      setLoading(false);
    } else {
      navigate('/admin-jdm-private/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Título */}
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl uppercase tracking-[0.2em] text-white mb-2">
            The Spanish Gipsoteca
          </h1>
          <p className="text-xs uppercase tracking-[0.15em] text-white/50">
            Panel de Administración
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-white/10 bg-black/50 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none transition-colors"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-white text-black py-3 text-sm uppercase tracking-[0.15em] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Accediendo...' : 'Acceder'}
            </button>
          </div>
        </form>

        {/* Nota de seguridad */}
        <p className="mt-6 text-center text-xs text-white/30">
          Acceso restringido. Solo usuarios autorizados.
        </p>
      </div>
    </div>
  );
}
