# python_engine/scrapers/rushbet.py
# Scraper Rushbet - Retorna None si falla (Sin Fallback)
# ====================================================================

from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import re

def fetch_rushbet_live_data():
    print("\n[Rushbet] Iniciando extracción de datos...")
    
    with sync_playwright() as p:
    browser = p.chromium.launch(
    headless=True,
    args=[
        "--no-sandbox",
        "--disable-dev-shm-usage", # Evita el colapso de 64MB en Render
        "--disable-gpu",
        "--single-process"
    ]
)
#       browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
        page = context.new_page()
        page.route("**/*", lambda route: route.abort() if route.request.resource_type in ["image", "stylesheet", "font", "media"] else route.continue_())

        try:
            page.goto("https://www.rushbet.co/", wait_until="domcontentloaded", timeout=25000)
            page.wait_for_timeout(3000)
            
            soup = BeautifulSoup(page.content(), 'html.parser')
            teams, odds = [], []
            
            for element in soup.find_all(['div', 'span']):
                text = element.get_text(strip=True)
                if text and ' vs ' in text.lower() and len(text) < 50:
                    parts = text.lower().split(' vs ')
                    if len(parts) == 2:
                        teams = [parts[0].title().strip(), parts[1].title().strip()]
                        break
                        
            for btn in soup.find_all(['button', 'div']):
                text = btn.get_text(strip=True)
                if re.match(r'^\d+\.\d{2}$', text):
                    odds.append(float(text))
                    if len(odds) >= 2:
                        break

            if len(teams) == 2 and len(odds) >= 2:
                return {"bookmaker": "Rushbet", "team_1": teams[0], "odds_1": odds[0], "team_2": teams[1], "odds_2": odds[1]}
            else:
                print("⚠️ [Rushbet] DOM ofuscado. Abortando extracción (Retornando None).")
                return None

        except Exception as e:
            print(f"❌ [Rushbet] Error: {e}")
            return None
        finally:
            browser.close()