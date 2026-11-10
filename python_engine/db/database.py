# python_engine/db/database.py
# Gestor de base de datos local (SQLite) para historial y configuraciones dinámicas.
# ====================================================================

import sqlite3
from datetime import datetime
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "surebets_history.db")

def init_db():
    print("🗄️ [Base de Datos] Inicializando tablas (Historial y Ajustes)...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabla de señales
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS surebets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_name TEXT,
            bookmaker_1 TEXT,
            odds_1 REAL,
            bookmaker_2 TEXT,
            odds_2 REAL,
            total_pi REAL,
            profit_margin REAL,
            created_at TEXT
        )
    ''')
    
    # Nueva tabla para las configuraciones dinámicas del panel Admin
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def save_surebet(match, bm1, odds1, bm2, odds2):
    pi_1 = 1 / odds1
    pi_2 = 1 / odds2
    total_pi = pi_1 + pi_2
    
    if total_pi < 1.0:
        profit_margin = ((1 / total_pi) - 1) * 100
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO surebets (match_name, bookmaker_1, odds_1, bookmaker_2, odds_2, total_pi, profit_margin, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (match, bm1, odds1, bm2, odds2, total_pi, profit_margin, datetime.now().isoformat()))
        conn.commit()
        conn.close()
        print(f"💾 [Base de Datos] Surebet guardada: {match} (+{profit_margin:.2f}%)")

def get_settings():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    rows = cursor.fetchall()
    conn.close()
    return {row[0]: json.loads(row[1]) for row in rows}

def update_settings(key, value):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, json.dumps(value)))
    conn.commit()
    conn.close()