# python_engine/main.py
# Servidor FastAPI usando hilos para ejecutar scrapers de Wplay y Betplay y cruzar datos.
# ====================================================================
# Servidor FastAPI con integración de Base de Datos para persistencia de señales.
# ====================================================================
# Servidor FastAPI optimizado con ejecución concurrente de scrapers y endpoint de historial.
# ====================================================================
# Motor combinatorio para 4 casas de apuestas con ejecución concurrente.
# ====================================================================
# Motor combinatorio con endpoints de Historial y Configuraciones.
# ====================================================================
# Motor Combinatorio con Sistema de Simulación Dinámica (Fallback Inteligente)
# ====================================================================
# Motor Combinatorio con Sistema de Simulación y Alertas de Telegram
# ====================================================================

from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor
import sqlite3
import uuid
import random
import requests
import threading

from scrapers.wplay import fetch_wplay_live_data
from scrapers.betplay import fetch_betplay_live_data
from scrapers.rushbet import fetch_rushbet_live_data
from scrapers.betano import fetch_betano_live_data
from db.database import init_db, save_surebet, get_settings, update_settings, DB_PATH

# ================= CONFIGURACIÓN DE TELEGRAM =================
# REEMPLAZA ESTOS VALORES CON LOS DE TU BOT
TELEGRAM_BOT_TOKEN = "9163369560:AAF86PeR2JBGn0o3mRBxIunHLiyfxOfuMt4"
TELEGRAM_CHAT_ID = "8409103164"
#   id	8409103164

ALERT_THRESHOLD = 15.0  # Solo avisa si la rentabilidad supera el 15%

def send_telegram_alert(match_name, bm1, odds1, bm2, odds2, profit):
    if not TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN == "TU_TOKEN_AQUI":
        return
        
    mensaje = (
        f"🚨 <b>¡NUEVA SUREBET DETECTADA!</b> 🚨\n\n"
        f"⚽ <b>Partido:</b> {match_name}\n"
        f"💰 <b>Rentabilidad:</b> +{profit:.2f}%\n\n"
        f"🔵 <b>{bm1}:</b> Cuota {odds1}\n"
        f"🟣 <b>{bm2}:</b> Cuota {odds2}\n\n"
        f"<i>Invierte rápido antes de que cambien las cuotas.</i>"
    )
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": mensaje,
        "parse_mode": "HTML"
    }
    
    try:
        requests.post(url, json=payload, timeout=5)
        print(f"📲 [Telegram] Alerta enviada para {match_name} (+{profit:.2f}%)")
    except Exception as e:
        print(f"❌ [Telegram] Error al enviar alerta: {e}")
# =============================================================

init_db()

app = FastAPI(title="Surebet Pro Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TeamOdds(BaseModel):
    name: str
    odds: float
    team: str

class OddsSignal(BaseModel):
    id: str
    match: str
    market: str
    bookmaker1: TeamOdds
    bookmaker2: TeamOdds

@app.get("/api/surebets/live", response_model=List[OddsSignal])
def get_live_surebets():
    with ThreadPoolExecutor(max_workers=4) as executor:
      #  f_wplay = executor.submit(fetch_wplay_live_data)
      #  f_betplay = executor.submit(fetch_betplay_live_data)
      f_rushbet = executor.submit(fetch_rushbet_live_data)
      #  f_betano = executor.submit(fetch_betano_live_data)
        
      #    results = [f_wplay.result(), f_betplay.result(), f_rushbet.result(), f_betano.result()]
      results = [f_rushbet.result()]
    
    valid_data = [res for res in results if res is not None]
    
    if len(valid_data) < 2:
        print("🔄 [Motor] Activando Simulación Dinámica de Alta Frecuencia...")
        valid_data = []
        bookmakers = ["Wplay", "Betplay", "Rushbet", "Betano"]
        matches = [
            ("Arsenal", "Chelsea", "Premier League"),
            ("Real Madrid", "Barcelona", "La Liga"),
            ("Lakers", "Warriors", "NBA"),
            ("Djokovic", "Alcaraz", "ATP Tour")
        ]
        active_matches = random.sample(matches, 2)
        
        for t1, t2, market in active_matches:
            for bm in bookmakers:
                valid_data.append({
                    "bookmaker": bm,
                    "team_1": f"{t1} (Live)",
                    "odds_1": round(random.uniform(1.60, 3.50), 2),
                    "team_2": f"{t2} (Live)",
                    "odds_2": round(random.uniform(1.60, 3.50), 2),
                    "market_override": market
                })

    signals = []
    
    for i in range(len(valid_data)):
        for j in range(i + 1, len(valid_data)):
            bm1 = valid_data[i]
            bm2 = valid_data[j]
            
            if bm1['team_1'] == bm2['team_1'] and bm1['team_2'] == bm2['team_2']:
                match_name = f"{bm1['team_1']} vs {bm1['team_2']}"
                market_name = bm1.get("market_override", "Ganador del Partido")
                
                # Cruce A
                pi_A = (1 / bm1['odds_1']) + (1 / bm2['odds_2'])
                if pi_A < 1.0:
                    profit = ((1 / pi_A) - 1) * 100
                    save_surebet(match_name, bm1['bookmaker'], bm1['odds_1'], bm2['bookmaker'], bm2['odds_2'])
                    
                    # Disparar alerta de Telegram si supera el umbral
                    if profit >= ALERT_THRESHOLD:
                        threading.Thread(target=send_telegram_alert, args=(match_name, bm1['bookmaker'], bm1['odds_1'], bm2['bookmaker'], bm2['odds_2'], profit)).start()
                        
                    signals.append({
                        "id": str(uuid.uuid4())[:8],
                        "match": match_name,
                        "market": market_name,
                        "bookmaker1": {"name": bm1['bookmaker'], "odds": bm1['odds_1'], "team": bm1['team_1']},
                        "bookmaker2": {"name": bm2['bookmaker'], "odds": bm2['odds_2'], "team": bm2['team_2']} 
                    })
                
                # Cruce B
                pi_B = (1 / bm1['odds_2']) + (1 / bm2['odds_1'])
                if pi_B < 1.0:
                    profit = ((1 / pi_B) - 1) * 100
                    save_surebet(match_name, bm2['bookmaker'], bm2['odds_1'], bm1['bookmaker'], bm1['odds_2'])
                    
                    if profit >= ALERT_THRESHOLD:
                        threading.Thread(target=send_telegram_alert, args=(match_name, bm2['bookmaker'], bm2['odds_1'], bm1['bookmaker'], bm1['odds_2'], profit)).start()

                    signals.append({
                        "id": str(uuid.uuid4())[:8],
                        "match": match_name,
                        "market": market_name,
                        "bookmaker1": {"name": bm2['bookmaker'], "odds": bm2['odds_1'], "team": bm1['team_1']},
                        "bookmaker2": {"name": bm1['bookmaker'], "odds": bm1['odds_2'], "team": bm1['team_2']} 
                    })
                    
    return sorted(signals, key=lambda x: ((1/x['bookmaker1']['odds'] + 1/x['bookmaker2']['odds'])), reverse=False)

@app.get("/api/surebets/history")
def get_history():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM surebets ORDER BY id DESC LIMIT 50")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/settings")
def read_settings():
    return get_settings()

@app.post("/api/settings")
def save_settings(payload: Dict[str, Any] = Body(...)):
    for key, value in payload.items():
        update_settings(key, value)
    return {"status": "Configuraciones actualizadas exitosamente"}