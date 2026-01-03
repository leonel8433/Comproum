
import React, { useState } from 'react';
import { UserProfile, IntentType, ProductCondition } from '../types';
import { ShoppingCart, ArrowLeft, Tag, DollarSign, Info, Plus } from 'lucide-react';

interface NewIntentFormProps {
  user: UserProfile;
  onComplete: () => void;
  onCancel: () => void;
}

const NewIntentForm: React.FC<NewIntentFormProps> = ({ user, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    type: IntentType.BUY,
    productName: '',
    description: '',
    budget: '',
    condition: ProductCondition.BOTH
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log('Postando nova intenção:', formData);
    onComplete();
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
          {/* Action Type */}
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

          {/* Product Info */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest">Produto ou Serviço</label>
            <input 
              required
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-lg"
              placeholder="Ex: Notebook Gamer RTX 4060 ou iPhone 15"
              value={formData.productName}
              onChange={e => setFormData({...formData, productName: e.target.value})}
            />
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
              Ao postar esta intenção, todos os fornecedores cadastrados que trabalham com este segmento serão notificados para enviar propostas personalizadas para você.
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <Plus size={24} /> PUBLICAR INTENÇÃO
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewIntentForm;
