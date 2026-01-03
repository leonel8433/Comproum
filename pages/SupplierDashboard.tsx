
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserProfile, Intent, Offer, IntentType, ProductCondition, BUSINESS_CATEGORIES } from '../types';
import { Database } from '../services/db';
import { Target, Search, BarChart3, Package, Users, Send, Filter, CheckCircle, DollarSign, SlidersHorizontal, ArrowUpDown, Camera, X, Image as ImageIcon, Plus, Bell, Calendar, Clock, AlertCircle, Loader2, Coins, Briefcase, ArrowLeftRight, Ban } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

interface SupplierDashboardProps {
  user: UserProfile;
}

const ANALYTICS_DATA = [
  { name: 'Seg', v: 4000 },
  { name: 'Ter', v: 3000 },
  { name: 'Qua', v: 2000 },
  { name: 'Qui', v: 2780 },
  { name: 'Sex', v: 1890 },
  { name: 'Sáb', v: 2390 },
  { name: 'Dom', v: 3490 },
];

const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'OPPORTUNITIES' | 'MY_OFFERS' | 'CATALOG'>('OPPORTUNITIES');
  const [selectedOp, setSelectedOp] = useState<Intent | null>(null);
  const [allOpportunities, setAllOpportunities] = useState<Intent[]>([]);
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  
  // Proposal Form State
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalValidity, setProposalValidity] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega dados reais do banco de dados
  useEffect(() => {
    const loadData = () => {
      const intents = Database.getIntents();
      // FILTRO CRÍTICO: Filtra apenas intenções abertas, que não são do próprio usuário,
      // e que pertençam a um dos segmentos de atuação do fornecedor.
      const filteredIntents = intents.filter(i => {
        const isOpen = i.status === 'OPEN';
        const isNotMine = i.userId !== user.id;
        const matchesSegment = user.businessSegments?.includes(i.category) || false;
        return isOpen && isNotMine && matchesSegment;
      });
      
      setAllOpportunities(filteredIntents);
      
      const offers = Database.getOffers();
      setMyOffers(offers.filter(o => o.supplierId === user.id));
    };

    loadData();
    const interval = setInterval(loadData, 5000); 
    return () => clearInterval(interval);
  }, [user.id, user.businessSegments]);

  // Follow-up Modal State
  const [followUpOffer, setFollowUpOffer] = useState<Offer | null>(null);
  
  // Filter and Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<IntentType | 'ALL'>('ALL');
  const [filterCondition, setFilterCondition] = useState<ProductCondition | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'BUDGET_DESC' | 'BUDGET_ASC'>('NEWEST');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Image Upload State
  const [proposalImages, setProposalImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProposalImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setProposalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendProposal = () => {
    if (!selectedOp || !proposalPrice || !proposalValidity) {
      alert('Por favor, preencha o preço e a validade da oferta.');
      return;
    }

    setIsSubmitting(true);

    const newOffer: Offer = {
      id: `o_${Math.random().toString(36).substr(2, 9)}`,
      intentId: selectedOp.id,
      supplierId: user.id,
      supplierName: user.name,
      productName: selectedOp.productName,
      price: parseFloat(proposalPrice),
      condition: selectedOp.condition === ProductCondition.BOTH ? ProductCondition.NEW : selectedOp.condition,
      description: proposalDesc,
      images: proposalImages.length > 0 ? proposalImages : ['https://picsum.photos/400/300?random=' + Math.random()],
      paymentTerms: 'Condições informadas na descrição.',
      status: 'PENDING',
      validUntil: proposalValidity
    };

    setTimeout(() => {
      Database.saveOffer(newOffer);
      setMyOffers(prev => [newOffer, ...prev]);
      setIsSubmitting(false);
      setSelectedOp(null);
      setProposalImages([]);
      setProposalPrice('');
      setProposalValidity('');
      setProposalDesc('');
      alert('Sua proposta foi enviada com sucesso ao comprador!');
    }, 1000);
  };

  const handleScheduleFollowUp = (hours: number) => {
    if (!followUpOffer) return;
    
    const followUpDate = new Date();
    followUpDate.setHours(followUpDate.getHours() + hours);
    
    const offers = Database.getOffers();
    const updatedOffers = offers.map(off => 
      off.id === followUpOffer.id 
        ? { ...off, followUpAt: followUpDate.toISOString() }
        : off
    );
    localStorage.setItem('comproum_offers', JSON.stringify(updatedOffers));
    setMyOffers(updatedOffers.filter(o => o.supplierId === user.id));
    
    setFollowUpOffer(null);
    alert(`Lembrete agendado para ${followUpDate.toLocaleString('pt-BR')}`);
  };

  const filteredOpportunities = useMemo(() => {
    let result = [...allOpportunities];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(op => 
        op.productName.toLowerCase().includes(query) || 
        op.description.toLowerCase().includes(query)
      );
    }

    if (filterType !== 'ALL') {
      result = result.filter(op => op.type === filterType);
    }

    if (filterCondition !== 'ALL') {
      result = result.filter(op => op.condition === filterCondition || op.condition === ProductCondition.BOTH);
    }

    if (minPrice && !isNaN(parseFloat(minPrice))) {
      result = result.filter(op => op.budget >= parseFloat(minPrice));
    }
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      result = result.filter(op => op.budget <= parseFloat(maxPrice));
    }

    result.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'BUDGET_DESC') {
        return b.budget - a.budget;
      }
      if (sortBy === 'BUDGET_ASC') {
        return a.budget - b.budget;
      }
      return 0;
    });

    return result;
  }, [allOpportunities, searchQuery, filterType, filterCondition, sortBy, minPrice, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Portal do Fornecedor</h1>
          <p className="text-slate-500">Transforme intenções de compra em vendas reais.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {user.businessSegments?.map(s => (
              <span key={s} className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                <Briefcase size={10} /> {s}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-4 bg-white p-1 rounded-xl border border-slate-200">
          {[
            { id: 'OPPORTUNITIES', label: 'Oportunidades', icon: Target },
            { id: 'MY_OFFERS', label: 'Minhas Ofertas', icon: CheckCircle },
            { id: 'CATALOG', label: 'Catálogo', icon: Package }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Performance</h3>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ANALYTICS_DATA}>
                  <Bar dataKey="v" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Conversão</p>
                <p className="text-lg font-black text-slate-900">12.5%</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Vendas</p>
                <p className="text-lg font-black text-slate-900">R$ {myOffers.filter(o => o.status === 'ACCEPTED').reduce((acc, o) => acc + o.price, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-600/20">
            <h3 className="font-bold text-lg mb-2">Dica de Vendedor</h3>
            <p className="text-blue-100 text-xs leading-relaxed opacity-90">
              Você está visualizando apenas intenções das categorias <span className="font-bold text-white underline">{user.businessSegments?.join(', ')}</span>.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'OPPORTUNITIES' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      placeholder="Buscar por produto ou descrição..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <div className="relative w-full">
                      <ArrowUpDown className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={16} />
                      <select 
                        className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium appearance-none cursor-pointer"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                      >
                        <option value="NEWEST">Mais Recentes</option>
                        <option value="BUDGET_DESC">Maior Orçamento</option>
                        <option value="BUDGET_ASC">Menor Orçamento</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo de Intenção</label>
                    <div className="flex gap-2">
                      {['ALL', IntentType.BUY, IntentType.SELL, IntentType.TRADE].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type as any)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${filterType === type ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                        >
                          {type === 'ALL' ? 'Todos' : type === IntentType.BUY ? 'Compra' : type === IntentType.SELL ? 'Venda' : 'Troca'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</label>
                    <div className="flex gap-2">
                      {['ALL', ProductCondition.NEW, ProductCondition.USED].map((cond) => (
                        <button
                          key={cond}
                          onClick={() => setFilterCondition(cond as any)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${filterCondition === cond ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                        >
                          {cond === 'ALL' ? 'Qualquer' : cond === ProductCondition.NEW ? 'Novo' : 'Usado'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 flex-grow max-w-[280px]">
                    <div className="flex items-center gap-1 mb-2">
                      <Coins size={12} className="text-slate-400" />
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faixa de Orçamento (R$)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-2.5 text-[10px] font-bold text-slate-400">R$</span>
                        <input 
                          type="number"
                          placeholder="Mín"
                          className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                      </div>
                      <span className="text-slate-300">-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-2.5 text-[10px] font-bold text-slate-400">R$</span>
                        <input 
                          type="number"
                          placeholder="Máx"
                          className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('ALL');
                      setFilterCondition('ALL');
                      setSortBy('NEWEST');
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                  >
                    <X size={14} /> Limpar
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users size={20} className="text-blue-500" /> 
                    {filteredOpportunities.length} Clientes em sua área de atuação
                  </h2>
                </div>

                {filteredOpportunities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredOpportunities.map(op => (
                      <div 
                        key={op.id}
                        onClick={() => {
                          setSelectedOp(op);
                          setProposalImages([]);
                          setProposalPrice(op.budget.toString());
                        }}
                        className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                      >
                        <div className="relative">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${op.type === IntentType.BUY ? 'bg-emerald-100 text-emerald-700' : op.type === IntentType.SELL ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                {op.type === IntentType.BUY ? 'Compra' : op.type === IntentType.SELL ? 'Venda' : 'Troca'}
                              </span>
                              <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded text-[10px] font-bold border border-slate-100">
                                {op.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 font-black text-lg">
                              <DollarSign size={18} />
                              {formatCurrency(op.budget)}
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{op.productName}</h3>
                          <p className="text-sm text-slate-500 line-clamp-3 mb-4">{op.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 relative">
                           <span className="text-[10px] text-slate-400 font-medium italic">
                            Publicado em {new Date(op.createdAt).toLocaleDateString('pt-BR')}
                           </span>
                           <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md text-sm">
                            <Send size={16} /> Fazer Proposta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center flex flex-col items-center">
                    <Search size={64} className="text-slate-200 mb-6" />
                    <h2 className="text-xl font-bold text-slate-900">Nenhuma oportunidade em sua área</h2>
                    <p className="text-slate-500 mt-2 max-w-xs">Não há intenções de compra abertas nos seus segmentos (<span className="font-bold">{user.businessSegments?.join(', ')}</span>).</p>
                    <button onClick={() => setActiveTab('CATALOG')} className="mt-6 text-blue-600 font-bold hover:underline text-sm">Atualizar meus segmentos no perfil</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'MY_OFFERS' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle size={20} className="text-emerald-500" /> 
                  Minhas Ofertas Enviadas
                </h2>
              </div>

              {myOffers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {myOffers.map(off => (
                    <div key={off.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow relative overflow-hidden">
                      <div className="md:w-32 h-32 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                        <img src={off.images[0]} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-grow space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{off.productName}</h3>
                            <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded ${
                              off.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 
                              off.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                              off.status === 'COUNTER_OFFERED' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {off.status === 'PENDING' ? 'Em análise' : 
                               off.status === 'ACCEPTED' ? 'Venda Confirmada' : 
                               off.status === 'REJECTED' ? 'Proposta Recusada' : 
                               'Contra-proposta Recebida'}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-blue-600">{formatCurrency(off.price)}</p>
                            {off.counterPrice && (
                              <p className="text-sm font-black text-indigo-600 flex items-center justify-end gap-1">
                                <ArrowLeftRight size={14} /> Sugestão: {formatCurrency(off.counterPrice)}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 font-medium">Válida até {new Date(off.validUntil).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-500 line-clamp-2">{off.description}</p>
                        
                        {off.status === 'COUNTER_OFFERED' && (
                          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                            <p className="text-xs font-bold text-indigo-700 flex items-center gap-2 mb-1">
                              <AlertCircle size={14} /> O comprador solicitou um novo valor
                            </p>
                            {off.buyerFeedback && (
                              <p className="text-xs text-indigo-600 italic">"{off.buyerFeedback}"</p>
                            )}
                            <button 
                              onClick={() => {
                                setSelectedOp(Database.getIntents().find(i => i.id === off.intentId) || null);
                                setProposalPrice(off.counterPrice?.toString() || '');
                              }}
                              className="mt-3 text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              Atualizar Oferta
                            </button>
                          </div>
                        )}

                        {off.status === 'REJECTED' && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2">
                            <Ban className="text-red-500" size={16} />
                            <p className="text-xs font-bold text-red-700">O comprador recusou esta proposta.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center flex flex-col items-center">
                  <CheckCircle size={64} className="text-slate-200 mb-6" />
                  <h2 className="text-xl font-bold text-slate-900">Nenhuma oferta enviada</h2>
                  <p className="text-slate-500 mt-2 max-w-xs">Comece a responder as intenções de compra dos clientes para ver suas propostas aqui.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'CATALOG' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center flex flex-col items-center">
              <Package size={64} className="text-slate-200 mb-6" />
              <h2 className="text-xl font-bold text-slate-900">Gerencie seu estoque</h2>
              <p className="text-slate-500 mt-2 max-w-xs">Cadastre seus produtos para cruzamento automático ou atualize seus segmentos de interesse no perfil.</p>
            </div>
          )}
        </div>
      </div>

      {/* Counter Proposal Modal */}
      {selectedOp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Enviando Proposta</p>
                <h3 className="text-xl font-bold text-slate-900">{selectedOp.productName}</h3>
              </div>
              <button onClick={() => setSelectedOp(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Seu Preço</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 font-bold">R$</span>
                    <input 
                      type="number"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" 
                      placeholder="0,00" 
                      value={proposalPrice}
                      onChange={(e) => setProposalPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Validade da Oferta</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={proposalValidity}
                    onChange={(e) => setProposalValidity(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição da Proposta</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all h-24" 
                  placeholder="Descreva o estado do produto, garantia e termos de pagamento..." 
                  value={proposalDesc}
                  onChange={(e) => setProposalDesc(e.target.value)}
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase block">Fotos do Produto</label>
                <div className="flex flex-wrap gap-3">
                  {proposalImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group border border-slate-200">
                      <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-20 h-20 bg-slate-50 text-slate-400 rounded-xl border-2 border-dashed border-slate-200 hover:bg-slate-100 hover:border-blue-300 transition-all"
                  >
                    <Camera size={20} />
                    <span className="text-[10px] font-bold mt-1">Adicionar</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </div>

              <button 
                onClick={handleSendProposal}
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {isSubmitting ? 'ENVIANDO...' : 'Enviar Proposta ao Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;
