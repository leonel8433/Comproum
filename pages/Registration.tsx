
import React, { useState } from 'react';
import { UserRole, UserProfile, BUSINESS_CATEGORIES } from '../types';
import { Database } from '../services/db';
import { ArrowLeft, User, Mail, FileText, MapPin, Search, Loader2, Hash, Landmark, AlertCircle, Phone, Lock, AtSign, CheckSquare, Square, Briefcase } from 'lucide-react';

interface RegistrationProps {
  onComplete: (data: UserProfile) => void;
  onGoogleSignUp: (role: UserRole) => void;
  onBack: () => void;
}

const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.length === 11 || cleanCPF.length === 14;
};

const Registration: React.FC<RegistrationProps> = ({ onComplete, onGoogleSignUp, onBack }) => {
  const [role, setRole] = useState<UserRole>(UserRole.BUYER);
  const [loadingCep, setLoadingCep] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '', username: '', password: '', email: '', phone: '', document: '',
    regStreet: '', regNumber: '', regNeighborhood: '', regCity: '', regState: '', regZip: ''
  });

  const handleCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, regZip: cleanCep }));

    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            regStreet: data.logradouro,
            regNeighborhood: data.bairro,
            regCity: data.localidade,
            regState: data.uf,
          }));
        }
      } catch (error) {
        console.error(error);
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
    const newErrors: Record<string, string> = {};

    if (Database.findUserByUsername(formData.username)) {
      newErrors.username = 'Este nome de usuário já está em uso.';
    }
    if (Database.findUserByDocument(formData.document)) {
      newErrors.document = 'Este documento já está cadastrado.';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'A senha deve ter no mínimo 8 caracteres.';
    }
    if (!validateCPF(formData.document)) {
      newErrors.document = 'Documento inválido.';
    }
    if (role === UserRole.SUPPLIER && selectedSegments.length === 0) {
      newErrors.segments = 'Selecione pelo menos um segmento de atuação.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      username: formData.username,
      password: formData.password,
      email: formData.email,
      phone: formData.phone,
      role: role,
      document: formData.document,
      registrationAddress: {
        street: formData.regStreet,
        number: formData.regNumber,
        neighborhood: formData.regNeighborhood,
        city: formData.regCity,
        state: formData.regState,
        zip: formData.regZip
      },
      businessSegments: role === UserRole.SUPPLIER ? selectedSegments : undefined
    };
    onComplete(newUser);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-medium">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900">Novo Cadastro</h1>
          <p className="text-slate-500 text-sm">Crie seu acesso exclusivo ao Comproum.</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6 items-start sm:items-center">
            <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-xl">
              <button type="button" onClick={() => setRole(UserRole.BUYER)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${role === UserRole.BUYER ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50'}`}>Sou Comprador</button>
              <button type="button" onClick={() => setRole(UserRole.SUPPLIER)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${role === UserRole.SUPPLIER ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50'}`}>Sou Fornecedor</button>
            </div>
            <div className="hidden sm:block h-6 w-px bg-slate-200"></div>
            <button 
              type="button"
              onClick={() => onGoogleSignUp(role)}
              className="flex items-center gap-3 px-6 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.177 0 7.55 0 9s.347 2.823.957 4.038l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/></svg>
              Cadastrar com Google
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="relative flex items-center justify-center"><div className="w-full border-t border-slate-100"></div><span className="relative px-3 bg-white text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ou preencha o formulário</span></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Acesso</label>
              <div className="space-y-1">
                <div className="relative">
                  <AtSign className={`absolute left-3 top-3.5 ${errors.username ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                  <input required className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-300' : 'border-slate-200'}`} placeholder="Usuário" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                {errors.username && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.username}</p>}
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <Lock className={`absolute left-3 top-3.5 ${errors.password ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                  <input required type="password" className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-300' : 'border-slate-200'}`} placeholder="Senha (min. 8 caracteres)" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                {errors.password && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.password}</p>}
              </div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest pt-4">Dados</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome / Razão" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input required type="email" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="relative">
                <FileText className={`absolute left-3 top-3.5 ${errors.document ? 'text-red-400' : 'text-slate-400'}`} size={18} />
                <input required className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${errors.document ? 'border-red-300' : 'border-slate-200'}`} placeholder="CPF / CNPJ" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
              </div>
              {errors.document && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.document}</p>}
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Localização</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input required maxLength={8} className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="CEP" value={formData.regZip} onChange={e => handleCepLookup(e.target.value)} />
                {loadingCep && <Loader2 className="absolute right-3 top-3.5 text-blue-500 animate-spin" size={18} />}
              </div>
              <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Rua" value={formData.regStreet} onChange={e => setFormData({...formData, regStreet: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nº" value={formData.regNumber} onChange={e => setFormData({...formData, regNumber: e.target.value})} />
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Bairro" value={formData.regNeighborhood} onChange={e => setFormData({...formData, regNeighborhood: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cidade" value={formData.regCity} onChange={e => setFormData({...formData, regCity: e.target.value})} />
                <input required maxLength={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 uppercase" placeholder="UF" value={formData.regState} onChange={e => setFormData({...formData, regState: e.target.value})} />
              </div>
            </div>
          </div>

          {role === UserRole.SUPPLIER && (
            <div className="pt-6 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Briefcase size={18} className="text-blue-600" /> Segmentos de Atuação
              </label>
              <p className="text-xs text-slate-500 mb-4 italic">Selecione as áreas que sua empresa atende para receber as intenções de compra corretas.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {BUSINESS_CATEGORIES.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleSegment(category)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left group ${selectedSegments.includes(category) ? 'bg-blue-50 border-blue-600 text-blue-800' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    {selectedSegments.includes(category) ? <CheckSquare className="text-blue-600 shrink-0" size={20} /> : <Square className="text-slate-300 group-hover:text-slate-400 shrink-0" size={20} />}
                    <span className="text-sm font-bold">{category}</span>
                  </button>
                ))}
              </div>
              {errors.segments && <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1"><AlertCircle size={14} /> {errors.segments}</p>}
            </div>
          )}

          <button type="submit" className="w-full py-4 rounded-xl font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20">Finalizar Cadastro</button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
