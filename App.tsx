
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, LayoutDashboard, Search, PlusCircle, User, LogOut, Bell, Store, ArrowRightLeft, ShoppingCart, Tag, Check, Clock, X } from 'lucide-react';
import { UserRole, UserProfile, Intent, Offer, IntentType, ProductCondition } from './types';
import LandingPage from './pages/LandingPage';
import Registration from './pages/Registration';
import BuyerDashboard from './pages/BuyerDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import NewIntentForm from './pages/NewIntentForm';

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Nova Proposta', message: 'Você recebeu uma nova oferta para o iPhone 15.', time: '5 min atrás', read: false, icon: Tag, color: 'text-blue-600' },
  { id: 2, title: 'Intenção Expirando', message: 'Sua intenção de compra de PS5 expira em 24h.', time: '2 horas atrás', read: false, icon: Clock, color: 'text-amber-600' },
  { id: 3, title: 'Venda Concluída', message: 'O pagamento do MacBook Air foi confirmado.', time: 'Ontem', read: true, icon: Check, color: 'text-emerald-600' },
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<'LANDING' | 'REGISTER' | 'DASHBOARD' | 'NEW_INTENT'>('LANDING');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simple authentication simulation
  const handleLogin = (role: UserRole) => {
    const mockUser: UserProfile = {
      id: 'u1',
      name: role === UserRole.BUYER ? 'João Silva' : 'Tech Imports Ltda',
      email: role === UserRole.BUYER ? 'joao@email.com' : 'vendas@techimports.com',
      role: role,
      document: role === UserRole.BUYER ? '123.456.789-00' : '12.345.678/0001-99',
      registrationAddress: {
        street: 'Av. Paulista',
        number: '1000',
        complement: 'Cj 12',
        city: 'São Paulo',
        state: 'SP',
        zip: '01310-100'
      },
      deliveryAddress: role === UserRole.BUYER ? {
        street: 'Av. Paulista',
        number: '1000',
        complement: 'Cj 12',
        city: 'São Paulo',
        state: 'SP',
        zip: '01310-100'
      } : undefined,
      paymentMethod: role === UserRole.BUYER ? {
        type: 'PIX',
        details: 'pix@email.com'
      } : undefined
    };
    setUser(mockUser);
    setCurrentPage('DASHBOARD');
  };

  const logout = () => {
    setUser(null);
    setCurrentPage('LANDING');
    setShowNotifications(false);
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const renderPage = () => {
    if (!user && currentPage === 'LANDING') return <LandingPage onStart={(role) => {
      setCurrentPage('REGISTER');
    }} onLogin={handleLogin} />;
    
    if (!user && currentPage === 'REGISTER') return <Registration onComplete={(data) => {
      setUser(data);
      setCurrentPage('DASHBOARD');
    }} onBack={() => setCurrentPage('LANDING')} />;

    if (user && currentPage === 'DASHBOARD') {
      return user.role === UserRole.BUYER ? (
        <BuyerDashboard user={user} onUpdateUser={updateUser} onCreateIntent={() => setCurrentPage('NEW_INTENT')} />
      ) : (
        <SupplierDashboard user={user} />
      );
    }

    if (user && currentPage === 'NEW_INTENT') {
      return <NewIntentForm user={user} onComplete={() => setCurrentPage('DASHBOARD')} onCancel={() => setCurrentPage('DASHBOARD')} />;
    }

    return <div className="p-10">Página não encontrada</div>;
  };

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => user ? setCurrentPage('DASHBOARD') : setCurrentPage('LANDING')}
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              comproum<span className="text-blue-600">.com.br</span>
            </span>
          </div>

          {user && (
            <div className="flex items-center gap-4 lg:gap-8">
              <nav className="hidden md:flex items-center gap-6">
                <button 
                  onClick={() => setCurrentPage('DASHBOARD')}
                  className={`flex items-center gap-2 text-sm font-medium ${currentPage === 'DASHBOARD' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>
                {user.role === UserRole.BUYER && (
                  <button 
                    onClick={() => setCurrentPage('NEW_INTENT')}
                    className={`flex items-center gap-2 text-sm font-medium ${currentPage === 'NEW_INTENT' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                  >
                    <PlusCircle size={18} />
                    Quero Comprar
                  </button>
                )}
                
                {/* Notification Bell with Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Notificações</h3>
                        <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">Marcar todas como lidas</button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {MOCK_NOTIFICATIONS.length > 0 ? (
                          MOCK_NOTIFICATIONS.map((notif) => (
                            <div 
                              key={notif.id} 
                              className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                            >
                              <div className={`mt-1 p-2 rounded-lg bg-white shadow-sm ${notif.color}`}>
                                <notif.icon size={16} />
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                                  <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center flex flex-col items-center">
                            <Bell size={32} className="text-slate-200 mb-2" />
                            <p className="text-sm text-slate-400">Nenhuma notificação por enquanto.</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                        <button className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">Ver todas as notificações</button>
                      </div>
                    </div>
                  )}
                </div>
              </nav>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role === UserRole.BUYER ? 'Comprador' : 'Fornecedor'}</p>
                </div>
                <button onClick={logout} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          )}
          
          {!user && (
            <div className="flex gap-4">
              <button 
                onClick={() => handleLogin(UserRole.BUYER)}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                Entrar
              </button>
              <button 
                onClick={() => setCurrentPage('REGISTER')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
              >
                Criar Conta
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-50 grayscale">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-bold text-lg tracking-tight">comproum.com.br</span>
            </div>
            <div className="text-sm text-slate-500">
              © 2024 Comprou Ltda. Todos os direitos reservados.
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-blue-600">Privacidade</a>
              <a href="#" className="hover:text-blue-600">Termos de Uso</a>
              <a href="#" className="hover:text-blue-600">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
