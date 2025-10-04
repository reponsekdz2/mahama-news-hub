import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.tsx';
import { getPreferences, updatePreference } from '../services/userService.ts';

type Language = 'en' | 'fr' | 'rw';

// Mock translations as files are not provided
const translations: Record<Language, Record<string, string>> = {
  en: { 
      "Top Stories": "Top Stories", "World": "World", "Technology": "Technology", "Science": "Science", "Politics": "Politics", "Sport": "Sport", "Health": "Health", "forYou": "For You", "myLibrary": "My Library", "readingHistory": "Reading History", "settings": "Settings", "logout": "Logout", "login": "Login", "searchPlaceholder": "Search for news...", "searchAriaLabel": "Search", "backToTop": "Back to Top", "userMenu": "User menu", "searchResultsFor": "Search results for", "noArticlesFound": "No articles found for this topic.", "backToNews": "Back to News", "advertisement": "Ad", "aiTools": "AI Tools", "summarize": "Summarize", "getSummary": "Get Summary", "translateTo": "Translate to", "showOriginal": "Show Original", "askQuestion": "Ask a question about the article", "questionPlaceholder": "Your question...", "getAnswer": "Get Answer", "generating": "Generating...", "improveWriting": "Improve with AI", "generateImageIdea": "Generate Image Idea", "generateWithAI": "Generate with AI", "enterTopic": "Enter a topic", "generate": "Generate", "saveToCollection": "Save to Collection", "newCollection": "New collection name...", "create": "Create", "saved": "Save", "loginToYourAccount": "Login to your account", "emailAddress": "Email address", "password": "Password", "loginCTA": "Login", "dontHaveAccount": "Don't have an account?", "register": "Register", "createAnAccount": "Create an Account", "fullName": "Full Name", "confirmPassword": "Confirm Password", "registerCTA": "Create Account", "alreadyHaveAccount": "Already have an account?", "notifications": "Notifications", "noNewNotifications": "No new notifications", "markAllAsRead": "Mark all as read", "trendingArticles": "Trending Articles", "commentNotifications": "New comment notifications", "retry": "Retry", "errorOccurred": "An Error Occurred", "technicalDetails": "Technical Details", "advancedSearch": "Advanced Search", "dateRange": "Date Range", "allTime": "All Time", "past24Hours": "Past 24 hours", "pastWeek": "Past week", "pastMonth": "Past month", "sortBy": "Sort by", "newest": "Newest", "oldest": "Oldest", "mostViews": "Most Views", "mostLikes": "Most Likes", "readerMode": "Reader Mode", "accessibility": "Accessibility", "fontSize": "Font Size", "small": "Small", "base": "Base", "large": "Large", "lineHeight": "Line Height", "normal": "Normal", "relaxed": "Relaxed", "loose": "Loose", "signInWithGoogle": "Sign in with Google", "reportIssue": "Report Issue", "copyDetails": "Copy Details", "shareArticle": "Share Article", "surpriseMe": "Surprise Me", "minRead": "min read", "recentSearches": "Recent Searches", "searchSuggestions": "Suggestions", "voiceSearch": "Use voice search", "listening": "Listening...", "noSuggestions": "No suggestions found.", "offline": "You are currently offline.", "savedForOffline": "Save for offline reading", "removeFromOffline": "Remove from offline articles", "offlineArticles": "Offline Articles", "poll": "Poll", "vote": "Vote", "totalVotes": "Total Votes", "moderation": "Moderation", "aboutAI": "About our AI", "aiTransparency": "AI Transparency & Features", "analyze": "Analyze", "contentAnalysis": "Content Analysis", "sentiment": "Sentiment", "keyTopics": "Key Topics", "seoKeywords": "SEO Keywords", "readability": "Readability Score", "summary": "Summary", "generateSummary": "Generate Summary with AI", "offlineRequiresSubscription": "Offline reading is a premium feature."
  },
  fr: { 
      "Top Stories": "À la une", "World": "Monde", "Technology": "Technologie", "Science": "Science", "Politics": "Politique", "Sport": "Sport", "Health": "Santé", "forYou": "Pour vous", "myLibrary": "Ma bibliothèque", "readingHistory": "Historique", "settings": "Paramètres", "logout": "Déconnexion", "login": "Connexion", "searchPlaceholder": "Rechercher...", "searchAriaLabel": "Rechercher", "backToTop": "Retour en haut", "userMenu": "Menu utilisateur", "searchResultsFor": "Résultats pour", "noArticlesFound": "Aucun article trouvé.", "backToNews": "Retour aux actualités", "advertisement": "Publicité", "aiTools": "Outils IA", "summarize": "Résumer", "getSummary": "Obtenir le résumé", "translateTo": "Traduire en", "showOriginal": "Afficher l'original", "askQuestion": "Poser une question sur l'article", "questionPlaceholder": "Votre question...", "getAnswer": "Obtenir la réponse", "generating": "Génération...", "improveWriting": "Améliorer avec l'IA", "generateImageIdea": "Idée d'image IA", "generateWithAI": "Générer avec l'IA", "enterTopic": "Saisir un sujet", "generate": "Générer", "saveToCollection": "Enregistrer dans", "newCollection": "Nom de la collection...", "create": "Créer", "saved": "Enregistrer", "loginToYourAccount": "Connectez-vous", "emailAddress": "Adresse e-mail", "password": "Mot de passe", "loginCTA": "Connexion", "dontHaveAccount": "Pas de compte ?", "register": "S'inscrire", "createAnAccount": "Créer un compte", "fullName": "Nom complet", "confirmPassword": "Confirmez le mot de passe", "registerCTA": "Créer le compte", "alreadyHaveAccount": "Déjà un compte ?", "notifications": "Notifications", "noNewNotifications": "Aucune nouvelle notification", "markAllAsRead": "Tout marquer comme lu", "trendingArticles": "Articles populaires", "commentNotifications": "Notifications de nouveaux commentaires", "retry": "Réessayer", "errorOccurred": "Une erreur est survenue", "technicalDetails": "Détails techniques", "advancedSearch": "Recherche avancée", "dateRange": "Période", "allTime": "Tout temps", "past24Hours": "Dernières 24h", "pastWeek": "Semaine dernière", "pastMonth": "Mois dernier", "sortBy": "Trier par", "newest": "Plus récent", "oldest": "Plus ancien", "mostViews": "Plus de vues", "mostLikes": "Plus de j'aime", "readerMode": "Mode lecture", "accessibility": "Accessibilité", "fontSize": "Taille de police", "small": "Petite", "base": "Normale", "large": "Grande", "lineHeight": "Hauteur de ligne", "normal": "Normale", "relaxed": "Détendue", "loose": "Spacieuse", "signInWithGoogle": "Se connecter avec Google", "reportIssue": "Signaler un problème", "copyDetails": "Copier les détails", "shareArticle": "Partager l'article", "surpriseMe": "Surprenez-moi", "minRead": "min de lecture", "recentSearches": "Recherches récentes", "searchSuggestions": "Suggestions", "voiceSearch": "Recherche vocale", "listening": "Écoute...", "noSuggestions": "Aucune suggestion trouvée.", "offline": "Vous êtes actuellement hors ligne.", "savedForOffline": "Enregistrer pour lire hors ligne", "removeFromOffline": "Retirer des articles hors ligne", "offlineArticles": "Articles hors ligne", "poll": "Sondage", "vote": "Voter", "totalVotes": "Total des votes", "moderation": "Modération", "aboutAI": "À propos de notre IA", "aiTransparency": "Transparence et fonctionnalités de l'IA", "analyze": "Analyser", "contentAnalysis": "Analyse de contenu", "sentiment": "Sentiment", "keyTopics": "Sujets clés", "seoKeywords": "Mots-clés SEO", "readability": "Score de lisibilité", "summary": "Résumé", "generateSummary": "Générer un résumé avec l'IA", "offlineRequiresSubscription": "La lecture hors ligne est une fonctionnalité premium."
  },
  rw: { 
      "Top Stories": "Inkuru z'ingenzi", "World": "Isi", "Technology": "Ikoranabuhanga", "Science": "Siyansi", "Politics": "Politiki", "Sport": "Siporo", "Health": "Ubuzima", "forYou": "Ibyahiswemo", "myLibrary": "Ibitabo byanjye", "readingHistory": "Amateka", "settings": "Igenamiterere", "logout": "Gusohoka", "login": "Injira", "searchPlaceholder": "Shakisha amakuru...", "searchAriaLabel": "Shakisha", "backToTop": "Subira hejuru", "userMenu": "Ibikubiyemo", "searchResultsFor": "Ibisubizo bya", "noArticlesFound": "Nta nkuru zibonetse.", "backToNews": "Subira ku makuru", "advertisement": " kwamamaza", "aiTools": "Ibikoresho bya AI", "summarize": "Incamake", "getSummary": "Shaka incamake", "translateTo": "Hindura mu", "showOriginal": "Erekana umwimerere", "askQuestion": "Baza ikibazo", "questionPlaceholder": "Ikibazo cyawe...", "getAnswer": "Shaka igisubizo", "generating": "Birimo gukorwa...", "improveWriting": "Nonoza n'AI", "generateImageIdea": "Igitekerezo cy'ishusho", "generateWithAI": "Kora n'AI", "enterTopic": "Andika umutwe", "generate": "Kora", "saveToCollection": "Bika muri", "newCollection": "Izina ry'icyegeranyo...", "create": "Kurema", "saved": "Bika", "loginToYourAccount": "Injira muri konti", "emailAddress": "Imeyili", "password": "Ijambobanga", "loginCTA": "Injira", "dontHaveAccount": "Ntafite konti?", "register": "Iyandikishe", "createAnAccount": "Fungura Konti", "fullName": "Amazina yose", "confirmPassword": "Emeza ijambobanga", "registerCTA": "Fungura Konti", "alreadyHaveAccount": "Usanganywe konti?", "notifications": "Amanota", "noNewNotifications": "Nta manota mashya", "markAllAsRead": "Soma byose", "trendingArticles": "Inkuru zikunzwe", "commentNotifications": "Amanota y'ibitekerezo bishya", "retry": "Gerageza nonaha", "errorOccurred": "Habaye ikibazo", "technicalDetails": "Amakuru ya tekiniki", "advancedSearch": "Gushakisha birambuye", "dateRange": "Igihe", "allTime": "Ibihe byose", "past24Hours": "Amasaha 24 ashize", "pastWeek": "Icyumweru gishize", "pastMonth": "Ukwezi gushize", "sortBy": "Ronda n'iki", "newest": "Gishya", "oldest": "Gishaje", "mostViews": "Cyarebwe cyane", "mostLikes": "Cyakunzwe cyane", "readerMode": "Uburyo bwo gusoma", "accessibility": "Uburyo bworoshye", "fontSize": "Ingano y'inyuguti", "small": "Gito", "base": "Normale", "large": "Kinini cyane", "lineHeight": "Intera y'imirongo", "normal": "Bisanzwe", "relaxed": "Byisanzuye", "loose": "Byagutse cyane", "signInWithGoogle": "Injira na Google", "reportIssue": "Tanga ikibazo", "copyDetails": "Koporora amakuru", "shareArticle": "Sangiza inkuru", "surpriseMe": "Ntungure", "minRead": "iminota yo gusoma", "recentSearches": "Ubushakashatsi bwa vuba", "searchSuggestions": "Ibitekerezo", "voiceSearch": "Koresha ijwi", "listening": "Ndumva...", "noSuggestions": "Nta gitekerezo kibonetse.", "offline": "Ntabwo muri kuri interineti.", "savedForOffline": "Bika usome nyuma", "removeFromOffline": "Kura mu bibitse", "offlineArticles": "Inkuru zabitswe", "poll": "Itora", "vote": "Tora", "totalVotes": "Amajwi yose", "moderation": "Kugenzura", "aboutAI": "Ibyerekeye AI yacu", "aiTransparency": "Ukuri n'ubushobozi bwa AI", "analyze": "Sesengura", "contentAnalysis": "Isesengura ry'ibikubiyemo", "sentiment": "Sentiment", "keyTopics": "Ingingo z'ingenzi", "seoKeywords": "Mots-clés SEO", "readability": "Amanota yo gusoma", "summary": "Incamake", "generateSummary": "Kora incamake n'AI", "offlineRequiresSubscription": "Gusoma offline ni serivisi y'abiyandikishije."
  },
};


export const CATEGORIES = ['Top Stories', 'World', 'Technology', 'Science', 'Politics', 'Sport', 'Health'];

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, ...args: any[]) => string;
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
      if (['en', 'fr', 'rw'].includes(browserLang)) {
        return browserLang as Language;
      }
    }
    return 'en';
  };
  
  const [language, _setLanguage] = useState<Language>(getInitialLanguage);

  const t = (key: string, ...args: any[]): string => {
    let translation = translations[language]?.[key] || key;
    if (args.length > 0) {
      args.forEach((arg, index) => {
        translation = translation.replace(`{${index}}`, arg);
      });
    }
    return translation;
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

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  
  const value = { language, setLanguage, t, loadUserLanguage };

  return (
    <LanguageContext.Provider value={value}>
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