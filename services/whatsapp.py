import os
import httpx
from dotenv import load_dotenv

load_dotenv()

WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN")
WHATSAPP_PHONE_ID = os.getenv("WHATSAPP_PHONE_ID")
ADMIN_PHONE_NUMBER = os.getenv("ADMIN_PHONE_NUMBER")

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
        
    url = f"https://graph.facebook.com/v20.0/{WHATSAPP_PHONE_ID}/messages"
    
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": ADMIN_PHONE_NUMBER,
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
