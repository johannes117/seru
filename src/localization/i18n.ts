import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        appName: "Seru",
        titleDashboardPage: "Dashboard",
        titleFilterToolPage: "Filter Tool",
        titleReorderToolPage: "Reorder Tool",
        titleSettingsPage: "Settings",
      },
    },
    "pt-BR": {
      translation: {
        appName: "Seru",
        titleDashboardPage: "Painel",
        titleFilterToolPage: "Ferramenta de Filtro",
        titleReorderToolPage: "Ferramenta de Reordenar",
        titleSettingsPage: "Configurações",
      },
    },
  },
});
