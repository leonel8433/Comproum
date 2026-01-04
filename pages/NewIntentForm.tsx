
import React, { useState } from 'react';
import { UserProfile, IntentType, ProductCondition, Intent, BUSINESS_CATEGORIES } from '../types';
import { Database } from '../services/db';
import { ShoppingCart, ArrowLeft, Tag, DollarSign, Info, Plus, Loader2, List, Sparkles, ExternalLink, TrendingUp } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface NewIntentFormProps {
  user: UserProfile;
  onComplete: () => void;
  onCancel: () => void;
}

interface MarketInsight {
  minPrice: number;
  maxPrice: number;
  analysis: string;
  sources: { title: string; uri: string }[];
}

const NewIntentForm: React.FC<NewIntentFormProps> = ({ user, onComplete, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingMarket, setIsSearchingMarket] = useState(false);
  const [marketInsight, setMarketInsight] = useState<MarketInsight | null>(null);
  
  const [formData, setFormData] = useState({
    type: IntentType.BUY,
    category: '',
    productName: '',
    description: '',
    budget: '',
    condition: ProductCondition.BOTH
  });

  const fetchMarketPrice = async () => {
    if (!formData.productName || formData.productName.length < 3) {
      alert('Por favor, digite o nome do produto primeiro.');
      return;
    }

    setIsSearchingMarket(true);
    setMarketInsight(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise o preço de mercado atual no Brasil para o produto: "${formData.productName}". 
      Retorne APENAS um objeto JSON com:
      - minPrice: (número, preço mínimo encontrado)
      - maxPrice: (número, preço máximo encontrado)
      - analysis: (string curta de 2 frases sobre a tendência de preço)
      Exemplo: {"minPrice": 1200, "maxPrice": 1500, "analysis": "Os preços estão estáveis, com promoções frequentes em grandes varejistas."}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      // Tentativa de extrair JSON do texto (o modelo pode envolver em markdown)
      const jsonMatch = text.match(/\{.*\}/s);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      
      // Extrair links das fontes de pesquisa do Google
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title || 'Ver fonte',
          uri: chunk.web.uri
        }))
        .slice(0, 3); // Pegar top 3

      if (data) {
        setMarketInsight({
          minPrice: data.minPrice,
          maxPrice: data.maxPrice,
          analysis: data.analysis,
          sources: sources
        });
      }
    } catch (error) {
      console.error("Erro na pesquisa de mercado:", error);
      alert("Não foi possível realizar a pesquisa de mercado agora. Tente novamente em instantes.");
    } finally {
      setIsSearchingMarket(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      alert('Por favor, selecione uma categoria.');
      return;
    }
    setIsSubmitting(true);

    const newIntent: Intent = {
      id: `i_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      type: formData.type,
      category: formData.category,
      productName: formData.productName,
      description: formData.description,
      budget: parseFloat(formData.budget),
      condition: formData.condition,
      createdAt: new Date().toISOString(),
      status: 'OPEN',
      offersCount: 0
    };

    setTimeout(() => {
      Database.saveIntent(newIntent);
      setIsSubmitting(false);
      onComplete();
    }, 800);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <button onClick={onCancel} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-medium">
        <ArrowLeft size={18} /> Voltar para o Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-blue-600">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart size={24} /> O que você deseja?
          </h1>
          <p className="text-blue-100 mt-1">Descreva seu interesse e nosso sistema encontrará os melhores fornecedores.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Objetivo</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: IntentType.BUY, label: 'Comprar', color: 'blue' },
                { id: IntentType.SELL, label: 'Vender', color: 'amber' },
                { id: IntentType.TRADE, label: 'Trocar', color: 'indigo' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({...formData, type: opt.id as any})}
                  className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${formData.type === opt.id ? `bg-${opt.color}-50 border-${opt.color}-600 text-${opt.color}-700 shadow-sm` : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Categoria</label>
            <div className="relative">
              <List className="absolute left-4 top-4 text-slate-400" size={20} />
              <select 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium appearance-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="" disabled>Selecione uma categoria...</option>
                {BUSINESS_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Produto ou Serviço</label>
              <button 
                type="button"
                onClick={fetchMarketPrice}
                disabled={isSearchingMarket || !formData.productName}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSearchingMarket ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {isSearchingMarket ? 'Pesquisando mercado...' : 'Pesquisar preço médio'}
              </button>
            </div>
            <input 
              required
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-lg"
              placeholder="Ex: Notebook Gamer RTX 4060 ou iPhone 15"
              value={formData.productName}
              onChange={e => setFormData({...formData, productName: e.target.value})}
            />

            {marketInsight && (
              <div className="bg-slate-900 rounded-2xl p-5 text-white animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-3 text-blue-400">
                  <TrendingUp size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Insights de Mercado</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Preço Mínimo</p>
                    <p className="text-lg font-black">{formatCurrency(marketInsight.minPrice)}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Preço Máximo</p>
                    <p className="text-lg font-black">{formatCurrency(marketInsight.maxPrice)}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{marketInsight.analysis}</p>
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Fontes Verificadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {marketInsight.sources.map((source, idx) => (
                      <a 
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors border border-white/5"
                      >
                        {source.title} <ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, budget: marketInsight.minPrice.toString()})}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-500 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Usar preço mínimo como meu orçamento
                </button>
              </div>
            )}

            <textarea 
              required
              rows={4}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              placeholder="Descreva detalhes: cor, especificações, marcas de preferência..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Orçamento Máximo</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-slate-400 font-bold">R$</span>
                <input 
                  required
                  type="number"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-xl text-slate-900"
                  placeholder="0,00"
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Condição</label>
              <select 
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value as any})}
              >
                <option value={ProductCondition.NEW}>Apenas Novo</option>
                <option value={ProductCondition.USED}>Apenas Usado</option>
                <option value={ProductCondition.BOTH}>Novo ou Usado</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start border border-blue-100">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-blue-700 leading-relaxed">
              Ao publicar, apenas os fornecedores especializados na categoria <span className="font-bold underline">{formData.category || 'selecionada'}</span> receberão sua solicitação.
            </p>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
            {isSubmitting ? 'PUBLICANDO...' : 'PUBLICAR INTENÇÃO'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewIntentForm;
