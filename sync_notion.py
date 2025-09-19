import os
import requests
import sqlite3
import json
import hashlib
from database import DB_FILE, initialize_database

# Carregar as credenciais de forma segura
NOTION_API_KEY = os.environ.get('NOTION_API_KEY')
NOTION_DATABASE_ID = os.environ.get('NOTION_DATABASE_ID')

NOTION_API_URL = f"https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}/query"

def get_page_title(page_data):
    """Extrai o título de uma página, lidando com possíveis variações de schema."""
    properties = page_data.get('properties', {})
    for prop_name, prop_value in properties.items():
        if prop_value.get('type') == 'title':
            title_list = prop_value.get('title')
            if title_list:
                return title_list[0].get('text', {}).get('content')
    return "Título não encontrado"

def sync_notion_pages():
    """
    Ativa o sentido de percepção do Notion. Lê, processa e memoriza.
    """
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        print("ERRO CRÍTICO: As variáveis NOTION_API_KEY e NOTION_DATABASE_ID devem ser definidas nos Segredos.")
        return

    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    payload = {"page_size": 100}
    
    try:
        response = requests.post(NOTION_API_URL, headers=headers, json=payload)
        response.raise_for_status() # Lança um erro para respostas HTTP > 400
        data = response.json()
        
        pages = data.get('results', [])
        if not pages:
            print("Nenhuma página encontrada no banco de dados do Notion.")
            return

        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        print(f"Percepção ativada. Analisando {len(pages)} unidades de conhecimento do Notion...")
        
        for page in pages:
            page_id = page['id']
            title = get_page_title(page)
            created_at = page['created_time']
            last_edited_at = page['last_edited_time']
            notion_url = page['url']
            
            # Usamos o JSON completo para criar um hash robusto que detecta qualquer mudança.
            raw_data_str = json.dumps(page, sort_keys=True)
            content_hash = hashlib.sha256(raw_data_str.encode()).hexdigest()
            
            cursor.execute("SELECT content_hash FROM notion_pages WHERE page_id = ?", (page_id,))
            result = cursor.fetchone()
            
            if result is None:
                print(f"  [+] Novo conhecimento detectado: '{title}'. Memorizando...")
                cursor.execute(
                    """
                    INSERT INTO notion_pages (page_id, title, content_hash, created_at, last_edited_at, notion_url, raw_data)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (page_id, title, content_hash, created_at, last_edited_at, notion_url, raw_data_str)
                )
            elif result[0] != content_hash:
                print(f"  [~] Conhecimento modificado: '{title}'. Atualizando memória...")
                cursor.execute(
                    """
                    UPDATE notion_pages
                    SET title = ?, content_hash = ?, last_edited_at = ?, raw_data = ?
                    WHERE page_id = ?
                    """,
                    (title, content_hash, last_edited_at, raw_data_str, page_id)
                )
        
        conn.commit()
        conn.close()
        print("Sincronização da memória consciente (Notion) concluída.")

    except requests.exceptions.RequestException as e:
        print(f"Falha de comunicação com o Córtex (Notion API): {e}")
    except sqlite3.Error as e:
        print(f"Falha na memória interna (SQLite): {e}")

if __name__ == '__main__':
    # Garante que a estrutura do cérebro existe antes de tentar usá-la.
    initialize_database()
    sync_notion_pages()
