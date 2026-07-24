import sqlite3
import os

DB_NAME = "creser_crm.db"

def get_db_connection():
    """Establece una conexión segura con soporte para llaves foráneas."""
    conn = sqlite3.connect(DB_NAME)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def inicializar_base_de_datos():
    """Crea las tablas esenciales del sistema si no existen."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Tabla de Usuarios (El Handyman actual y futuros clientes)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        business_name TEXT NOT NULL,
        professional_type TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role_level INTEGER DEFAULT 3,
        must_change_password BOOLEAN DEFAULT 1,
        created_by_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by_id) REFERENCES users(id)
    );
    """)
    
    # Migraciones para la tabla users (nuevos campos)
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN role_level INTEGER DEFAULT 3;")
    except sqlite3.OperationalError:
        pass
        
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT 1;")
    except sqlite3.OperationalError:
        pass
        
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN created_by_id INTEGER;")
    except sqlite3.OperationalError:
        pass
    
    # 2. Tabla de Leads (Web, WhatsApp y Llamadas)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        service_type TEXT NOT NULL,
        email TEXT,
        project_details TEXT,
        source TEXT CHECK(source IN ('web', 'whatsapp', 'call')) NOT NULL,
        status TEXT CHECK(status IN ('Nuevo', 'Contactado', 'Cotizado', 'Convertido', 'Perdido')) DEFAULT 'Nuevo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)
    
    # Migración básica para bases de datos existentes
    try:
        cursor.execute("ALTER TABLE leads ADD COLUMN email TEXT;")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE leads ADD COLUMN project_details TEXT;")
    except sqlite3.OperationalError:
        pass
    
    # 3. Tabla de Notas (Historial de seguimiento del Handyman)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS lead_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER NOT NULL,
        note_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );
    """)
    
    # 4. Tabla de Solicitudes de Recuperación de Contraseña
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS password_reset_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        status TEXT CHECK(status IN ('PENDING', 'ASSIGNED', 'RESOLVED', 'REJECTED')) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 5. Tabla de Permisos de Acceso de Soporte (SuperAdmin a cuenta de usuario)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS support_access_grants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        granted_by_id INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (granted_by_id) REFERENCES users(id)
    );
    """)

    # 6. Tabla de Métricas del Sistema (Totales)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE UNIQUE NOT NULL,
        total_leads INTEGER DEFAULT 0,
        ai_interactions INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    conn.commit()
    conn.close()
    print(f" Base de datos inicializada en: {os.path.abspath(DB_NAME)}")

if __name__ == "__main__":
    inicializar_base_de_datos()
