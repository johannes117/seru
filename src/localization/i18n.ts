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
        titleAIAssistantPage: "AI Assistant",
        aiAssistantDescription: "Chat with an AI assistant to help with your tasks",
        typeMessage: "Type your message...",
        clearChat: "Clear Chat",
      },
    },
    "pt-BR": {
      translation: {
        appName: "Seru",
        titleFilterToolPage: "Ferramenta de Filtro",
        titleSettingsPage: "Configurações",
        titleAddressSplitterPage: "Divisor de Endereços",
        titleRecordSplitterPage: "Divisor de Registros",
        titleAIAssistantPage: "Assistente IA",
        aiAssistantDescription: "Converse com um assistente IA para ajudar com suas tarefas",
        typeMessage: "Digite sua mensagem...",
        clearChat: "Limpar Chat",
      },
    },
  },
});
