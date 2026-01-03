
import React, { useState } from 'react';
import { UserProfile, Intent, Offer, IntentType, ProductCondition, Address } from '../types';
import { Plus, Package, Clock, DollarSign, ChevronRight, Check, X, Camera, MapPin, Truck, Edit2, Loader2, Search, Hash, FilePlus } from 'lucide-react';

interface BuyerDashboardProps {
  user: UserProfile;
  onCreateIntent: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

const MOCK_INTENTS: Intent[] = [
  {
    id: 'i1',
    userId: 'u1',
    type: IntentType.BUY,
    productName: 'iPhone 15 Pro Max 256GB',
    description: 'Procuro iPhone 15 Pro Max, de preferência na cor Titânio Natural. Pode ser novo ou usado em excelente estado.',
    budget: 6500,
    condition: ProductCondition.BOTH,
    createdAt: '2024-05-10T14:30:00Z',
    status: 'OPEN',
    offersCount: 2
  },
  {
    id: 'i2',
    userId: 'u1',
    type: IntentType.TRADE,
    productName: 'PlayStation 5',
    description: 'Troco meu Xbox Series X com 2 controles por PS5 Slim.',
    budget: 500,
    condition: ProductCondition.USED,
    createdAt: '2024-05-08T09:15:00Z',
    status: 'OPEN',
    offersCount: 0
  }
];

const MOCK_OFFERS: Offer[] = [
  {
    id: 'o1',
    intentId: 'i1',
    supplierId: 's1',
    supplierName: 'Mega Tech Store',
    price: 6400,
    condition: ProductCondition.NEW,
    description: 'Produto novo, lacrado, com nota fiscal e garantia de 1 ano Apple.',
    images: ['https://picsum.photos/400/300?random=1'],
    paymentTerms: 'À vista no PIX ou 12x no cartão com acréscimo.',
    status: 'PENDING',
    validUntil: '2024-05-15'
  },
  {
    id: 'o2',
    intentId: 'i1',
    supplierId: 's2',
    supplierName: 'Recondicionados VIP',
    price: 5800,
    condition: ProductCondition.USED,
    description: 'Produto semi-novo, 98% bateria, sem riscos na tela. Acompanha carregador original.',
    images: ['https://picsum.photos/400/300?random=2'],
    paymentTerms: 'Parcelamento em até 10x sem juros.',
    status: 'PENDING',
    validUntil: '2024-05-14'
  }
];

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ user, onCreateIntent, onUpdateUser }) => {
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [checkoutOffer, setCheckoutOffer] = useState<Offer | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [tempAddress, setTempAddress] = useState<Address>(user.deliveryAddress || user.registrationAddress);

  const handleCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setTempAddress(prev => ({ ...prev, zip: cleanCep }));

    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setTempAddress(prev => ({
            ...prev,
            street: data.logradouro,
            city: data.localidade,
            state: data.uf,
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleFinalizePurchase = () => {
    // Update user's delivery address in state
    onUpdateUser({
      ...user,
      deliveryAddress: tempAddress
    });
    alert('Compra realizada com sucesso!');
    setCheckoutOffer(null);
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
        {/* Intents List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 px-2 flex items-center gap-2">
            <Clock size={18} className="text-blue-500" /> Ativos
          </h2>
          {MOCK_INTENTS.map((intent) => (
            <div 
              key={intent.id}
              onClick={() => setSelectedIntent(intent)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer group ${selectedIntent?.id === intent.id ? 'bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-lg' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${intent.type === IntentType.BUY ? 'bg-emerald-100 text-emerald-700' : intent.type === IntentType.SELL ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {intent.type === IntentType.BUY ? 'Compra' : intent.type === IntentType.SELL ? 'Venda' : 'Troca'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">há 2 dias</span>
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
                  <span>{intent.offersCount} ofertas</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Offers Detailed View */}
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
                {MOCK_OFFERS.filter(o => o.intentId === selectedIntent.id).length > 0 ? (
                  <div className="space-y-6">
                    {MOCK_OFFERS.filter(o => o.intentId === selectedIntent.id).map(offer => (
                      <div key={offer.id} className="border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 h-48 md:h-auto bg-slate-100 relative">
                            <img src={offer.images[0]} alt="Produto" className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded text-[10px] font-bold text-slate-800 shadow-sm">
                              {offer.condition === ProductCondition.NEW ? 'NOVO' : 'USADO'}
                            </div>
                          </div>
                          <div className="md:w-2/3 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-900 text-lg">{offer.supplierName}</h4>
                                <div className="text-right">
                                  <p className="text-2xl font-black text-emerald-600">{formatCurrency(offer.price)}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">Expira em {offer.validUntil}</p>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 mb-4">{offer.description}</p>
                              <div className="bg-slate-50 p-3 rounded-xl mb-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Condições de Pagamento</p>
                                <p className="text-xs text-slate-700">{offer.paymentTerms}</p>
                              </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <button 
                                onClick={() => setCheckoutOffer(offer)}
                                className="flex-grow bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95"
                              >
                                <Check size={18} /> Aceitar Oferta
                              </button>
                              <button className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                <X size={18} /> Recusar
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
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
              <h3 className="text-xl font-bold">Finalizar Pedido</h3>
              <button onClick={() => setCheckoutOffer(null)} className="p-2 hover:bg-blue-700 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Product Summary */}
              <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <img src={checkoutOffer.images[0]} className="w-20 h-20 rounded-xl object-cover shadow-sm" />
                <div>
                  <h4 className="font-bold text-slate-900">{selectedIntent?.productName}</h4>
                  <p className="text-sm text-slate-500">{checkoutOffer.supplierName}</p>
                  <p className="text-lg font-black text-blue-600 mt-1">{formatCurrency(checkoutOffer.price)}</p>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <Truck size={18} className="text-blue-600" /> Endereço de Entrega
                  </h4>
                  <button 
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Edit2 size={14} /> {isEditingAddress ? 'Cancelar' : 'Alterar'}
                  </button>
                </div>

                {!isEditingAddress ? (
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <p className="text-sm font-medium text-slate-900">{tempAddress.street}, {tempAddress.number}</p>
                    {tempAddress.complement && <p className="text-sm text-slate-500">{tempAddress.complement}</p>}
                    <p className="text-sm text-slate-500">{tempAddress.city}, {tempAddress.state} - {tempAddress.zip}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CEP de Entrega</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                          maxLength={8}
                          className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                          placeholder="Digite apenas números"
                          value={tempAddress.zip} 
                          onChange={e => handleCepLookup(e.target.value)}
                        />
                        {loadingCep && (
                          <Loader2 className="absolute right-3 top-2.5 text-blue-500 animate-spin" size={16} />
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Rua / Logradouro</label>
                      <input 
                        className="w-full px-4 py-2 rounded-xl border border-slate-200" 
                        value={tempAddress.street} 
                        onChange={e => setTempAddress({...tempAddress, street: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Número</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-2 text-slate-400" size={14} />
                        <input 
                          className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200" 
                          value={tempAddress.number} 
                          onChange={e => setTempAddress({...tempAddress, number: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Complemento</label>
                      <div className="relative">
                        <FilePlus className="absolute left-3 top-2 text-slate-400" size={14} />
                        <input 
                          className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200" 
                          value={tempAddress.complement || ''} 
                          onChange={e => setTempAddress({...tempAddress, complement: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cidade</label>
                      <input 
                        className="w-full px-4 py-2 rounded-xl border border-slate-200" 
                        value={tempAddress.city} 
                        onChange={e => setTempAddress({...tempAddress, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">UF</label>
                      <input 
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 uppercase" 
                        maxLength={2} 
                        value={tempAddress.state} 
                        onChange={e => setTempAddress({...tempAddress, state: e.target.value})}
                      />
                    </div>
                    <button 
                      onClick={() => setIsEditingAddress(false)}
                      className="md:col-span-2 bg-blue-100 text-blue-700 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-200 transition-colors mt-2"
                    >
                      Salvar Novo Endereço
                    </button>
                  </div>
                )}
              </div>

              {/* Final Summary */}
              <div className="pt-6 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(checkoutOffer.price)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Frete</span>
                  <span className="text-emerald-600 font-bold uppercase">Grátis</span>
                </div>
                <div className="flex justify-between text-slate-900 text-xl font-black pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(checkoutOffer.price)}</span>
                </div>
              </div>

              <button 
                onClick={handleFinalizePurchase}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95"
              >
                CONFIRMAR E PAGAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
