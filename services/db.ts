
import { UserProfile, Intent, Offer } from '../types';

// Simulação de um Banco de Dados Relacional Robusto (PostgreSQL/MySQL style)
const DB_KEYS = {
  USERS: 'comproum_users',
  INTENTS: 'comproum_intents',
  OFFERS: 'comproum_offers',
  SESSION: 'comproum_session'
};

export const Database = {
  // Inicialização com dados padrão caso esteja vazio
  init() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.INTENTS)) {
      localStorage.setItem(DB_KEYS.INTENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.OFFERS)) {
      localStorage.setItem(DB_KEYS.OFFERS, JSON.stringify([]));
    }
  },

  // Usuários
  getUsers(): UserProfile[] {
    return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
  },

  saveUser(user: UserProfile) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  },

  updateUser(updatedUser: UserProfile) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
      this.setSession(updatedUser);
    }
  },

  findUserByUsername(username: string): UserProfile | undefined {
    return this.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  findUserByEmail(email: string): UserProfile | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserByDocument(doc: string): UserProfile | undefined {
    const cleanDoc = doc.replace(/\D/g, '');
    return this.getUsers().find(u => u.document.replace(/\D/g, '') === cleanDoc);
  },

  // Intenções (Intents)
  getIntents(): Intent[] {
    return JSON.parse(localStorage.getItem(DB_KEYS.INTENTS) || '[]');
  },

  getIntentsByUserId(userId: string): Intent[] {
    return this.getIntents().filter(i => i.userId === userId);
  },

  saveIntent(intent: Intent) {
    const intents = this.getIntents();
    intents.push(intent);
    localStorage.setItem(DB_KEYS.INTENTS, JSON.stringify(intents));
  },

  // Ofertas (Offers)
  getOffers(): Offer[] {
    return JSON.parse(localStorage.getItem(DB_KEYS.OFFERS) || '[]');
  },

  getOffersByIntentId(intentId: string): Offer[] {
    return this.getOffers().filter(o => o.intentId === intentId);
  },

  saveOffer(offer: Offer) {
    const offers = this.getOffers();
    offers.push(offer);
    localStorage.setItem(DB_KEYS.OFFERS, JSON.stringify(offers));

    // Incrementar contador de ofertas na intenção
    const intents = this.getIntents();
    const intentIndex = intents.findIndex(i => i.id === offer.intentId);
    if (intentIndex !== -1) {
      intents[intentIndex].offersCount = (intents[intentIndex].offersCount || 0) + 1;
      localStorage.setItem(DB_KEYS.INTENTS, JSON.stringify(intents));
    }
  },

  updateOffer(updatedOffer: Offer) {
    const offers = this.getOffers();
    const index = offers.findIndex(o => o.id === updatedOffer.id);
    if (index !== -1) {
      offers[index] = updatedOffer;
      localStorage.setItem(DB_KEYS.OFFERS, JSON.stringify(offers));
    }
  },

  // Sessão
  setSession(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(DB_KEYS.SESSION);
    }
  },

  getSession(): UserProfile | null {
    const session = localStorage.getItem(DB_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  }
};

Database.init();
