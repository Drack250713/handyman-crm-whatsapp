import sqlite3
from database import get_db_connection

def crear_usuario(business_name, professional_type, email, password_hash, role_level=3, created_by_id=None):
    """Registra un nuevo profesional en el sistema. Retorna el ID del usuario."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO users (business_name, professional_type, email, password_hash, role_level, created_by_id)
            VALUES (?, ?, ?, ?, ?, ?);
        ''', (business_name, professional_type, email, password_hash, role_level, created_by_id))
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

from datetime import date

def log_ai_interaction():
    """Incrementa el contador diario de interacciones con IA."""
    conn = get_db_connection()
    cursor = conn.cursor()
    today = date.today().isoformat()
    try:
        cursor.execute('''
            INSERT INTO system_metrics (date, ai_interactions)
            VALUES (?, 1)
            ON CONFLICT(date) DO UPDATE SET ai_interactions = ai_interactions + 1;
        ''', (today,))
        conn.commit()
    except Exception as e:
        print(f"❌ Error al registrar interacción IA: {e}")
    finally:
        conn.close()

def get_dashboard_stats():
    """Obtiene las métricas para el Dashboard Main."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Total leads
        cursor.execute("SELECT COUNT(*) FROM leads")
        total_leads = cursor.fetchone()[0]
        
        # Conversiones
        cursor.execute("SELECT COUNT(*) FROM leads WHERE status = 'Convertido'")
        converted_leads = cursor.fetchone()[0]
        conversion_rate = f"{(converted_leads / total_leads * 100):.1f}%" if total_leads > 0 else "0%"
        
        # Interacciones IA (Total histórico)
        cursor.execute("SELECT SUM(ai_interactions) FROM system_metrics")
        ai_interactions = cursor.fetchone()[0] or 0
        
        # Performance trend (Últimos 7 días)
        cursor.execute('''
            SELECT date(created_at) as d, COUNT(*) 
            FROM leads 
            WHERE created_at >= date('now', '-7 days')
            GROUP BY d ORDER BY d
        ''')
        trend_data = [{"date": row[0], "leads": row[1]} for row in cursor.fetchall()]
        
        # Actividad reciente rápida
        cursor.execute('''
            SELECT customer_name, service_type, status, source, created_at 
            FROM leads 
            ORDER BY created_at DESC LIMIT 5
        ''')
        recent = [{"name": row[0], "service": row[1], "status": row[2], "source": row[3], "date": row[4]} for row in cursor.fetchall()]
        
        return {
            "total_leads": total_leads,
            "ai_interactions": ai_interactions,
            "conversion_rate": conversion_rate,
            "performance_trend": trend_data,
            "recent_activity": recent
        }
    except Exception as e:
        print(f"❌ Error al obtener dashboard stats: {e}")
        return {}
    finally:
        conn.close()

def get_recent_activity():
    """Obtiene el listado detallado de actividad reciente."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            SELECT customer_name, service_type, status, source, created_at, phone, email 
            FROM leads 
            ORDER BY created_at DESC LIMIT 20
        ''')
        activity = [
            {
                "customer": row[0],
                "action": f"Nuevo lead desde {row[3]}",
                "service": row[1],
                "status": row[2],
                "timestamp": row[4],
                "phone": row[5],
                "email": row[6]
            } for row in cursor.fetchall()
        ]
        return activity
    except Exception as e:
        print(f"❌ Error al obtener actividad reciente: {e}")
        return []
    finally:
        conn.close()
