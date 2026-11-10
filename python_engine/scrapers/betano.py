# python_engine/scrapers/betano.py
# Scraper Avanzado para Betano con bloqueo de recursos pesados.
# ====================================================================

from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import re

def fetch_betano_live_data():
    print("\n[Betano] Iniciando extracción REAL ultrarrápida...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
        page = context.new_page()

        # Bloquear carga multimedia para máxima velocidad
        page.route("**/*", lambda route: route.abort() if route.request.resource_type in ["image", "stylesheet", "font", "media"] else route.continue_())

        try:
            page.goto("https://www.betano.co/", wait_until="domcontentloaded", timeout=25000)
            page.wait_for_timeout(3000)
            
            soup = BeautifulSoup(page.content(), 'html.parser')
            
            for el in soup.find_all(['div', 'span']):
                texto = el.get_text(separator=' ', strip=True)
                if len(texto) > 5 and len(texto) < 60 and ' - ' in texto:
                    parts = texto.split(' - ')
                    if len(parts) == 2:
                        team1, team2 = parts[0].strip(), parts[1].strip()
                        
                        parent = el.find_parent('div')
                        if parent:
                            cuotas = []
                            for btn in parent.find_all(['button', 'span']):
                                btn_text = btn.get_text(strip=True)
                                if re.match(r'^\d+\.\d{2}$', btn_text):
                                    cuotas.append(float(btn_text))
                            
                            if len(cuotas) >= 2:
                                print(f"✅ [Betano] PARTIDO REAL OBTENIDO: {team1} vs {team2} | {cuotas[0]} - {cuotas[1]}")
                                return {
                                    "bookmaker": "Betano",
                                    "team_1": team1,
                                    "odds_1": cuotas[0],
                                    "team_2": team2,
                                    "odds_2": cuotas[1]
                                }
                                
            print("⚠️ [Betano] No se encontraron partidos reales.")
            return None

        except Exception as e:
            print(f"❌ [Betano] Error en extracción: {e}")
            return None
        finally:
            browser.close()