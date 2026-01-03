
import React from 'react';
import { ShoppingCart, Store, ArrowRightLeft, CheckCircle2, DollarSign, Zap } from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onStart: (role: UserRole) => void;
  onLogin: (role: UserRole) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        <img
          src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80"
          alt="Marketplace Background"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
        />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Zap size={14} /> O Futuro do Comércio é Reverso
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
            Diga o que quer comprar e<br />
            <span className="text-blue-500">quanto quer pagar.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-300 mb-10">
            Chega de procurar por horas. Na Comproum.com.br, você posta sua intenção de compra e os melhores fornecedores do Brasil vêm até você com ofertas imbatíveis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onStart(UserRole.BUYER)}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25"
            >
              Quero Comprar Agora
            </button>
            <button 
              onClick={() => onStart(UserRole.SUPPLIER)}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white rounded-xl font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700"
            >
              Sou Fornecedor
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 sm:py-32 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-3 lg:gap-x-12">
            <div className="relative pl-16">
              <dt className="text-base font-bold leading-7 text-slate-900">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                  <ShoppingCart className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Compra Reversa
              </dt>
              <dd className="mt-2 text-base leading-7 text-slate-600">
                Publique o produto desejado, descreva as condições e o preço justo. Deixe os vendedores competirem pela sua venda.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-bold leading-7 text-slate-900">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
                  <Store className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Fornecedores Qualificados
              </dt>
              <dd className="mt-2 text-base leading-7 text-slate-600">
                Acessamos milhares de lojistas parceiros que analisam sua proposta e respondem com as melhores condições do mercado.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-bold leading-7 text-slate-900">
                <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
                  <ArrowRightLeft className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Venda e Troca
              </dt>
              <dd className="mt-2 text-base leading-7 text-slate-600">
                Não quer apenas comprar? Use nossa plataforma para anunciar o que quer vender ou encontrar alguém para uma troca justa.
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-24 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-16">Como Funciona o Comproum.com.br</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Cadastro", desc: "Crie seu perfil completo com documentos e forma de pagamento." },
              { step: "02", title: "Intenção", desc: "Descreva o que quer, se novo ou usado, e seu orçamento." },
              { step: "03", title: "Cruzamento", desc: "Nosso sistema notifica os fornecedores que têm o produto." },
              { step: "04", title: "Ofertas", desc: "Receba contra-propostas, fotos e feche o melhor negócio." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                <span className="text-4xl font-black text-blue-100 mb-4">{item.step}</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
