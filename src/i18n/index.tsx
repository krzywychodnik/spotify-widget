import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Language, TranslationDictionary } from "./types";
import { en } from "./locales/en";
import { pl } from "./locales/pl";

export * from "./types";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
];

const LOCALES: Record<Language, TranslationDictionary> = {
  en,
  pl,
};

const STORAGE_KEY = "music_overlay_language";

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  availableLanguages: LanguageOption[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === "en" || saved === "pl")) {
        return saved as Language;
      }
    } catch {}
    // Default language is English as requested by user
    return "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, []);

  const t = useMemo(() => {
    return LOCALES[language] || LOCALES.en;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      availableLanguages: AVAILABLE_LANGUAGES,
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: "en",
      setLanguage: () => {},
      t: LOCALES.en,
      availableLanguages: AVAILABLE_LANGUAGES,
    };
  }
  return context;
}
