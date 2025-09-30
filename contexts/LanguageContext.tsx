import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Language = 'en' | 'fr' | 'rw';
interface Translations {
  [key: string]: { [lang in Language]: string };
}

const translations: Translations = {
  // Header, Nav & Search
  topStories: { en: 'Top Stories', fr: 'À la une', rw: 'Inkuru z\'Imena' },
  forYou: { en: 'For You', fr: 'Pour vous', rw: 'Ibyatoranyijwe' },
  savedArticles: { en: 'Saved Articles', fr: 'Articles sauvegardés', rw: 'Inkuru wabitse' },
  world: { en: 'World', fr: 'Monde', rw: 'Isi' },
  politics: { en: 'Politics', fr: 'Politique', rw: 'Politiki' },
  business: { en: 'Business', fr: 'Économie', rw: 'Ubucuruzi' },
  technology: { en: 'Technology', fr: 'Technologie', rw: 'Ikoranabuhanga' },
  sport: { en: 'Sport', fr: 'Sport', rw: 'Siporo' },
  science: { en: 'Science', fr: 'Science', rw: 'Siyansi' },
  health: { en: 'Health', fr: 'Santé', rw: 'Ubuzima' },
  searchPlaceholder: { en: 'Search for news...', fr: 'Rechercher des actualités...', rw: 'Shakisha amakuru...' },
  searchAriaLabel: { en: 'Search', fr: 'Rechercher', rw: 'Shakisha' },
  userMenu: { en: 'Open user menu', fr: 'Ouvrir le menu utilisateur', rw: 'Fungura menu y\'ukoresha' },
  logout: { en: 'Logout', fr: 'Déconnexion', rw: 'Sohoka' },
  // Settings
  settings: { en: 'Settings', fr: 'Paramètres', rw: 'Igenamiterere' },
  openSettings: { en: 'Open settings', fr: 'Ouvrir les paramètres', rw: 'Fungura igenamiterere' },
  darkMode: { en: 'Dark Mode', fr: 'Mode Sombre', rw: 'Uburyo bwijimye' },
  accentColor: { en: 'Accent Color', fr: 'Couleur d\'accentuation', rw: 'Ibara ry\'ibanze' },
  language: { en: 'Language', fr: 'Langue', rw: 'Ururimi' },
  // Articles & Modals
  sources: { en: 'Sources', fr: 'Sources', rw: 'Aho byavuye' },
  noSources: { en: 'No sources available.', fr: 'Aucune source disponible.', rw: 'Nta makuru ahari.' },
  share: { en: 'Share:', fr: 'Partager:', rw: 'Sangiza:' },
  translate: { en: 'Translate', fr: 'Traduire', rw: 'Hindura' },
  showOriginal: { en: 'Show Original', fr: 'Afficher l\'original', rw: 'Garura Umwimerere' },
  translating: { en: 'Translating...', fr: 'Traduction en cours...', rw: 'Biri guhindurwa...' },
  // AI Assistant
  aiAssistant: { en: 'AI Assistant', fr: 'Assistant IA', rw: 'Ubufasha bwa AI' },
  quickSummary: { en: 'Quick Summary', fr: 'Résumé rapide', rw: 'Incamake yihuse' },
  summarizing: { en: 'Generating summary...', fr: 'Génération du résumé...', rw: 'Incamake iri gutunganywa...' },
  askAQuestion: { en: 'Ask a Question', fr: 'Poser une question', rw: 'Baza ikibazo' },
  askPlaceholder: { en: 'Ask about this article...', fr: 'Posez une question sur cet article...', rw: 'Baza kuri iyi nkuru...' },
  ask: { en: 'Ask', fr: 'Demander', rw: 'Baza' },
  gettingAnswer: { en: 'Getting answer...', fr: 'Obtention de la réponse...', rw: 'Igisubizo kiri gutunganywa...' },
  // Auth Modal
  login: { en: 'Login', fr: 'Connexion', rw: 'Injira' },
  loginAriaLabel: { en: 'Login or register', fr: 'Se connecter ou s\'inscrire', rw: 'Injira cyangwa Wiyandikishe' },
  register: { en: 'Register', fr: 'S\'inscrire', rw: 'Iyandikishe' },
  loginToYourAccount: { en: 'Login to your account', fr: 'Connectez-vous à votre compte', rw: 'Injira muri konte yawe' },
  createAnAccount: { en: 'Create an account', fr: 'Créer un compte', rw: 'Fungura konti' },
  fullName: { en: 'Full Name', fr: 'Nom complet', rw: 'Izina ryuzuye' },
  emailAddress: { en: 'Email Address', fr: 'Adresse e-mail', rw: 'Imeri' },
  password: { en: 'Password', fr: 'Mot de passe', rw: 'Ijambobanga' },
  confirmPassword: { en: 'Confirm Password', fr: 'Confirmez le mot de passe', rw: 'Emeza ijambobanga' },
  loginCTA: { en: 'Login', fr: 'Se connecter', rw: 'Injira' },
  registerCTA: { en: 'Create Account', fr: 'Créer un compte', rw: 'Fungura Konti' },
  dontHaveAccount: { en: "Don't have an account?", fr: "Vous n'avez pas de compte ?", rw: "Nta konte ufite?" },
  alreadyHaveAccount: { en: 'Already have an account?', fr: 'Vous avez déjà un compte ?', rw: 'Usanganywe konte?' },
  // App State
  oops: { en: 'Oops! Something went wrong.', fr: 'Oups! Quelque chose s\'est mal passé.', rw: 'Harabaye ikibazo.' },
  tryAgain: { en: 'Try Again', fr: 'Réessayer', rw: 'Gerageza nanone' },
  noArticles: { en: 'No articles found.', fr: 'Aucun article trouvé.', rw: 'Nta nkuru zabonetse.' },
  noArticlesHint: { en: 'Try selecting a different category or searching for a topic.', fr: 'Essayez de sélectionner une autre catégorie ou de rechercher un sujet.', rw: 'Gerageza guhitamo irindi cyiciro cyangwa ushakishe.' },
  noSavedArticles: { en: 'You have no saved articles.', fr: 'Vous n\'avez aucun article sauvegardé.', rw: 'Nta nkuru wabitse.' },
  noSavedArticlesHint: { en: 'Click the bookmark icon on an article to save it for later.', fr: 'Cliquez sur l\'icône de signet sur un article pour le sauvegarder.', rw: 'Kanda ku gashushanyo k\'akamenyetso ku nkuru kugira ngo uyibike.' },
  // Misc
  backToTop: { en: 'Go to top', fr: 'Haut de page', rw: 'Subira hejuru' },
  poweredBy: { en: 'Powered by Google Gemini', fr: 'Propulsé par Google Gemini', rw: 'Gikoreshwa na Google Gemini' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations | string) => string;
  languageName: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, String(error));
    return defaultValue;
  }
};

const getLanguageName = (lang: Language): string => {
    switch (lang) {
        case 'fr': return 'French';
        case 'rw': return 'Kinyarwanda';
        case 'en': return 'English';
        default: return 'English';
    }
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = getStoredValue<'en' | 'fr' | 'rw' | null>('language', null);
    if (storedLang) return storedLang;
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'fr') return 'fr';
    if (browserLang === 'rw') return 'rw';
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', JSON.stringify(language));
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = useCallback((key: keyof typeof translations | string): string => {
    const dict = translations as any;
    return dict[key]?.[language] || key;
  }, [language]);

  const languageName = getLanguageName(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageName }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const CATEGORIES = ['topStories', 'world', 'politics', 'business', 'technology', 'sport', 'science', 'health'];
