// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import ru from "./locales/ru/translation.json";
import uz from "./locales/uz/translation.json";

i18n
  .use(LanguageDetector) // Автоопределение языка из браузера
  .use(initReactI18next) // Подключение к React
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uz: { translation: uz },
    },
    fallbackLng: "en", // Язык по умолчанию
    interpolation: {
      escapeValue: false, // Не экранируй HTML
    },
  });

export default i18n;
