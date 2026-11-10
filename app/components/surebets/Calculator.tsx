// app/components/surebets/Calculator.tsx
// Componente UI para calcular la distribución de stakes en surebets con colores de alto contraste.
// CAMBIAR ARCHIVO COMPLETO

"use client";
import React, { useState, useEffect, useMemo } from "react";
import { OddsSignal } from "../../api/mockData";

interface CalculatorProps {
  signal: OddsSignal;
}

export default function SurebetCalculator({ signal }: CalculatorProps) {
  const [totalCapital, setTotalCapital] = useState<number>(10000);

  const calculations = useMemo(() => {
    const pi1 = 1 / signal.bookmaker1.odds;
    const pi2 = 1 / signal.bookmaker2.odds;
    const totalPi = pi1 + pi2;

    const stake1 = totalCapital * (pi1 / totalPi);
    const stake2 = totalCapital * (pi2 / totalPi);

    const return1 = stake1 * signal.bookmaker1.odds;
    const return2 = stake2 * signal.bookmaker2.odds;

    const netProfit = return1 - totalCapital;
    const profitMargin = (netProfit / totalCapital) * 100;

    return {
      stake1,
      stake2,
      return1,
      return2,
      netProfit,
      profitMargin,
      totalPi,
      isSurebet: totalPi < 1
    };
  }, [totalCapital, signal]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl max-w-md w-full border border-gray-800">
      <h2 className="text-xl font-bold mb-4 text-gray-100">{signal.match}</h2>
      
      <div className="mb-6 flex justify-between items-center bg-gray-800 p-4 rounded-md">
        <span className="text-gray-400">Rentabilidad Asegurada</span>
        <span className={`text-2xl font-black ${calculations.isSurebet ? 'text-green-400' : 'text-red-500'}`}>
          {calculations.isSurebet ? '+' : ''}{calculations.profitMargin.toFixed(2)}%
        </span>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Capital Total a Invertir ($)</label>
        <input
          type="number"
          value={totalCapital}
          onChange={(e) => setTotalCapital(Number(e.target.value))}
          className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white text-lg focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
        />
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-800 rounded-md border-l-4 border-blue-500">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">{signal.bookmaker1.name}</span>
            <span className="text-blue-400 font-bold">Cuota: {signal.bookmaker1.odds}</span>
          </div>
          <div className="text-sm text-gray-400">{signal.bookmaker1.team}</div>
          <div className="mt-3 flex justify-between items-end">
            <div>
              <div className="text-xs text-gray-500">Monto a Apostar</div>
              <div className="text-lg font-bold">${calculations.stake1.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Retorno</div>
              <div className="text-lg font-bold text-green-400">${calculations.return1.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-800 rounded-md border-l-4 border-purple-500">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">{signal.bookmaker2.name}</span>
            <span className="text-purple-400 font-bold">Cuota: {signal.bookmaker2.odds}</span>
          </div>
          <div className="text-sm text-gray-400">{signal.bookmaker2.team}</div>
          <div className="mt-3 flex justify-between items-end">
            <div>
              <div className="text-xs text-gray-500">Monto a Apostar</div>
              <div className="text-lg font-bold">${calculations.stake2.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Retorno</div>
              <div className="text-lg font-bold text-green-400">${calculations.return2.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-black rounded-md border border-green-500/30">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 font-medium">Ganancia Neta</span>
          <span className="text-2xl font-black text-green-400">
            ${calculations.netProfit.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}