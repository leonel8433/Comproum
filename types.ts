
export enum UserRole {
  BUYER = 'BUYER',
  SUPPLIER = 'SUPPLIER'
}

export enum IntentType {
  BUY = 'BUY',
  SELL = 'SELL',
  TRADE = 'TRADE'
}

export enum ProductCondition {
  NEW = 'NEW',
  USED = 'USED',
  BOTH = 'BOTH'
}

export const BUSINESS_CATEGORIES = [
  'Eletrônicos & TI',
  'Eletrodomésticos',
  'Moda & Acessórios',
  'Automotivo',
  'Móveis & Decoração',
  'Ferramentas & Construção',
  'Saúde & Beleza',
  'Esportes & Lazer',
  'Serviços Profissionais',
  'Outros'
];

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  password?: string;
  email: string;
  phone: string;
  role: UserRole;
  document: string;
  registrationAddress: Address;
  deliveryAddress?: Address;
  paymentMethod?: {
    type: 'CREDIT_CARD' | 'PIX' | 'BOLETO';
    details: string;
  };
  quickPaymentEnabled?: boolean;
  businessSegments?: string[]; // Apenas para fornecedores
}

export interface Intent {
  id: string;
  userId: string;
  type: IntentType;
  category: string;
  productName: string;
  description: string;
  budget: number;
  condition: ProductCondition;
  createdAt: string;
  status: 'OPEN' | 'CLOSED' | 'EXPIRED';
  offersCount: number;
}

export interface Offer {
  id: string;
  intentId: string;
  supplierId: string;
  supplierName: string;
  price: number;
  counterPrice?: number; // Preço sugerido pelo comprador
  condition: ProductCondition;
  description: string;
  images: string[];
  paymentTerms: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFERED';
  validUntil: string;
  followUpAt?: string;
  productName?: string;
  buyerFeedback?: string;
}
