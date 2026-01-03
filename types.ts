
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

export interface Address {
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zip: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  document: string;
  registrationAddress: Address;
  deliveryAddress?: Address;
  paymentMethod?: {
    type: 'CREDIT_CARD' | 'PIX' | 'BOLETO';
    details: string;
  };
}

export interface Intent {
  id: string;
  userId: string;
  type: IntentType;
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
  condition: ProductCondition;
  description: string;
  images: string[];
  paymentTerms: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  validUntil: string;
}
