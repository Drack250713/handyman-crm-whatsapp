import sqlite3
from database import get_db_connection

def crear_usuario(business_name, professional_type, email, password_hash):
    """Registra un nuevo profesional en el sistema. Retorna el ID del usuario."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO users (business_name, professional_type, email, password_hash)
            VALUES (?, ?, ?, ?);
        ''', (business_name, professional_type, email, password_hash))
        conn.commit()
        user_id = cursor.lastrowid
        print(f"✔️ Usuario '{business_name}' creado con ID: {user_id}")
        return user_id
    except sqlite3.IntegrityError:
        print(f"❌ Error: El correo electrónico '{email}' ya está registrado.")
        return None
    finally:
        conn.close()

def crear_lead(user_id, customer_name, phone, zip_code, service_type, source, email=None, project_details=None):
    """Inserta un nuevo prospecto proveniente de Web, WhatsApp o Llamada."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO leads (user_id, customer_name, phone, zip_code, service_type, source, email, project_details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        ''', (user_id, customer_name, phone, zip_code, service_type, source, email, project_details))
        conn.commit()
        lead_id = cursor.lastrowid
        print(f"🚨 ¡Nuevo Lead registrado! ID: {lead_id} para Usuario ID: {user_id}")
        return lead_id
    except sqlite3.OperationalError as e:
        print(f"❌ Error al insertar lead: {e}")
        return None
    finally:
        conn.close()
