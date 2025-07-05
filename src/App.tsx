import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRouter } from "./app/AppRouter";
import { AuthProvider } from "./features/auth/AuthContext";
import { I18nProvider } from "./app/I18nProvider";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WebSocketProvider } from "./components/providers/WebSocketProvider";
import "./index.css";
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Info } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  const [showDemoModal, setShowDemoModal] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <I18nProvider>
            <BrowserRouter>
              <AuthProvider>
                <WebSocketProvider>
                  <AppRouter />
                  <Toaster />
                  <Sonner />
                </WebSocketProvider>
              </AuthProvider>
            </BrowserRouter>
          </I18nProvider>
        </ThemeProvider>
      </TooltipProvider>
      {/* Modal DEMO global */}
      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="max-w-md bg-green-50 border-green-400">
          <DialogHeader>
            <DialogTitle className="text-green-800 text-xl font-bold flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
              Sistema DEMO
            </DialogTitle>
          </DialogHeader>
          <div className="text-green-900 text-base mt-2 mb-3">
            Este es un sistema <span className="font-bold">DEMO</span>. Algunas funcionalidades no se reflejan completamente.<br/>
            Si necesitas el sistema completo, contáctame por LinkedIn:
          </div>
          <a
            href="https://www.linkedin.com/in/kevin-vargas-0941a0282/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-green-700 font-semibold underline text-center hover:text-green-900 transition"
          >
            @kevin-vargas-0941a0282
          </a>
          <div className="text-xs text-green-700 text-center mt-2">Gracias por probar la demo</div>
        </DialogContent>
      </Dialog>
      {/* Botón flotante para volver a abrir el popup demo */}
      {!showDemoModal && (
        <button
          onClick={() => setShowDemoModal(true)}
          className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-3 flex items-center justify-center transition-all"
          title="Información de contacto demo"
        >
          <Info className="w-6 h-6" />
        </button>
      )}
    </QueryClientProvider>
  );
};

export default App;
