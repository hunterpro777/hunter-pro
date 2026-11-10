# python_engine/scrapers/api_probe.py
# Script para descubrir y capturar las APIs JSON ocultas de las casas de apuestas mediante intercepción de red.
# ====================================================================
# CAMBIAR ARCHIVO COMPLETO

import asyncio
import json
from playwright.async_api import async_playwright

async def intercept_bookmaker_api(url: str, bookmaker_name: str):
    print(f"\n[{bookmaker_name}] Iniciando sonda de intercepción en: {url}")
    
    async with async_playwright() as p:
        # Lanzamos el navegador (puedes poner headless=False si quieres ver cómo navega)
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        captured_endpoints = []

        # Interceptamos todas las respuestas de red
        async def handle_response(response):
            # Nos interesan las peticiones que devuelven JSON y son exitosas
            if response.status == 200 and "application/json" in response.headers.get("content-type", ""):
                try:
                    # Filtramos ignorando analíticas y rastreadores comunes
                    if any(x in response.url for x in ["google", "facebook", "analytics", "tracking"]):
                        return

                    # Leemos el cuerpo del JSON
                    data = await response.json()
                    data_str = json.dumps(data).lower()
                    
                    # Buscamos palabras clave de apuestas en el JSON para confirmar que es el feed de datos
                    if any(keyword in data_str for keyword in ["odds", "cuota", "market", "competitions", "events"]):
                        print(f"✅ [API DETECTADA] URL: {response.url.split('?')[0]}")
                        captured_endpoints.append({
                            "url": response.url,
                            "sample_data": data
                        })
                except Exception:
                    pass

        # Conectamos el listener a la página
        page.on("response", handle_response)

        try:
            print("Navegando y esperando que carguen los datos dinámicos...")
            # waitUntil="networkidle" espera a que dejen de haber peticiones de red por 500ms
            await page.goto(url, wait_until="networkidle", timeout=60000)
        except Exception as e:
            print(f"Aviso de navegación (normal por bloqueos parciales): {e}")

        await browser.close()
        
        # Guardamos los resultados en un archivo para analizarlos luego
        if captured_endpoints:
            filename = f"{bookmaker_name.lower()}_api_dump.json"
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(captured_endpoints, f, indent=4, ensure_ascii=False)
            print(f"\n🎉 ¡Éxito! Se detectaron {len(captured_endpoints)} endpoints clave.")
            print(f"Los datos crudos se han guardado en: python_engine/scrapers/{filename}")
        else:
            print("\n❌ No se detectaron JSONs con cuotas. Es posible que usen WebSockets o ofuscación severa.")

async def main():
    # Probaremos con Wplay como primer objetivo real
    await intercept_bookmaker_api("https://www.wplay.co/apuestas/inicio", "Wplay")

if __name__ == "__main__":
    asyncio.run(main())