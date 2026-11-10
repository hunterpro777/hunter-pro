# python_engine/analysis/arbitrage.py
# Analizador matemático para detectar surebets y guardarlas en la base de datos PostgreSQL.
# CAMBIAR ARCHIVO COMPLETO

import psycopg2
from typing import List, Dict

class SurebetAnalyzer:
    def __init__(self, db_connection_string: str):
        self.conn = psycopg2.connect(db_connection_string)
        self.cursor = self.conn.cursor()

    def create_tables(self):
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS surebets (
                id SERIAL PRIMARY KEY,
                event_name VARCHAR(255),
                bookmaker_1 VARCHAR(50),
                odds_1 FLOAT,
                bookmaker_2 VARCHAR(50),
                odds_2 FLOAT,
                total_pi FLOAT,
                profit_percentage FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        self.conn.commit()

    def analyze_and_store(self, match_name: str, odds_data: List[Dict]):
        # odds_data format: [{'bookmaker': 'Betano', 'odds': 1.60}, {'bookmaker': 'Betplay', 'odds': 2.90}]
        pi_sum = sum((1 / data['odds']) for data in odds_data)
        
        if pi_sum < 1.0:
            profit_pct = (1.0 / pi_sum) - 1.0
            self.cursor.execute("""
                INSERT INTO surebets (event_name, bookmaker_1, odds_1, bookmaker_2, odds_2, total_pi, profit_percentage)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                match_name,
                odds_data[0]['bookmaker'], odds_data[0]['odds'],
                odds_data[1]['bookmaker'], odds_data[1]['odds'],
                pi_sum, profit_pct * 100
            ))
            self.conn.commit()
            return True, profit_pct
        return False, 0.0

# Uso:
# analyzer = SurebetAnalyzer("dbname=postgres user=postgres password=secret")
# analyzer.create_tables()
# is_surebet, profit = analyzer.analyze_and_store("Nadal vs Djokovic", [{'bookmaker': 'Betano', 'odds': 1.60}, {'bookmaker': 'Betplay', 'odds': 2.90}])