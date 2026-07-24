import os
import json
from fastapi import FastAPI, HTTPException, Request, Response, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import crud
from database import inicializar_base_de_datos
from services.whatsapp import (
    enviar_alerta_nuevo_lead,
    send_client_confirmation,
    generar_respuesta_ia,
    send_whatsapp_message
)

app = FastAPI(title="Handyman CRM API")

# Configuración de CORS para permitir conexiones desde el Frontend
origins = [
    "http://localhost",
    "http://127.0.0.1",
    # Si Stitch levanta un servidor local en un puerto específico (ej. :5500 o :3000), 
    # o cuando uses live server, FastAPI no lo bloqueará gracias a esta directiva:
    "*", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("images"):
    os.makedirs("images")
app.mount("/images", StaticFiles(directory="images"), name="images")

@app.on_event("startup")
def startup_db():
    inicializar_base_de_datos()

class LeadWeb(BaseModel):
    user_id: int
    customer_name: str
    phone: str
    zip_code: str
    service_type: str
    email: Optional[str] = None
    project_details: Optional[str] = None

@app.get("/")
def inicio():
    return {"mensaje": "API de Handyman CRM operando correctamente"}

@app.post("/api/leads/web")
async def recibir_lead_web(lead: LeadWeb):
    lead_id = crud.crear_lead(
        user_id=lead.user_id,
        customer_name=lead.customer_name,
        phone=lead.phone,
        zip_code=lead.zip_code,
        service_type=lead.service_type,
        source="web",
        email=lead.email,
        project_details=lead.project_details
    )
    
    if not lead_id:
        raise HTTPException(status_code=500, detail="Error interno al registrar el lead.")
    
    # 1. Disparar alerta de WhatsApp al admin (Protegida con try/except)
    try:
        await enviar_alerta_nuevo_lead(
            customer_name=lead.customer_name,
            phone=lead.phone,
            service_type=lead.service_type,
            zip_code=lead.zip_code,
            email=lead.email,
            project_details=lead.project_details
        )
    except Exception as e:
        print(f"⚠️ Warning: Error al enviar alerta de WhatsApp al admin: {e}")
    
    # 2. Intentar enviar la confirmación al cliente por WhatsApp
    try:
        await send_client_confirmation(
            to_phone=lead.phone,
            customer_name=lead.customer_name
        )
    except Exception as e:
        print(f"⚠️ Warning: No se pudo enviar WhatsApp al cliente (Plantilla en revisión): {e}")
        
    # Responder SIEMPRE con éxito al frontend si el lead se guardó en BD
    return {"status": "success", "message": "Lead registrado exitosamente", "lead_id": lead_id}

@app.get("/api/whatsapp/webhook")
async def verify_webhook(request: Request):
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == "handyman_secret_token_2026":
        print("✅ Webhook de WhatsApp verificado con éxito por Meta.")
        return Response(content=challenge, media_type="text/plain")
    
    raise HTTPException(status_code=403, detail="Verification failed")

async def procesar_y_responder_whatsapp(wa_id: str, user_message: str):
    print("2. Generando respuesta de IA...")
    ai_response_text = await generar_respuesta_ia(user_message)
    
    # Registrar interacción IA para las métricas del dashboard
    crud.log_ai_interaction()
    
    print("3. Intentando enviar a Meta Graph para el número:", wa_id)
    await send_whatsapp_message(to_phone=wa_id, message=ai_response_text)

@app.post("/api/whatsapp/webhook")
async def receive_whatsapp_message(request: Request, background_tasks: BackgroundTasks):
    try:
        raw_body = await request.body()
        body_str = raw_body.decode("utf-8", errors="replace")
        body = json.loads(body_str)
        print("📩 Mensaje recibido de WhatsApp:", body)
        
        # 1. Extraer wa_id y user_message
        entry = body.get("entry", [])[0]
        changes = entry.get("changes", [])[0]
        value = changes.get("value", {})
        
        if "messages" in value:
            message_info = value["messages"][0]
            wa_id = message_info.get("from")
            
            if message_info.get("type") == "text":
                user_message = message_info["text"]["body"]
                print("1. Procesando texto entrante:", user_message)
                
                # Delegar a una tarea en segundo plano para evitar timeouts 524
                background_tasks.add_task(procesar_y_responder_whatsapp, wa_id, user_message)
                
    except Exception as e:
        print(f"❌ Error procesando el webhook de WhatsApp: {e}")

    return {"status": "ok"}

@app.get("/api/admin/dashboard/stats")
def dashboard_stats():
    """Retorna las estadísticas para el dashboard principal."""
    stats = crud.get_dashboard_stats()
    return stats

@app.get("/api/admin/dashboard/activity")
def dashboard_activity():
    """Retorna la actividad reciente para el dashboard."""
    activity = crud.get_recent_activity()
    return activity