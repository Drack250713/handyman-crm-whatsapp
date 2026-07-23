import os
import re
import httpx
from dotenv import load_dotenv

load_dotenv()

WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN")
WHATSAPP_PHONE_ID = os.getenv("WHATSAPP_PHONE_ID")
ADMIN_PHONE_NUMBER = os.getenv("ADMIN_PHONE_NUMBER")

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
    Envía una confirmación automática al cliente.
    """
    print("\n==================================================")
    print(f"📲 [WHATSAPP SERVICE] Enviando confirmación al cliente {customer_name} ({to_phone})...")
    
    if not all([WHATSAPP_TOKEN, WHATSAPP_PHONE_ID]):
        print("❌ Error: Faltan credenciales de WhatsApp en el archivo .env")
        return False
        
    formatted_client_phone = format_whatsapp_number(to_phone)
    url = f"https://graph.facebook.com/v20.0/{WHATSAPP_PHONE_ID}/messages"
    
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": formatted_client_phone,
        "type": "template",
        "template": {
            "name": "hello_world",
            "language": {
                "code": "en_US"
            }
            # Se comentan los componentes porque hello_world no acepta variables
            # "components": [
            #     {
            #         "type": "body",
            #         "parameters": [
            #             {
            #                 "type": "text",
            #                 "text": str(customer_name)
            #             }
            #         ]
            #     }
            # ]
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                print("✅ WhatsApp (confirmación) enviado con éxito al cliente.")
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
