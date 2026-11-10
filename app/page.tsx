// app/page.tsx
// Vista principal que consume las señales reales del motor Python a través de la API local.
// ====================================================================
// Dashboard principal dinámico conectado a SQLite para mostrar configuraciones del Admin.
// ====================================================================
// Dashboard dinámico con sistema de Auto-Refresco (Polling) cada 30 segundos.
// ====================================================================

"use client";
import React, { useState, useEffect } from "react";
import ThemeToggle from "./components/ThemeToggle";

interface SurebetSignal {
  id: string;
  match: string;
  market: string;
  bookmaker1: { name: string; odds: number; team: string };
  bookmaker2: { name: string; odds: number; team: string };
}

export default function Home() {
  const [signals, setSignals] = useState<SurebetSignal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<SurebetSignal | null>(null);
  const [investment, setInvestment] = useState<number>(10000);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const [settings, setSettings] = useState({
    siteText: { title: "HUNTER", subtitle: "Buscando oportunidades en tiempo real..." },
    banners: { leftActive: false, leftUrl: "", rightActive: false, rightUrl: "" }
  });

  useEffect(() => {
    // 1. Cargar configuraciones visuales solo una vez al iniciar
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({
          siteText: data.siteText || prev.siteText,
          banners: data.banners || prev.banners
        }));
      })
      .catch(console.error);

    // 2. Función de extracción de señales (Polling)
    let isMounted = true;
    const fetchLiveSignals = async () => {
      try {
        const res = await fetch('/api/surebets');
        const data = await res.json();
        
        if (isMounted) {
          setSignals(data);
          setLastUpdate(new Date());
          setLoading(false);
          
          // Mantiene la señal seleccionada si aún existe, si no, selecciona la primera nueva
          setSelectedSignal(current => {
            if (!current && data.length > 0) return data[0];
            const stillExists = data.find((s: SurebetSignal) => s.id === current?.id);
            return stillExists || (data.length > 0 ? data[0] : null);
          });
        }
      } catch (err) {
        console.error("Error actualizando señales:", err);
        if (isMounted) setLoading(false);
      }
    };

    // Ejecutar inmediatamente y luego cada 30 segundos
    fetchLiveSignals();
    const interval = setInterval(fetchLiveSignals, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const calculateDistribution = (signal: SurebetSignal, total: number) => {
    const o1 = signal.bookmaker1.odds;
    const o2 = signal.bookmaker2.odds;
    const p1 = 1 / o1;
    const p2 = 1 / o2;
    const sumP = p1 + p2;
    const stake1 = (total * p1) / sumP;
    const stake2 = (total * p2) / sumP;
    const return1 = stake1 * o1;
    const profit = return1 - total;
    const margin = (profit / total) * 100;
    return { stake1, stake2, return1, profit, margin };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">
            {settings.siteText.title.toUpperCase()}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {settings.siteText.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a href="/admin" className="px-3 py-1 text-xs font-bold bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition">
            Admin
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 flex gap-6 mt-4">
        {settings.banners.leftActive && settings.banners.leftUrl && (
          <aside className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-24 w-full h-[600px] bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
              <img src={settings.banners.leftUrl} alt="Ad Left" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          </aside>
        )}

        <div className="flex-1 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-5 flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                📡 Señales en Vivo
              </h2>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 ${loading ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {loading && <span className="animate-spin inline-block w-3 h-3 border-2 border-yellow-700 border-t-transparent rounded-full"></span>}
                  {loading ? 'Escaneando...' : 'En Línea'}
                </span>
                {!loading && <span className="text-[10px] text-gray-400 mt-1">Act. {lastUpdate.toLocaleTimeString()}</span>}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {loading && signals.length === 0 && <div className="text-center text-gray-500 py-10 animate-pulse">Consultando a los 4 motores de extracción paralela...</div>}
              {!loading && signals.length === 0 && <div className="text-center text-gray-500 py-10">No hay surebets detectadas en este momento.</div>}
              
              {signals.map((signal) => (
                <div 
                  key={signal.id} 
                  onClick={() => setSelectedSignal(signal)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:-translate-y-1 ${
                    selectedSignal?.id === signal.id 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/10 shadow-md' 
                      : 'border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{signal.market}</div>
                  <div className="font-bold mb-3">{signal.match}</div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{signal.bookmaker1.name}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">{signal.bookmaker2.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-1/2">
            {!selectedSignal ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                Selecciona una señal para calcular tu inversión.
              </div>
            ) : (
              <div className="bg-gray-900 dark:bg-gray-950 text-white rounded-xl shadow-2xl p-6 sticky top-24 border border-gray-800 animate-fadeIn">
                <h2 className="text-xl font-bold mb-6">{selectedSignal.match}</h2>
                
                {(() => {
                  const calc = calculateDistribution(selectedSignal, investment);
                  return (
                    <>
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-6 flex justify-between items-center border border-gray-700">
                        <span className="text-gray-400">Rentabilidad Asegurada</span>
                        <span className="text-2xl font-black text-green-500">+{calc.margin.toFixed(2)}%</span>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm text-gray-400 mb-2">Capital Total a Invertir ($)</label>
                        <input 
                          type="number" 
                          value={investment} 
                          onChange={(e) => setInvestment(Number(e.target.value) || 0)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-lg font-bold focus:outline-none focus:border-green-500 transition"
                        />
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="border border-blue-900/50 bg-blue-950/20 rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-bold text-blue-400">{selectedSignal.bookmaker1.name}</span>
                            <span className="text-blue-400">Cuota: {selectedSignal.bookmaker1.odds}</span>
                          </div>
                          <div className="text-sm text-gray-400 mb-4">{selectedSignal.bookmaker1.team}</div>
                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-xs text-gray-500">Monto a Apostar</div>
                              <div className="text-xl font-bold">${calc.stake1.toFixed(2)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Retorno</div>
                              <div className="font-bold text-green-500">${calc.return1.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="border border-purple-900/50 bg-purple-950/20 rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-bold text-purple-400">{selectedSignal.bookmaker2.name}</span>
                            <span className="text-purple-400">Cuota: {selectedSignal.bookmaker2.odds}</span>
                          </div>
                          <div className="text-sm text-gray-400 mb-4">{selectedSignal.bookmaker2.team}</div>
                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-xs text-gray-500">Monto a Apostar</div>
                              <div className="text-xl font-bold">${calc.stake2.toFixed(2)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Retorno</div>
                              <div className="font-bold text-green-500">${calc.return1.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black rounded-lg p-4 flex justify-between items-center border border-green-900/30">
                        <span className="text-gray-400 font-medium">Ganancia Neta</span>
                        <span className="text-2xl font-black text-green-500">${calc.profit.toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {settings.banners.rightActive && settings.banners.rightUrl && (
          <aside className="hidden lg:block w-48 shrink-0">
            <div className="sticky top-24 w-full h-[600px] bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
              <img src={settings.banners.rightUrl} alt="Ad Right" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}