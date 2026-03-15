import { useState } from 'react';
import { useStore } from '../store';
import { MessageCircle, Chrome } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [googleModal, setGoogleModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [gName, setGName] = useState('');
  const [gEmail, setGEmail] = useState('');
  const [gPassword, setGPassword] = useState('');

  const { loginWithGoogle, registerWithGoogle, siteSettings } = useStore();

  const handleGoogleLogin = () => {
    setError('');
    if (!gName.trim() || !gEmail.trim() || !gPassword.trim()) {
      setError('Введите имя, Google email и пароль');
      return;
    }
    const ok = authMode === 'register'
      ? registerWithGoogle(gName.trim(), gEmail.trim(), gPassword.trim())
      : loginWithGoogle(gName.trim(), gEmail.trim(), gPassword.trim());
    if (!ok) {
      setError(
        authMode === 'register'
          ? 'Этот email уже зарегистрирован или регистрация отключена'
          : 'Неверный пароль или аккаунт не зарегистрирован в системе'
      );
      return;
    }
    setGoogleModal(false);
  };

  if (siteSettings.maintenanceMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-white mb-2">Технические работы</h1>
          <p className="text-white/70">Сайт временно недоступен. Попробуйте позже.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* Animated bg */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 mb-4 shadow-lg">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">{siteSettings.siteName}</h1>
          <p className="text-white/60 mt-1">{siteSettings.welcomeMessage}</p>
        </div>

        {siteSettings.announcement && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3 mb-6 text-yellow-200 text-sm text-center">
            📢 {siteSettings.announcement}
          </div>
        )}

        <p className="text-center text-white/60 text-sm mb-5">
          Вход доступен только через Google аккаунт.
        </p>

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <button
          onClick={() => {
            setAuthMode('login');
            setError('');
            setGoogleModal(true);
          }}
          className="w-full flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white py-3 rounded-xl hover:bg-white/20 transition-all"
        >
          <Chrome className="w-5 h-5" />
          Войти через Google
        </button>

        <button
          onClick={() => {
            setAuthMode('register');
            setError('');
            setGoogleModal(true);
          }}
          className="w-full mt-3 flex items-center justify-center gap-3 bg-indigo-500/20 border border-indigo-300/30 text-white py-3 rounded-xl hover:bg-indigo-500/30 transition-all"
        >
          <Chrome className="w-5 h-5" />
          Зарегистрироваться через Google
        </button>

        <p className="text-center text-white/30 text-xs mt-4">
          Сессия сохраняется автоматически на устройстве.
        </p>
      </div>

      {/* Google login modal */}
      {googleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Chrome className="w-5 h-5" /> {authMode === 'register' ? 'Регистрация через Google' : 'Вход через Google'}
            </h3>
            <p className="text-white/50 text-sm mb-4">
              {authMode === 'register'
                ? 'Создайте аккаунт: пароль будет закреплен за вашим email'
                : 'Введите данные вашего Google аккаунта'}
            </p>
            <input
              type="text"
              placeholder="Имя"
              value={gName}
              onChange={e => setGName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 mb-3 focus:outline-none focus:border-indigo-400"
            />
            <input
              type="email"
              placeholder="Google Email"
              value={gEmail}
              onChange={e => setGEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 mb-4 focus:outline-none focus:border-indigo-400"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={gPassword}
              onChange={e => setGPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 mb-4 focus:outline-none focus:border-indigo-400"
            />
            <div className="flex gap-3">
              <button onClick={() => setGoogleModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition">
                Отмена
              </button>
              <button onClick={handleGoogleLogin} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition">
                {authMode === 'register' ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </div>
            <button
              onClick={() => {
                setError('');
                setAuthMode(authMode === 'register' ? 'login' : 'register');
              }}
              className="w-full mt-3 text-xs text-indigo-300 hover:text-indigo-200 transition"
            >
              {authMode === 'register' ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
