import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { getPreferences, updatePreference } from '../services/userService.ts';
import { useAuth } from './AuthContext.tsx';

type Language = 'en' | 'fr' | 'rw';

// In a real app, this would be in a separate JSON file per language
const translations: Record<Language, Record<string, string>> = {
  en: {
    'Top Stories': 'Top Stories',
    World: 'World',
    Technology: 'Technology',
    Science: 'Science',
    Politics: 'Politics',
    Sport: 'Sport',
    Health: 'Health',
    forYou: 'For You',
    savedArticles: 'Saved Articles',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    searchPlaceholder: 'Search for topics...',
    searchAriaLabel: 'Search',
    backToTop: 'Back to Top',
    aboutUsText: 'Your daily source for trusted news and analysis. We are committed to delivering the latest updates with accuracy and integrity.',
    quickLinks: 'Quick Links',
    followUs: 'Follow Us',
    language: 'Language',
    darkMode: 'Dark Mode',
    poweredBy: 'Powered by Gemini',
    searchResultsFor: 'Search results for',
    noArticlesFound: 'No articles found for this topic.',
    aiTools: 'AI Tools',
    summarize: 'Summarize Article',
    getSummary: 'Get Summary',
    translateTo: 'Translate to',
    showOriginal: 'Show Original',
    askQuestion: 'Ask a Question about this Article',
    questionPlaceholder: 'e.g., What is the main takeaway?',
    getAnswer: 'Get Answer',
    generating: 'Generating...',
    improveWriting: 'Improve with AI',
    generateImageIdea: 'Generate Image Idea',
    generateWithAI: 'Generate Article with AI',
    enterTopic: 'Enter a topic for the article',
    generate: 'Generate',
    userMenu: 'Open user menu',
    loginToYourAccount: 'Login to your account',
    emailAddress: 'Email Address',
    password: 'Password',
    loginCTA: 'Login',
    dontHaveAccount: "Don't have an account?",
    register: 'Register',
    createAnAccount: 'Create an Account',
    fullName: 'Full Name',
    confirmPassword: 'Confirm Password',
    registerCTA: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    accentColor: 'Accent Color',
  },
  fr: {
    'Top Stories': 'À la une',
    World: 'Monde',
    Technology: 'Technologie',
    Science: 'Science',
    Politics: 'Politique',
    Sport: 'Sport',
    Health: 'Santé',
    forYou: 'Pour vous',
    savedArticles: 'Articles sauvegardés',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    login: 'Connexion',
    searchPlaceholder: 'Rechercher des sujets...',
    searchAriaLabel: 'Rechercher',
    backToTop: 'Retour en haut',
    aboutUsText: "Votre source quotidienne d'informations et d'analyses fiables. Nous nous engageons à fournir les dernières mises à jour avec précision et intégrité.",
    quickLinks: 'Liens rapides',
    followUs: 'Suivez-nous',
    language: 'Langue',
    darkMode: 'Mode sombre',
    poweredBy: 'Propulsé par Gemini',
    searchResultsFor: 'Résultats de recherche pour',
    noArticlesFound: 'Aucun article trouvé pour ce sujet.',
    aiTools: "Outils d'IA",
    summarize: "Résumer l'article",
    getSummary: 'Obtenir le résumé',
    translateTo: 'Traduire en',
    showOriginal: "Afficher l'original",
    askQuestion: 'Poser une question sur cet article',
    questionPlaceholder: 'ex: Quel est le point principal ?',
    getAnswer: 'Obtenir la réponse',
    generating: 'Génération...',
    improveWriting: "Améliorer avec l'IA",
    generateImageIdea: "Générer une idée d'image",
    generateWithAI: "Générer un article avec l'IA",
    enterTopic: "Entrez un sujet pour l'article",
    generate: 'Générer',
    userMenu: 'Ouvrir le menu utilisateur',
    loginToYourAccount: 'Connectez-vous à votre compte',
    emailAddress: 'Adresse e-mail',
    password: 'Mot de passe',
    loginCTA: 'Connexion',
    dontHaveAccount: "Vous n'avez pas de compte ?",
    register: "S'inscrire",
    createAnAccount: 'Créer un compte',
    fullName: 'Nom complet',
    confirmPassword: 'Confirmez le mot de passe',
    registerCTA: 'Créer le compte',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    accentColor: "Couleur d'accentuation",
  },
  rw: {
    'Top Stories': 'Inkuru zikunzwe',
    World: 'Isi',
    Technology: 'Ikoranabuhanga',
    Science: 'Siyansi',
    Politics: 'Politiki',
    Sport: 'Imikino',
    Health: 'Ubuzima',
    forYou: 'Ibyakugenewe',
    savedArticles: 'Inyandiko wabitse',
    settings: 'Uburyo',
    logout: 'Gusohoka',
    login: 'Injira',
    searchPlaceholder: 'Shakisha...',
    searchAriaLabel: 'Shakisha',
    backToTop: 'Subira hejuru',
    aboutUsText: 'Aho ukura amakuru yizewe buri munsi. Twiyemeje kuguha amakuru agezweho mu kuri no mu mucyo.',
    quickLinks: 'Ahandi wanyura',
    followUs: 'Dukurikire',
    language: 'Ururimi',
    darkMode: 'Uburyo bwijimye',
    poweredBy: 'Bikorwa na Gemini',
    searchResultsFor: 'Ibyavuye mu gushakisha',
    noArticlesFound: 'Nta nkuru zibonetse kuri uyu mutwe.',
    aiTools: 'Ibikoresho bya AI',
    summarize: 'Vunagura iyi nyandiko',
    getSummary: 'Bona incamake',
    translateTo: 'Hindura mu',
    showOriginal: 'Garagaza umwimerere',
    askQuestion: 'Baza ikibazo kuri iyi nyandiko',
    questionPlaceholder: 'Urugero: Niki cyingenzi kivugwamo?',
    getAnswer: 'Bona igisubizo',
    generating: 'Birimo gukorwa...',
    improveWriting: 'Nosa inyandiko na AI',
    generateImageIdea: 'Tekereza igishushanyo',
    generateWithAI: 'Kora inyandiko na AI',
    enterTopic: "Andika umutwe w'inyandiko",
    generate: 'Kora',
    userMenu: "Fungura menu y'ukoresha",
    loginToYourAccount: 'Injira muri konti yawe',
    emailAddress: 'Imeri',
    password: 'Ijambobanga',
    loginCTA: 'Injira',
    dontHaveAccount: "Ntafite konti?",
    register: 'Iyandikishe',
    createAnAccount: 'Fungura konti',
    fullName: 'Amazina yose',
    confirmPassword: 'Emeza ijambobanga',
    registerCTA: 'Fungura Konti',
    alreadyHaveAccount: 'Usanganywe konti?',
    accentColor: "Ibara ry'ibanze",
  },
};

export const CATEGORIES = ['Top Stories', 'World', 'Technology', 'Science', 'Politics', 'Sport', 'Health'];

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  loadUserLanguage: (token: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('language') as Language | null;
      if (storedLang && ['en', 'fr', 'rw'].includes(storedLang)) {
        return storedLang;
      }
      const browserLang = navigator.language.split('-')[0];
      if (['fr', 'rw'].includes(browserLang)) return browserLang as Language;
    }
    return 'en';
  };
  
  const [language, _setLanguage] = useState<Language>(getInitialLanguage);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const setLanguage = (newLanguage: Language) => {
    _setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    if (user?.token) {
      updatePreference('language', newLanguage, user.token).catch(console.error);
    }
  };
  
  const loadUserLanguage = useCallback(async (token: string) => {
    try {
        const prefs = await getPreferences(token);
        if (prefs.language) {
          _setLanguage(prefs.language);
          localStorage.setItem('language', prefs.language);
        }
    } catch (error) {
        console.warn("Could not load user language from DB, using local.", error);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, loadUserLanguage }}>
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
