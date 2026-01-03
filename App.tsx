
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, LayoutDashboard, PlusCircle, Bell, LogOut, X, Lock, AlertCircle, AtSign, Loader2, User as UserIcon } from 'lucide-react';
import { UserRole, UserProfile } from './types';
import { Database } from './services/db';
import LandingPage from './pages/LandingPage';
import Registration from './pages/Registration';
import BuyerDashboard from './pages/BuyerDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import NewIntentForm from './pages/NewIntentForm';
import ProfilePage from './pages/ProfilePage';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(Database.getSession());
  const [currentPage, setCurrentPage] = useState<'LANDING' | 'REGISTER' | 'DASHBOARD' | 'NEW_INTENT' | 'PROFILE'>('LANDING');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSocialLoggingIn, setIsSocialLoggingIn] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Monitoramento de notificações
  useEffect(() => {
    if (!user || user.role !== UserRole.BUYER) {
      setUnreadNotifications(0);
      return;
    }

    const checkNotifications = () => {
      const userIntents = Database.getIntentsByUserId(user.id);
      const intentIds = userIntents.map(i => i.id);
      const allOffers = Database.getOffers();
      const relevantOffers = allOffers.filter(o => intentIds.includes(o.intentId));
      
      const lastCount = parseInt(localStorage.getItem(`last_offer_count_${user.id}`) || '0');
      const diff = relevantOffers.length - lastCount;
      
      setUnreadNotifications(diff > 0 ? diff : 0);
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const clearNotifications = () => {
    if (!user) return;
    const userIntents = Database.getIntentsByUserId(user.id);
    const intentIds = userIntents.map(i => i.id);
    const allOffers = Database.getOffers();
    const relevantOffersCount = allOffers.filter(o => intentIds.includes(o.intentId)).length;
    
    localStorage.setItem(`last_offer_count_${user.id}`, relevantOffersCount.toString());
    setUnreadNotifications(0);
    
    if (currentPage !== 'DASHBOARD') {
      setCurrentPage('DASHBOARD');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const foundUser = Database.findUserByUsername(loginUsername);

    if (foundUser && foundUser.password === loginPassword) {
      loginUser(foundUser);
    } else {
      setLoginError('Usuário ou senha inválidos.');
    }
  };

  const loginUser = (userProfile: UserProfile) => {
    setUser(userProfile);
    Database.setSession(userProfile);
    setCurrentPage('DASHBOARD');
    setShowLoginModal(false);
    setLoginUsername('');
    setLoginPassword('');
    setIsSocialLoggingIn(false);
  };

  const handleGoogleLogin = () => {
    setIsSocialLoggingIn(true);
    setLoginError(null);

    // Simulação do Fluxo Google OAuth 2.0
    setTimeout(() => {
      const googleUserData = {
        name: 'Usuário Google Teste',
        email: 'social@gmail.com',
        id: 'google_123456'
      };

      let foundUser = Database.findUserByEmail(googleUserData.email);

      if (!foundUser) {
        const newUser: UserProfile = {
          id: `g_${Math.random().toString(36).substr(2, 9)}`,
          name: googleUserData.name,
          username: googleUserData.email.split('@')[0] + '_google',
          email: googleUserData.email,
          phone: '',
          role: UserRole.BUYER,
          document: '000.000.000-00',
          registrationAddress: { street: '', number: '', neighborhood: '', city: '', state: '', zip: '' }
        };
        Database.saveUser(newUser);
        foundUser = newUser;
      }

      loginUser(foundUser);
    }, 1500);
  };

  const logout = () => {
    setUser(null);
    Database.setSession(null);
    setCurrentPage('LANDING');
  };

  const onRegistrationComplete = (newUser: UserProfile) => {
    Database.saveUser(newUser);
    loginUser(newUser);
  };

  const handleUpdateProfile = (updatedUser: UserProfile) => {
    Database.updateUser(updatedUser);
    setUser(updatedUser);
    setCurrentPage('DASHBOARD');
  };

  const renderPage = () => {
    if (!user && currentPage === 'LANDING') return <LandingPage onStart={() => setCurrentPage('REGISTER')} onLogin={() => setShowLoginModal(true)} />;
    if (!user && currentPage === 'REGISTER') return <Registration onComplete={onRegistrationComplete} onBack={() => setCurrentPage('LANDING')} />;

    if (user) {
      switch (currentPage) {
        case 'PROFILE':
          return <ProfilePage user={user} onSave={handleUpdateProfile} onBack={() => setCurrentPage('DASHBOARD')} />;
        case 'NEW_INTENT':
          return <NewIntentForm user={user} onComplete={() => setCurrentPage('DASHBOARD')} onCancel={() => setCurrentPage('DASHBOARD')} />;
        case 'DASHBOARD':
        default:
          return user.role === UserRole.BUYER ? (
            <BuyerDashboard user={user} onUpdateUser={setUser} onCreateIntent={() => setCurrentPage('NEW_INTENT')} />
          ) : (
            <SupplierDashboard user={user} />
          );
      }
    }

    return <LandingPage onStart={() => setCurrentPage('REGISTER')} onLogin={() => setShowLoginModal(true)} />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => user ? setCurrentPage('DASHBOARD') : setCurrentPage('LANDING')}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">comproum<span className="text-blue-600">.com.br</span></span>
          </div>

          {user ? (
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-6">
                <button onClick={() => setCurrentPage('DASHBOARD')} className={`flex items-center gap-2 text-sm font-medium ${currentPage === 'DASHBOARD' ? 'text-blue-600' : 'text-slate-600'}`}><LayoutDashboard size={18} /> Dashboard</button>
                {user.role === UserRole.BUYER && <button onClick={() => setCurrentPage('NEW_INTENT')} className={`flex items-center gap-2 text-sm font-medium ${currentPage === 'NEW_INTENT' ? 'text-blue-600' : 'text-slate-600'}`}><PlusCircle size={18} /> Comprar</button>}
                <button onClick={() => setCurrentPage('PROFILE')} className={`flex items-center gap-2 text-sm font-medium ${currentPage === 'PROFILE' ? 'text-blue-600' : 'text-slate-600'}`}><UserIcon size={18} /> Meu Perfil</button>
              </nav>
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <button 
                  onClick={clearNotifications}
                  className="relative p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors group"
                  title="Ver Notificações"
                >
                  <Bell size={20} className={unreadNotifications > 0 ? "text-blue-600" : ""} />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{user.role === UserRole.BUYER ? 'Comprador' : 'Fornecedor'}</p>
                </div>
                <button onClick={logout} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><LogOut size={18} /></button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <button onClick={() => setShowLoginModal(true)} className="text-sm font-semibold text-slate-600 hover:text-blue-600">Entrar</button>
              <button onClick={() => setCurrentPage('REGISTER')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Criar Conta</button>
            </div>
          )}
        </div>
      </header>

      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
              <h3 className="text-xl font-bold">Acesse sua Conta</h3>
              <button onClick={() => setShowLoginModal(false)} className="p-2 hover:bg-blue-700 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <button onClick={handleGoogleLogin} disabled={isSocialLoggingIn} className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70">
                {isSocialLoggingIn ? <Loader2 className="animate-spin text-blue-600" size={20} /> : <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.177 0 7.55 0 9s.347 2.823.957 4.038l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/></svg>}
                {isSocialLoggingIn ? 'Autenticando...' : 'Entrar com Google'}
              </button>
              <div className="relative flex items-center justify-center"><div className="w-full border-t border-slate-200"></div><span className="relative px-3 bg-white text-xs font-bold text-slate-400 uppercase tracking-widest">Ou use seu usuário</span></div>
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-1"><label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Usuário</label><div className="relative"><AtSign className="absolute left-3 top-3.5 text-slate-400" size={18} /><input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome de usuário" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} /></div></div>
                <div className="space-y-1"><label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label><div className="relative"><Lock className="absolute left-3 top-3.5 text-slate-400" size={18} /><input required type="password" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="********" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} /></div></div>
                {loginError && <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex gap-2 items-center text-red-600 text-xs font-bold"><AlertCircle size={16} />{loginError}</div>}
                <button type="submit" disabled={isSocialLoggingIn} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50">Entrar Agora</button>
              </form>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow">{renderPage()}</main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 grayscale"><ShoppingBag className="w-5 h-5" /><span className="font-bold text-lg tracking-tight">comproum.com.br</span></div>
          <div className="text-sm text-slate-500">© 2024 Comprou Ltda. Todos os direitos reservados.</div>
          <div className="flex gap-8 text-sm font-medium text-slate-500"><a href="#" className="hover:text-blue-600">Privacidade</a><a href="#" className="hover:text-blue-600">Termos</a></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
