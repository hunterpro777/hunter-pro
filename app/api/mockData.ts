// app/api/mockData.ts
// Función mock que emula el feed de cuotas de las 4 casas de apuestas.
// CAMBIAR ARCHIVO COMPLETO

export interface OddsSignal {
  id: string;
  match: string;
  market: string;
  bookmaker1: { name: string; odds: number; team: string };
  bookmaker2: { name: string; odds: number; team: string };
}

export const fetchMockSurebets = async (): Promise<OddsSignal[]> => {
  return [
    {
      id: "SB-001",
      match: "Nadal vs Alcaraz",
      market: "Ganador del Partido",
      bookmaker1: { name: "Betano", odds: 1.60, team: "Nadal" },
      bookmaker2: { name: "Betplay", odds: 2.90, team: "Alcaraz" }
    },
    {
      id: "SB-002",
      match: "Millonarios vs Nacional",
      market: "Más de 2.5 Goles",
      bookmaker1: { name: "Wplay", odds: 2.10, team: "Over 2.5" },
      bookmaker2: { name: "Rushbet", odds: 2.05, team: "Under 2.5" }
    }
  ];
};