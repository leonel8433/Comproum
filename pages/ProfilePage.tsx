
import React, { useState } from 'react';
import { UserProfile, Address, BUSINESS_CATEGORIES, UserRole } from '../types';
import { User, Mail, Phone, MapPin, ArrowLeft, Save, Search, Loader2, FileText, Briefcase, CheckSquare, Square } from 'lucide-react';

interface ProfilePageProps {
  user: UserProfile;
  onSave: (updatedUser: UserProfile) => void;
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onSave, onBack }) => {
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<string[]>(user.businessSegments || []);
  
  // Inicializa com registrationAddress que são os dados mestres do cadastro
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    document: user.document,
    street: user.registrationAddress.street || '',
    number: user.registrationAddress.number || '',
    neighborhood: user.registrationAddress.neighborhood || '',
    city: user.registrationAddress.city || '',
    state: user.registrationAddress.state || '',
    zip: user.registrationAddress.zip || '',
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
      document: formData.document,
      registrationAddress: {
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zip: formData.zip
      },
      // Sincroniza deliveryAddress também para evitar discrepâncias iniciais
      deliveryAddress: {
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zip: formData.zip
      },
      businessSegments: user.role === UserRole.SUPPLIER ? selectedSegments : undefined
    };

    onSave(updatedUser);
    alert('Perfil atualizado com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-900">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-medium group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Voltar para o Dashboard
      </button>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção: Dados Pessoais / Cadastro */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 text-slate-900">
            <User className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Dados do Cadastro</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome Completo / Razão Social</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">E-mail de Contato</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input required type="email" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="(00) 00000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CPF / CNPJ</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600 h-fit">
                <Save size={16} />
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Dados de acesso como <strong>nome de usuário</strong> e <strong>senha</strong> não podem ser alterados nesta tela por motivos de segurança.
              </p>
            </div>
          </div>
        </div>

        {/* Seção: Endereço */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 text-slate-900">
            <MapPin className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold">Endereço Registrado</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CEP</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input maxLength={8} className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.zip} onChange={e => handleCepLookup(e.target.value)} />
                  {loadingCep && <Loader2 className="absolute right-3 top-3.5 text-blue-500 animate-spin" size={18} />}
                </div>
                {cepError && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{cepError}</p>}
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Logradouro (Rua/Av)</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Número</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Bairro</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cidade</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">UF (Estado)</label>
                <input required maxLength={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {/* Segmentos (Apenas Fornecedores) */}
        {user.role === UserRole.SUPPLIER && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 text-slate-900">
              <Briefcase className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold">Segmentos de Atuação</h2>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-xs text-slate-500 italic">Atualize as áreas que sua empresa atende para receber as notificações corretas.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {BUSINESS_CATEGORIES.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleSegment(category)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left group ${selectedSegments.includes(category) ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-sm' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    {selectedSegments.includes(category) ? <CheckSquare className="text-blue-600 shrink-0" size={20} /> : <Square className="text-slate-300 shrink-0 group-hover:text-slate-400 transition-colors" size={20} />}
                    <span className="text-sm font-bold">{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Botão de Ação Principal */}
        <div className="flex gap-4">
          <button 
            type="submit"
            className="flex-grow bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Save size={24} /> SALVAR ALTERAÇÕES
          </button>
          <button 
            type="button"
            onClick={onBack}
            className="px-8 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            CANCELAR
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
