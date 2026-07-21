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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
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
    
    conn.commit()
    conn.close()
    print(f" Base de datos inicializada en: {os.path.abspath(DB_NAME)}")

if __name__ == "__main__":
    inicializar_base_de_datos()
