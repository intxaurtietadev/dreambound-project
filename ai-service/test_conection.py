# dreambound-project-main/ai-service/test_connection.py

import requests
import os
import urllib3
from dotenv import load_dotenv

# Desactivar warnings de conexión insegura (solo si probamos verify=False)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

print("--- Iniciando prueba de conexión a Hugging Face ---")
load_dotenv() # Carga el .env

token = os.getenv("HUGGING_FACE_TOKEN")
headers = {}
if token:
    headers = {"Authorization": f"Bearer {token}"}
    print("Token de Hugging Face encontrado en .env y será usado.")
else:
    print("ADVERTENCIA: No se encontró HUGGING_FACE_TOKEN en .env para la prueba de requests.")

# La URL que estaba fallando
url = "https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2/resolve/main/config.json"
print(f"Intentando conectar a: {url}")

try:
    # Intento 1: Con verificación SSL (normal)
    print("\nIntentando conexión CON verificación SSL (verify=True)...")
    # Aumentamos el timeout por si la red es lenta
    response = requests.get(url, headers=headers, timeout=30, verify=True)
    response.raise_for_status() # Lanza un error si el código HTTP no es 2xx (4xx o 5xx)
    print(f"-> CONEXIÓN EXITOSA (verify=True): Código {response.status_code}")
    # print("Contenido recibido:", response.text[:100] + "...") # Muestra un poco del contenido

except requests.exceptions.SSLError as ssl_err:
    print(f"-> ERROR: Falló la verificación SSL: {ssl_err}")
    print("\nIntentando conexión SIN verificación SSL (verify=False)... ¡INSEGURO - SOLO PARA DIAGNÓSTICO!")
    try:
        # Intento 2: Sin verificación SSL (¡OJO! No hacer esto en producción)
        response_no_verify = requests.get(url, headers=headers, timeout=30, verify=False)
        response_no_verify.raise_for_status()
        print(f"-> CONEXIÓN EXITOSA (verify=False): Código {response_no_verify.status_code}")
        # print("Contenido recibido:", response_no_verify.text[:100] + "...")
        print("----> CONCLUSIÓN: El problema parece estar relacionado con los certificados SSL de tu sistema/entorno Python.")

    except Exception as e_no_verify:
        print(f"-> ERROR: Conexión SIN verificación SSL también falló: {e_no_verify}")
        print("----> CONCLUSIÓN: El problema NO es solo SSL. Probablemente firewall, proxy o bloqueo de red.")

except requests.exceptions.Timeout:
    print("-> ERROR: La conexión tardó demasiado (Timeout). Verifica la velocidad/estabilidad de tu red o si hay bloqueos.")

except requests.exceptions.ConnectionError as conn_err:
    print(f"-> ERROR: No se pudo establecer conexión: {conn_err}")
    print("----> CONCLUSIÓN: Problema de red fundamental. Verifica conexión, DNS, firewall, proxy.")

except requests.exceptions.RequestException as req_err:
    # Captura otros errores de requests, como 403 Forbidden si el token es inválido o no tienes acceso (aunque Mistral no debería dar 403)
    print(f"-> ERROR: Ocurrió un error durante la solicitud: {req_err}")
    if req_err.response is not None:
        print(f"  Código de estado HTTP: {req_err.response.status_code}")
        print(f"  Respuesta del servidor: {req_err.response.text[:200]}...") # Muestra parte de la respuesta de error
    print("----> CONCLUSIÓN: Revisa el código de estado y la respuesta. Podría ser un problema de red, autenticación o del servidor remoto.")

except Exception as e:
    print(f"-> ERROR: Ocurrió un error inesperado: {e}")

print("\n--- Prueba de conexión finalizada ---")