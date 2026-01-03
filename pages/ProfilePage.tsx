
import React, { useState } from 'react';
import { UserProfile, Address, BUSINESS_CATEGORIES, UserRole } from '../types';
import { User, Mail, Phone, MapPin, CreditCard, ArrowLeft, Save, Search, Loader2, Hash, Landmark, Check, Wallet, Smartphone, ReceiptText, AlertCircle, Zap, ToggleLeft, ToggleRight, Briefcase, CheckSquare, Square } from 'lucide-react';

interface ProfilePageProps {
  user: UserProfile;
  onSave: (updatedUser: UserProfile) => void;
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onSave, onBack }) => {
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<string[]>(user.businessSegments || []);
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    street: user.deliveryAddress?.street || '',
    number: user.deliveryAddress?.number || '',
    neighborhood: user.deliveryAddress?.neighborhood || '',
    city: user.deliveryAddress?.city || '',
    state: user.deliveryAddress?.state || '',
    zip: user.deliveryAddress?.zip || '',
    paymentType: user.paymentMethod?.type || 'PIX',
    paymentDetails: user.paymentMethod?.details || '',
    quickPaymentEnabled: user.quickPaymentEnabled || false
  });

  const handleCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, zip: cleanCep }));
    setCepError(null);

    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (data.erro) {
          setCepError('CEP não encontrado.');
          setFormData(prev => ({ ...prev, street: '', neighborhood: '', city: '', state: '' }));
        } else {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          }));
          setCepError(null);
        }
      } catch (error) {
        setCepError('Erro ao consultar CEP.');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const toggleSegment = (segment: string) => {
    setSelectedSegments(prev => 
      prev.includes(segment) 
        ? prev.filter(s => s !== segment) 
        : [...prev, segment]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.role === UserRole.SUPPLIER && selectedSegments.length === 0) {
      alert('Selecione pelo menos um segmento de atuação.');
      return;
    }
    
    const updatedUser: UserProfile = {
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      deliveryAddress: {
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zip: formData.zip
      },
      paymentMethod: {
        type: formData.paymentType as any,
        details: formData.paymentDetails
      },
      quickPaymentEnabled: formData.quickPaymentEnabled,
      businessSegments: user.role === UserRole.SUPPLIER ? selectedSegments : undefined
    };

    onSave(updatedUser);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-900">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-medium">
        <ArrowLeft size={18} /> Voltar para o Dashboard
      </button>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 text-slate-900">
            <User className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Dados Pessoais</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input required type="email" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {user.role === UserRole.SUPPLIER && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 text-slate-900">
              <Briefcase className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold">Segmentos de Atuação</h2>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-xs text-slate-500 italic">Atualize os segmentos que sua empresa atende.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUSINESS_CATEGORIES.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleSegment(category)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${selectedSegments.includes(category) ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-sm' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    {selectedSegments.includes(category) ? <CheckSquare className="text-blue-600 shrink-0" size={20} /> : <Square className="text-slate-300 shrink-0" size={20} />}
                    <span className="text-sm font-bold">{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 text-slate-900">
            <MapPin className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Endereço</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CEP</label>
                <div className="relative">
                  <Search className={`absolute left-3 top-3.5 text-slate-400`} size={18} />
                  <input maxLength={8} className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.zip} onChange={e => handleCepLookup(e.target.value)} />
                  {loadingCep && <Loader2 className="absolute right-3 top-3.5 text-blue-500 animate-spin" size={18} />}
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Rua</label>
                <input className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3"
        >
          <Save size={24} /> SALVAR ALTERAÇÕES
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
