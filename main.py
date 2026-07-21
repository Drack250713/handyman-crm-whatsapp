import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import crud
from database import inicializar_base_de_datos
from services.whatsapp import enviar_alerta_nuevo_lead

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
    
    # Disparar la notificación automatizada de WhatsApp
    await enviar_alerta_nuevo_lead(
        customer_name=lead.customer_name,
        phone=lead.phone,
        service_type=lead.service_type,
        zip_code=lead.zip_code,
        email=lead.email,
        project_details=lead.project_details
    )
        
    return {"status": "success", "message": "Lead registrado con éxito", "lead_id": lead_id}