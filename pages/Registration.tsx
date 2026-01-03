
import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types';
import { ArrowLeft, User, Mail, FileText, MapPin, CreditCard, Truck, Search, Loader2, Hash, FilePlus } from 'lucide-react';

interface RegistrationProps {
  onComplete: (data: UserProfile) => void;
  onBack: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ onComplete, onBack }) => {
  const [role, setRole] = useState<UserRole>(UserRole.BUYER);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [loadingCep, setLoadingCep] = useState<'reg' | 'del' | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    document: '',
    // Registration Address
    regStreet: '',
    regNumber: '',
    regComplement: '',
    regCity: '',
    regState: '',
    regZip: '',
    // Delivery Address
    delStreet: '',
    delNumber: '',
    delComplement: '',
    delCity: '',
    delState: '',
    delZip: '',
    paymentMethod: 'CREDIT_CARD',
    paymentDetails: ''
  });

  const handleCepLookup = async (cep: string, fieldPrefix: 'reg' | 'del') => {
    const cleanCep = cep.replace(/\D/g, '');
    
    // Update the zip field immediately
    setFormData(prev => ({ ...prev, [`${fieldPrefix}Zip`]: cleanCep }));

    if (cleanCep.length === 8) {
      setLoadingCep(fieldPrefix);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            [`${fieldPrefix}Street`]: data.logradouro,
            [`${fieldPrefix}City`]: data.localidade,
            [`${fieldPrefix}State`]: data.uf,
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setLoadingCep(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      role: role,
      document: formData.document,
      registrationAddress: {
        street: formData.regStreet,
        number: formData.regNumber,
        complement: formData.regComplement,
        city: formData.regCity,
        state: formData.regState,
        zip: formData.regZip
      },
      deliveryAddress: role === UserRole.BUYER ? {
        street: useSameAddress ? formData.regStreet : formData.delStreet,
        number: useSameAddress ? formData.regNumber : formData.delNumber,
        complement: useSameAddress ? formData.regComplement : formData.delComplement,
        city: useSameAddress ? formData.regCity : formData.delCity,
        state: useSameAddress ? formData.regState : formData.delState,
        zip: useSameAddress ? formData.regZip : formData.delZip
      } : undefined,
      paymentMethod: role === UserRole.BUYER ? {
        type: formData.paymentMethod as any,
        details: formData.paymentDetails
      } : undefined
    };
    onComplete(newUser);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-medium transition-colors">
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900">Cadastro de {role === UserRole.BUYER ? 'Usuário' : 'Fornecedor'}</h1>
          <p className="text-slate-500 mt-1 text-sm">Preencha todos os campos para começar a negociar no Comproum.</p>
          
          <div className="flex gap-2 mt-6 p-1 bg-white border border-slate-200 rounded-xl w-fit">
            <button 
              onClick={() => setRole(UserRole.BUYER)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${role === UserRole.BUYER ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Sou Comprador
            </button>
            <button 
              onClick={() => setRole(UserRole.SUPPLIER)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${role === UserRole.SUPPLIER ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Sou Fornecedor
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* General Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Informações Básicas</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder={role === UserRole.BUYER ? "Nome Completo" : "Razão Social"}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  required
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="relative">
                <FileText className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder={role === UserRole.BUYER ? "CPF" : "CNPJ"}
                  value={formData.document}
                  onChange={e => setFormData({...formData, document: e.target.value})}
                />
              </div>
            </div>

            {/* Registration Address */}
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Endereço de Cadastro</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  required
                  maxLength={8}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                  placeholder="CEP (apenas números)"
                  value={formData.regZip}
                  onChange={e => handleCepLookup(e.target.value, 'reg')}
                />
                {loadingCep === 'reg' && (
                  <Loader2 className="absolute right-3 top-3.5 text-blue-500 animate-spin" size={18} />
                )}
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Rua / Logradouro"
                  value={formData.regStreet}
                  onChange={e => setFormData({...formData, regStreet: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Hash className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Número"
                    value={formData.regNumber}
                    onChange={e => setFormData({...formData, regNumber: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <FilePlus className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Complemento"
                    value={formData.regComplement}
                    onChange={e => setFormData({...formData, regComplement: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Cidade"
                  value={formData.regCity}
                  onChange={e => setFormData({...formData, regCity: e.target.value})}
                />
                <input 
                  required
                  maxLength={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                  placeholder="UF"
                  value={formData.regState}
                  onChange={e => setFormData({...formData, regState: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Delivery Address (Only for Buyers) */}
          {role === UserRole.BUYER && (
            <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Endereço de Entrega</label>
                <button 
                  type="button"
                  onClick={() => setUseSameAddress(!useSameAddress)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${useSameAddress ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                >
                  {useSameAddress ? 'Mesmo que o de cadastro' : 'Informar outro endereço'}
                </button>
              </div>

              {!useSameAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <input 
                        required={!useSameAddress}
                        maxLength={8}
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                        placeholder="CEP de Entrega"
                        value={formData.delZip}
                        onChange={e => handleCepLookup(e.target.value, 'del')}
                      />
                      {loadingCep === 'del' && (
                        <Loader2 className="absolute right-3 top-3.5 text-blue-500 animate-spin" size={18} />
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <Truck className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <input 
                        required={!useSameAddress}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Rua / Logradouro"
                        value={formData.delStreet}
                        onChange={e => setFormData({...formData, delStreet: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Hash className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input 
                          required={!useSameAddress}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="Número"
                          value={formData.delNumber}
                          onChange={e => setFormData({...formData, delNumber: e.target.value})}
                        />
                      </div>
                      <div className="relative">
                        <FilePlus className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input 
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="Complemento"
                          value={formData.delComplement}
                          onChange={e => setFormData({...formData, delComplement: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        required={!useSameAddress}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Cidade"
                        value={formData.delCity}
                        onChange={e => setFormData({...formData, delCity: e.target.value})}
                      />
                      <input 
                        required={!useSameAddress}
                        maxLength={2}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                        placeholder="UF"
                        value={formData.delState}
                        onChange={e => setFormData({...formData, delState: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment (Only for Buyers) */}
          {role === UserRole.BUYER && (
            <div className="md:col-span-2 space-y-4 pt-8 border-t border-slate-100">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Pagamento Padrão</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select 
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  value={formData.paymentMethod}
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                >
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="PIX">Pix</option>
                  <option value="BOLETO">Boleto</option>
                </select>
                <div className="md:col-span-2 relative">
                  <CreditCard className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input 
                    required={role === UserRole.BUYER}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Detalhes (Número do cartão ou Chave Pix)"
                    value={formData.paymentDetails}
                    onChange={e => setFormData({...formData, paymentDetails: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              Concluir Cadastro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;
