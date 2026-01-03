
import React, { useState, useEffect } from 'react';
import { UserProfile, Intent, Offer, IntentType, ProductCondition, Address } from '../types';
import { Database } from '../services/db';
import { Plus, Package, Clock, DollarSign, Check, X, Truck, Loader2, Share2, ArrowLeftRight, AlertCircle, Zap, Smartphone, CreditCard, ShieldCheck, MessageSquare, Trash2, Send } from 'lucide-react';

interface BuyerDashboardProps {
  user: UserProfile;
  onCreateIntent: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ user, onCreateIntent, onUpdateUser }) => {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [checkoutOffer, setCheckoutOffer] = useState<Offer | null>(null);
  const [counterOfferModal, setCounterOfferModal] = useState<Offer | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [tempAddress, setTempAddress] = useState<Address>(user.deliveryAddress || user.registrationAddress);

  useEffect(() => {
    const loadIntents = () => {
      const userIntents = Database.getIntentsByUserId(user.id);
      setIntents(userIntents);
    };
    loadIntents();
    const interval = setInterval(loadIntents, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
    if (selectedIntent) {
      const loadOffers = () => {
        const intentOffers = Database.getOffersByIntentId(selectedIntent.id);
        // Filtramos para não mostrar ofertas que o próprio usuário já recusou nesta visualização principal
        setOffers(intentOffers.filter(o => o.status !== 'REJECTED'));
      };
      loadOffers();
      const interval = setInterval(loadOffers, 3000);
      return () => clearInterval(interval);
    } else {
      setOffers([]);
    }
  }, [selectedIntent]);

  const handleCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setTempAddress(prev => ({ ...prev, zip: cleanCep }));
    setCepError(null);

    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          setCepError('CEP não encontrado.');
          setTempAddress(prev => ({ ...prev, street: '', neighborhood: '', city: '', state: '' }));
        } else {
          setTempAddress(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          }));
          setCepError(null);
        }
      } catch (error) {
        setCepError('Erro na consulta.');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleFinalizePurchase = () => {
    if (isEditingAddress && cepError) {
      alert('Por favor, corrija o CEP antes de continuar.');
      return;
    }
    
    if (checkoutOffer) {
      const updatedOffer = { ...checkoutOffer, status: 'ACCEPTED' as const };
      Database.updateOffer(updatedOffer);
    }

    onUpdateUser({
      ...user,
      deliveryAddress: tempAddress
    });
    alert('Compra realizada com sucesso!');
    setCheckoutOffer(null);
  };

  const handleAcceptOffer = (offer: Offer) => {
    setCheckoutOffer(offer);
    setTempAddress(user.deliveryAddress || user.registrationAddress);
    setIsEditingAddress(false);
  };

  const handleRejectOffer = (offer: Offer) => {
    const updatedOffer = { ...offer, status: 'REJECTED' as const };
    Database.updateOffer(updatedOffer);
    // Atualiza o estado local para remover a oferta da visão imediatamente
    setOffers(prev => prev.filter(o => o.id !== offer.id));
    alert(`Oferta de ${offer.supplierName} recusada.`);
  };

  const handleSendCounterOffer = () => {
    if (!counterOfferModal || !counterPrice) return;
    
    setIsProcessing(true);
    const updatedOffer = { 
      ...counterOfferModal, 
      status: 'COUNTER_OFFERED' as const,
      counterPrice: parseFloat(counterPrice),
      buyerFeedback: counterMessage
    };

    setTimeout(() => {
      Database.updateOffer(updatedOffer);
      setOffers(prev => prev.map(o => o.id === counterOfferModal.id ? updatedOffer : o));
      setIsProcessing(false);
      setCounterOfferModal(null);
      setCounterPrice('');
      setCounterMessage('');
      alert('Contra-proposta enviada com sucesso ao fornecedor!');
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Meus Interesses</h1>
          <p className="text-slate-500">Gerencie suas intenções de compra, venda e troca.</p>
        </div>
        <button 
          onClick={onCreateIntent}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus size={20} /> Nova Intenção
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2">
            <Clock size={18} className="text-blue-500" /> Ativos
          </h2>
          {intents.length > 0 ? (
            intents.map((intent) => (
              <div 
                key={intent.id}
                onClick={() => setSelectedIntent(intent)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer group ${selectedIntent?.id === intent.id ? 'bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-lg' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'}`}
                role="button"
                tabIndex={0}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${intent.type === IntentType.BUY ? 'bg-emerald-100 text-emerald-700' : intent.type === IntentType.SELL ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {intent.type === IntentType.BUY ? 'Compra' : intent.type === IntentType.SELL ? 'Venda' : 'Troca'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(intent.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{intent.productName}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-3">{intent.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-1 text-blue-600 font-bold">
                    <DollarSign size={14} />
                    <span>{formatCurrency(intent.budget)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold bg-slate-50 px-2 py-1 rounded-lg">
                    <Package size={14} />
                    <span>{intent.offersCount || 0} ofertas</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
              <p className="text-sm text-slate-400 font-medium italic">Você ainda não postou nenhuma intenção.</p>
              <button onClick={onCreateIntent} className="mt-4 text-xs font-bold text-blue-600 hover:underline">Começar agora</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedIntent ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedIntent.productName}</h2>
                  <p className="text-sm text-slate-500">Propostas de fornecedores para sua solicitação</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Seu Orçamento</p>
                  <p className="text-lg font-black text-blue-600">{formatCurrency(selectedIntent.budget)}</p>
                </div>
              </div>

              <div className="p-6">
                {offers.length > 0 ? (
                  <div className="space-y-6">
                    {offers.map(offer => (
                      <div key={offer.id} className="border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl transition-all p-2 bg-white">
                        <div className="flex flex-col md:flex-row gap-6 p-4">
                          <div className="md:w-1/2 aspect-video bg-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center">
                            <img src={offer.images[0]} alt={offer.productName} className="w-full h-full object-contain" />
                            <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold text-slate-800 shadow-sm">
                              {offer.condition === ProductCondition.NEW ? 'NOVO' : 'USADO'}
                            </div>
                          </div>
                          <div className="md:w-1/2 flex flex-col justify-between py-2">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-900 text-xl">{offer.supplierName}</h4>
                                <div className="text-right">
                                  <p className="text-2xl font-black text-blue-600">{formatCurrency(offer.price)}</p>
                                  {offer.counterPrice && (
                                    <p className="text-xs font-bold text-indigo-600">Sua contra-proposta: {formatCurrency(offer.counterPrice)}</p>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{offer.description}</p>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-end gap-3 mt-6">
                              <button 
                                onClick={() => handleAcceptOffer(offer)}
                                className="flex-grow md:flex-none px-12 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
                              >
                                <Check size={18} /> Aceitar
                              </button>
                              
                              <button 
                                onClick={() => {
                                  setCounterOfferModal(offer);
                                  setCounterPrice(offer.price.toString());
                                }}
                                className="px-6 py-3 border border-slate-200 text-blue-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                              >
                                <MessageSquare size={18} /> Contra-proposta
                              </button>

                              <button 
                                onClick={() => handleRejectOffer(offer)}
                                className="px-6 py-3 border border-slate-200 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                              >
                                <Trash2 size={18} /> Recusar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-slate-50 p-6 rounded-full mb-4">
                      <Clock size={48} className="text-slate-300 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Aguardando ofertas...</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">
                      Notificamos os fornecedores compatíveis. Em breve você receberá as primeiras propostas aqui.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[500px] text-center p-10">
              <Package size={64} className="text-slate-200 mb-6" />
              <h2 className="text-xl font-bold text-slate-400">Selecione uma intenção ao lado</h2>
              <p className="text-slate-400 mt-2 max-w-xs">Escolha um item da lista para visualizar as propostas enviadas pelos fornecedores.</p>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutOffer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className={`p-6 border-b border-slate-100 flex justify-between items-center text-white shrink-0 ${user.quickPaymentEnabled ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              <div className="flex items-center gap-2">
                {user.quickPaymentEnabled && <Zap size={20} fill="currentColor" />}
                <h3 className="text-xl font-bold">
                  {user.quickPaymentEnabled ? 'Pagamento Rápido' : 'Finalizar Pedido'}
                </h3>
              </div>
              <button 
                onClick={() => { setCheckoutOffer(null); setCepError(null); }} 
                className="p-2 hover:bg-black/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto flex-grow text-slate-900">
              <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <img src={checkoutOffer.images[0]} className="w-24 h-24 rounded-xl object-cover shadow-sm border border-white" alt="" />
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-900 text-lg">{selectedIntent?.productName}</h4>
                  <p className="text-sm text-slate-500">Fornecido por {checkoutOffer.supplierName}</p>
                  <p className="text-2xl font-black text-blue-600 mt-2">{formatCurrency(checkoutOffer.price)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Truck size={18} className="text-blue-600" /> Endereço de Entrega
                </h4>
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <p className="text-sm font-medium text-slate-900">{tempAddress.street}, {tempAddress.number}</p>
                  <p className="text-sm text-slate-500">{tempAddress.neighborhood}, {tempAddress.city}, {tempAddress.state} - {tempAddress.zip}</p>
                </div>
              </div>

              {user.paymentMethod && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <DollarSign size={18} className="text-blue-600" /> Método de Pagamento
                  </h4>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.paymentMethod.type === 'PIX' ? <Smartphone size={20} className="text-emerald-600" /> : <CreditCard size={20} className="text-blue-600" />}
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.paymentMethod.type}</p>
                        <p className="text-xs text-slate-500">{user.paymentMethod.details}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 text-center space-y-4">
                <button 
                  onClick={handleFinalizePurchase}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95"
                >
                  {user.quickPaymentEnabled && <Zap size={24} fill="currentColor" />}
                  CONFIRMAR E PAGAR AGORA
                </button>
                
                <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={12} />
                  Suas informações estão seguras. Ao finalizar, você aceita nossa 
                  <a href="#" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold">Política de Privacidade</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterOfferModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
              <div className="flex items-center gap-2">
                <ArrowLeftRight size={20} />
                <h3 className="text-lg font-bold">Nova Contra-proposta</h3>
              </div>
              <button onClick={() => setCounterOfferModal(null)} className="p-2 hover:bg-indigo-700 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-3">
                <AlertCircle className="text-indigo-600 shrink-0" size={20} />
                <p className="text-sm text-indigo-700 leading-relaxed">
                  Sugerir um valor menor pode agilizar o fechamento, mas lembre-se que o fornecedor também tem seus custos.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Seu Valor Sugerido</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 font-bold">R$</span>
                    <input 
                      type="number"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" 
                      placeholder="0,00" 
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic">Valor original: {formatCurrency(counterOfferModal.price)}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Mensagem (opcional)</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24 resize-none" 
                    placeholder="Explique o motivo da contra-proposta..." 
                    value={counterMessage}
                    onChange={(e) => setCounterMessage(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleSendCounterOffer}
                  disabled={isProcessing || !counterPrice}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  Enviar Contra-proposta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
