// app/admin/page.tsx
// Panel conectado a SQLite para gestión de contenidos y visualización.
// ====================================================================

// Panel de Control Premium con métricas de base de datos en tiempo real.
// ====================================================================

"use client";
import React, { useState, useEffect, useMemo } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("historial");
  const [history, setHistory] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  
  const [siteText, setSiteText] = useState({ title: "SUREBET PRO", subtitle: "Sistema de arbitraje deportivo avanzado" });
  const [media, setMedia] = useState({ logoUrl: "", backgroundVideo: "" });
  const [banners, setBanners] = useState({ leftActive: true, rightActive: false, leftUrl: "", rightUrl: "" });

  useEffect(() => {
    fetch('/api/history').then(res => res.json()).then(data => setHistory(data)).catch(console.error);
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (data.siteText) setSiteText(data.siteText);
      if (data.media) setMedia(data.media);
      if (data.banners) setBanners(data.banners);
    }).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { siteText, media, banners };
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) alert("✅ Configuración guardada exitosamente.");
    } catch (error) {
      alert("❌ Fallo de conexión.");
    } finally {
      setSaving(false);
    }
  };

  // Calcular métricas derivadas del historial
  const metrics = useMemo(() => {
    const totalSignals = history.length;
    const avgProfit = totalSignals > 0 ? history.reduce((acc, curr) => acc + curr.profit_margin, 0) / totalSignals : 0;
    const bestSignal = totalSignals > 0 ? Math.max(...history.map(s => s.profit_margin)) : 0;
    return { totalSignals, avgProfit: avgProfit.toFixed(2), bestSignal: bestSignal.toFixed(2) };
  }, [history]);

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden">
      
      <div className="bg-gray-100 dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Panel de Control Admin</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Supervisión del ecosistema Hunter</p>
        </div>
        <a href="/" className="px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 rounded text-sm font-semibold transition">
          Volver al sitio
        </a>
      </div>

      <div className="flex flex-col md:flex-row min-h-[600px]">
        <div className="w-full md:w-1/5 bg-gray-50 dark:bg-gray-950 p-4 border-r border-gray-200 dark:border-gray-800 space-y-2">
          <button onClick={() => setActiveTab("historial")} className={`w-full text-left p-3 rounded font-medium transition ${activeTab === "historial" ? "bg-green-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-800"}`}>📊 Base de Datos</button>
          <button onClick={() => setActiveTab("general")} className={`w-full text-left p-3 rounded font-medium transition ${activeTab === "general" ? "bg-green-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-800"}`}>⚙️ Textos y Medios</button>
          <button onClick={() => setActiveTab("banners")} className={`w-full text-left p-3 rounded font-medium transition ${activeTab === "banners" ? "bg-green-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-800"}`}>🖼️ Publicidad</button>
        </div>

        <div className="w-full md:w-4/5 p-6 overflow-x-auto bg-white dark:bg-gray-900">
          
          {activeTab === "historial" && (
            <div className="animate-fadeIn">
              
              {/* Tarjetas de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Señales (SQLite)</div>
                  <div className="text-2xl font-black">{metrics.totalSignals}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Rentabilidad Promedio</div>
                  <div className="text-2xl font-black text-blue-500">+{metrics.avgProfit}%</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Mejor Surebet</div>
                  <div className="text-2xl font-black text-green-500">+{metrics.bestSignal}%</div>
                </div>
              </div>

              <h2 className="text-xl font-bold border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">Últimas 50 Oportunidades Registradas</h2>
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Partido</th>
                    <th className="px-4 py-3">Cruce</th>
                    <th className="px-4 py-3 text-right">Rentabilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, index) => (
                    <tr key={index} className="bg-white border-b dark:bg-gray-900 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">#{row.id}</td>
                      <td className="px-4 py-3 text-xs">{new Date(row.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{row.match_name}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                          {row.bookmaker_1} ({row.odds_1})
                        </span>
                        vs
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
                          {row.bookmaker_2} ({row.odds_2})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-500">+{row.profit_margin.toFixed(2)}%</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No hay registros en la base de datos local.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "general" && (
            <form onSubmit={handleSave} className="animate-fadeIn space-y-6">
              <h2 className="text-xl font-bold border-b border-gray-200 dark:border-gray-800 pb-2">Textos Principales y Multimedia</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Título del Sitio</label>
                  <input type="text" value={siteText.title} onChange={e => setSiteText({...siteText, title: e.target.value})} className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Subtítulo</label>
                  <input type="text" value={siteText.subtitle} onChange={e => setSiteText({...siteText, subtitle: e.target.value})} className="w-full p-2 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button type="submit" disabled={saving} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg transition">
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "banners" && (
             <form onSubmit={handleSave} className="animate-fadeIn space-y-6">
                <h2 className="text-xl font-bold border-b border-gray-200 dark:border-gray-800 pb-2">Gestión de Banners Laterales</h2>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold">Banner Izquierdo</span>
                    <input type="checkbox" checked={banners.leftActive} onChange={e => setBanners({...banners, leftActive: e.target.checked})} className="w-5 h-5 accent-green-500" />
                  </div>
                  {banners.leftActive && (
                    <input type="text" placeholder="URL de la imagen" value={banners.leftUrl} onChange={e => setBanners({...banners, leftUrl: e.target.value})} className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 mt-2" />
                  )}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold">Banner Derecho</span>
                    <input type="checkbox" checked={banners.rightActive} onChange={e => setBanners({...banners, rightActive: e.target.checked})} className="w-5 h-5 accent-green-500" />
                  </div>
                  {banners.rightActive && (
                    <input type="text" placeholder="URL de la imagen" value={banners.rightUrl} onChange={e => setBanners({...banners, rightUrl: e.target.value})} className="w-full p-2 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 mt-2" />
                  )}
                </div>
                <div className="mt-8 flex justify-end">
                  <button type="submit" disabled={saving} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg transition">
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
             </form>
          )}

        </div>
      </div>
    </div>
  );
}