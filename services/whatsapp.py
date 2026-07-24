import os
import re
import httpx
import asyncio
from dotenv import load_dotenv
from google import genai

load_dotenv(override=True)

WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN")
WHATSAPP_PHONE_ID = os.getenv("WHATSAPP_PHONE_ID")
ADMIN_PHONE_NUMBER = os.getenv("ADMIN_PHONE_NUMBER")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    print(f"🔑 API Key cargada: {GEMINI_API_KEY[:10]}...")
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None

def format_whatsapp_number(phone: str) -> str:
    """
    Sanitiza y formatea un número de teléfono para la API de WhatsApp de Meta.
    - Remueve caracteres no numéricos.
    - Si tiene 10 dígitos, antepone '52'.
    - Si tiene 12 dígitos y empieza con '52', lo mantiene.
    """
    if not phone:
        return ""
    
    # Remover caracteres no numéricos (espacios, guiones, paréntesis, signos +)
    cleaned = re.sub(r'\D', '', str(phone))
    
    # Si tiene 10 dígitos, anteponer el código de país 52
    if len(cleaned) == 10:
        return f"52{cleaned}"
        
    # Si empieza con 52 y tiene 12 dígitos, ya está listo
    if len(cleaned) == 12 and cleaned.startswith("52"):
        return cleaned
        
    return cleaned

async def enviar_alerta_nuevo_lead(customer_name, phone, service_type, zip_code, email=None, project_details=None, source="Web"):
    """
    Envía una notificación automatizada por WhatsApp 
    hacia el administrador del CRM usando la API Cloud de Meta.
    """
    email_text = f"✉️ *Email:* {email}\n" if email else ""
    details_text = f"📝 *Detalles:* {project_details}\n" if project_details else ""
    
    mensaje = (
        f"🚨 *¡Nuevo Lead Recibido!* 🚨\n\n"
        f"👤 *Cliente:* {customer_name}\n"
        f"📞 *Teléfono:* {phone}\n"
        f"{email_text}"
        f"🛠️ *Servicio requerido:* {service_type}\n"
        f"📍 *Código Postal:* {zip_code}\n"
        f"{details_text}\n"
        f"⚡ _Gestionado automáticamente por CreSer CRM_"
    )
    
    print("\n==================================================")
    print("📲 [WHATSAPP SERVICE] Enviando notificación...")
    
    if not all([WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, ADMIN_PHONE_NUMBER]):
        print("❌ Error: Faltan credenciales de WhatsApp en el archivo .env")
        return False
        
    formatted_admin_phone = format_whatsapp_number(ADMIN_PHONE_NUMBER)
    url = f"https://graph.facebook.com/v20.0/{WHATSAPP_PHONE_ID}/messages"
    
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": formatted_admin_phone,
        "type": "template",
        "template": {
            "name": "alerta_nuevo_lead",
            "language": {
                "code": "es_MX"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": str(customer_name)
                        },
                        {
                            "type": "text",
                            "text": str(phone)
                        },
                        {
                            "type": "text",
                            "text": str(email) if email else "No proporcionado"
                        },
                        {
                            "type": "text",
                            "text": str(source)
                        }
                    ]
                }
            ]
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                print("✅ WhatsApp enviado con éxito.")
                print("==================================================\n")
                return True
            else:
                print(f"❌ Error en WhatsApp API (HTTP {response.status_code}): {response.text}")
                print("==================================================\n")
                return False
    except Exception as e:
        print(f"❌ Excepción al conectar con WhatsApp API: {e}")
        print("==================================================\n")
        return False

async def send_client_confirmation(to_phone: str, customer_name: str):
    """
    Envía la plantilla de WhatsApp aprobada (confirmacion_spanish) al cliente.
    """
    url = f"https://graph.facebook.com/v19.0/{WHATSAPP_PHONE_ID}/messages"
    
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    # Limpieza de teléfono y formato internacional (Ejemplo para México)
    numero_limpio = "".join(filter(str.isdigit, str(to_phone)))
    if len(numero_limpio) == 10:
        numero_limpio = f"52{numero_limpio}"

    payload = {
        "messaging_product": "whatsapp",
        "to": numero_limpio,
        "type": "template",
        "template": {
            "name": "confirmacion_spanish",
            "language": {
                "code": "es_MX"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": customer_name
                        }
                    ]
                }
            ]
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        
        if response.status_code not in [200, 201]:
            raise Exception(f"Error en Meta API ({response.status_code}): {response.text}")
        
        print(f"✅ Confirmación de WhatsApp enviada a {customer_name} ({numero_limpio})")
        return response.json()

async def generar_respuesta_ia(user_message: str) -> str:
    """
    Genera una respuesta inteligente utilizando la API de Gemini.
    """
    if not GEMINI_API_KEY:
        return "Lo siento, el asistente de IA no está configurado por el momento."
        
    system_instruction = "Eres un asistente virtual atento y profesional para un negocio de servicios de mantenimiento. Tu objetivo es ayudar a los clientes de forma amable, clara y concisa. Responde siempre en español."
    models_to_try = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash"]
    max_retries_per_model = 2
    
    for model_name in models_to_try:
        for attempt in range(max_retries_per_model):
            try:
                print(f"Intentando generar respuesta con {model_name} (Intento {attempt + 1})...")
                response = client.models.generate_content(
                    model=model_name,
                    contents=user_message,
                    config={"system_instruction": system_instruction}
                )
                
                if response and response.text:
                    return response.text
                    
            except Exception as e:
                print(f"❌ Error con {model_name} (Intento {attempt + 1}): {e}")
                if attempt < max_retries_per_model - 1:
                    await asyncio.sleep(1) # Exponential Backoff / Pausa corta
                
    # Si fallan todos los modelos e intentos
    print("❌ Todos los intentos y modelos fallaron.")
    return "Lo siento, por el momento estoy experimentando dificultades técnicas debido a la alta demanda. Por favor, intenta de nuevo más tarde o comunícate directamente con nosotros por teléfono."

async def send_whatsapp_message(to_phone: str, message: str):
    """
    Envía un mensaje de texto libre a través de la API Graph de Meta (v25.0).
    """
    print(f"PHONE_NUMBER_ID configurado: {bool(WHATSAPP_PHONE_ID)}")
    print(f"WHATSAPP_TOKEN configurado: {bool(WHATSAPP_TOKEN)}")

    url = f"https://graph.facebook.com/v25.0/{WHATSAPP_PHONE_ID}/messages"
    
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_phone,
        "type": "text",
        "text": { "body": message }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            print(f"Respuesta de Meta (HTTP {response.status_code}): {response.text}")

            if response.status_code not in [200, 201]:
                print(f"❌ Error en Meta API al enviar mensaje ({response.status_code}): {response.text}")
            else:
                print(f"✅ Respuesta de IA enviada a {to_phone}")
    except Exception as e:
        print(f"❌ Excepción al enviar mensaje a WhatsApp: {e}")
