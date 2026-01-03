import React, { useState, useMemo, useRef } from 'react';
import { UserProfile, Intent, Offer, IntentType, ProductCondition } from '../types';
import { Target, Search, BarChart3, Package, Users, Send, Filter, CheckCircle, DollarSign, SlidersHorizontal, ArrowUpDown, Camera, X, Image as ImageIcon, Plus } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

interface SupplierDashboardProps {
  user: UserProfile;
}

const MOCK_OPPORTUNITIES: Intent[] = [
  {
    id: 'i3',
    userId: 'u4',
    type: IntentType.BUY,
    productName: 'MacBook Air M2 13"',
    description: 'Procuro unidade lacrada com garantia nacional.',
    budget: 7200,
    condition: ProductCondition.NEW,
    createdAt: '2024-05-12T10:00:00Z',
    status: 'OPEN',
    offersCount: 3
  },
  {
    id: 'i4',
    userId: 'u5',
    type: IntentType.BUY,
    productName: 'Câmera Canon EOS R6',
    description: 'Procuro corpo de câmera Canon R6 Mark II em bom estado de conservação.',
    budget: 12000,
    condition: ProductCondition.USED,
    createdAt: '2024-05-12T11:45:00Z',
    status: 'OPEN',
    offersCount: 1
  },
  {
    id: 'i5',
    userId: 'u6',
    type: IntentType.TRADE,
    productName: 'Monitor Ultrawide 34"',
    description: 'Troco por dois monitores 27" 4K.',
    budget: 3500,
    condition: ProductCondition.USED,
    createdAt: '2024-05-11T08:20:00Z',
    status: 'OPEN',
    offersCount: 0
  },
  {
    id: 'i6',
    userId: 'u7',
    type: IntentType.SELL,
    productName: 'PlayStation 5 Slim',
    description: 'Vendo com 2 controles e 3 jogos.',
    budget: 3800,
    condition: ProductCondition.NEW,
    createdAt: '2024-05-13T15:10:00Z',
    status: 'OPEN',
    offersCount: 5
  }
];

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
      // Fix: Explicitly type 'file' as 'File' to resolve TypeScript 'unknown' inference when using Array.from(files)
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

  const filteredOpportunities = useMemo(() => {
    let result = [...MOCK_OPPORTUNITIES];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(op => 
        op.productName.toLowerCase().includes(query) || 
        op.description.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filterType !== 'ALL') {
      result = result.filter(op => op.type === filterType);
    }

    // Condition filter
    if (filterCondition !== 'ALL') {
      result = result.filter(op => op.condition === filterCondition || op.condition === ProductCondition.BOTH);
    }

    // Price range
    if (minPrice) {
      result = result.filter(op => op.budget >= parseFloat(minPrice));
    }
    if (maxPrice) {
      result = result.filter(op => op.budget <= parseFloat(maxPrice));
    }

    // Sorting
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
  }, [searchQuery, filterType, filterCondition, sortBy, minPrice, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Portal do Fornecedor</h1>
          <p className="text-slate-500">Transforme intenções de compra em vendas reais.</p>
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
        {/* Left Stats Column */}
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
                <p className="text-lg font-black text-slate-900">R$ 42k</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-600/20">
            <h3 className="font-bold text-lg mb-2">Dica de Vendedor</h3>
            <p className="text-blue-100 text-xs leading-relaxed opacity-90">
              Responder rapidamente aumenta em até 3x suas chances de fechar negócio. Usuários valorizam agilidade e fotos reais!
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'OPPORTUNITIES' && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      placeholder="Buscar por produto ou descrição..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 min-w-[180px]">
                    <ArrowUpDown className="text-slate-400" size={18} />
                    <select 
                      className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="NEWEST">Mais Recentes</option>
                      <option value="BUDGET_DESC">Maior Orçamento</option>
                      <option value="BUDGET_ASC">Menor Orçamento</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo</label>
                    <div className="flex gap-2">
                      {['ALL', IntentType.BUY, IntentType.SELL, IntentType.TRADE].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filterType === type ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                        >
                          {type === 'ALL' ? 'Todos' : type === IntentType.BUY ? 'Compra' : type === IntentType.SELL ? 'Venda' : 'Troca'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Condição</label>
                    <div className="flex gap-2">
                      {['ALL', ProductCondition.NEW, ProductCondition.USED].map((cond) => (
                        <button
                          key={cond}
                          onClick={() => setFilterCondition(cond as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filterCondition === cond ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                        >
                          {cond === 'ALL' ? 'Qualquer' : cond === ProductCondition.NEW ? 'Novo' : 'Usado'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faixa de Preço</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        placeholder="Min"
                        className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                      <span className="text-slate-300">-</span>
                      <input 
                        type="number"
                        placeholder="Max"
                        className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('ALL');
                      setFilterCondition('ALL');
                      setMinPrice('');
                      setMaxPrice('');
                      setSortBy('NEWEST');
                    }}
                    className="ml-auto text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>

              {/* Opportunities Grid */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users size={20} className="text-blue-500" /> 
                    {filteredOpportunities.length} Clientes em busca de produtos
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
                        }}
                        className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${op.type === IntentType.BUY ? 'bg-emerald-100 text-emerald-700' : op.type === IntentType.SELL ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                {op.type === IntentType.BUY ? 'Compra' : op.type === IntentType.SELL ? 'Venda' : 'Troca'}
                              </span>
                              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase">
                                {op.condition === ProductCondition.NEW ? 'Novo' : op.condition === ProductCondition.USED ? 'Usado' : 'Ambos'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 font-black text-lg">
                              <DollarSign size={18} />
                              {formatCurrency(op.budget)}
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">{op.productName}</h3>
                          <p className="text-sm text-slate-500 line-clamp-3 mb-4">{op.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                           <span className="text-[10px] text-slate-400 font-medium italic">
                            Publicado em {new Date(op.createdAt).toLocaleDateString('pt-BR')}
                           </span>
                           <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md text-sm">
                            <Send size={16} /> Fazer Proposta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center flex flex-col items-center">
                    <Search size={64} className="text-slate-200 mb-6" />
                    <h2 className="text-xl font-bold text-slate-900">Nenhum resultado encontrado</h2>
                    <p className="text-slate-500 mt-2 max-w-xs">Tente ajustar seus filtros para encontrar mais oportunidades.</p>
                  </div>
                )}
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
                            <input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" placeholder="0,00" defaultValue={selectedOp.budget} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Validade</label>
                          <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Condições do Produto</label>
                        <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all h-24" placeholder="Descreva o estado do produto, garantia e termos de pagamento..." />
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
                        {proposalImages.length === 0 && (
                          <p className="text-[10px] text-slate-400 italic">Fornecer fotos reais aumenta a confiança do comprador.</p>
                        )}
                      </div>

                      <button 
                        onClick={() => setSelectedOp(null)}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg"
                      >
                        Enviar Proposta ao Cliente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'CATALOG' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center flex flex-col items-center">
              <Package size={64} className="text-slate-200 mb-6" />
              <h2 className="text-xl font-bold text-slate-900">Gerencie seu estoque</h2>
              <p className="text-slate-500 mt-2 max-w-xs">Ao cadastrar seus produtos, nosso sistema fará o cruzamento automático sempre que um usuário publicar um interesse.</p>
              <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
                Adicionar Novo Produto
              </button>
            </div>
          )}

          {activeTab === 'MY_OFFERS' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center flex flex-col items-center">
              <CheckCircle size={64} className="text-slate-200 mb-6" />
              <h2 className="text-xl font-bold text-slate-900">Nenhuma oferta enviada</h2>
              <p className="text-slate-500 mt-2 max-w-xs">Comece a responder as intenções de compra dos clientes para ver suas propostas aqui.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;