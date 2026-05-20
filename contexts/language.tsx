import { createContext, useContext, useState, type ReactNode } from 'react';
import translations, { type Lang, type Translations } from '@/constants/i18n';

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: Translations;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'my',
  setLang: () => {},
  tr: translations.my,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('my');
  return (
    <LanguageContext.Provider value={{ lang, setLang, tr: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
