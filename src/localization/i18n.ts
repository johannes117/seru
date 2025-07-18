import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        appName: "Seru",
        titleFilterToolPage: "Filter Tool",
        titleSettingsPage: "Settings",
        titleAddressSplitterPage: "Address Splitter",
        titleRecordSplitterPage: "Record Splitter",
        titlePythonInterpreterPage: "Python Interpreter",
      },
    },
    "pt-BR": {
      translation: {
        appName: "Seru",
        titleFilterToolPage: "Ferramenta de Filtro",
        titleSettingsPage: "Configurações",
        titleAddressSplitterPage: "Divisor de Endereços",
        titleRecordSplitterPage: "Divisor de Registros",
        titlePythonInterpreterPage: "Interpretador Python",
      },
    },
  },
});
