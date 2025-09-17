import sqlite3

# O nome do ficheiro que representa o cérebro da Colmeia.
DB_FILE = "colmeia_brain.db"

def initialize_database():
    """
    Cria a arquitetura fundamental do nosso banco de dados.
    Esta função é a planta do nosso hipocampo neural.
    """
    conn = None
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        print("A iniciar a construção da estrutura neural da Colmeia...")

        # Tabela para páginas do Notion (Nosso Córtex Consciente)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notion_pages (
            page_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content_hash TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL,
            last_edited_at TIMESTAMP NOT NULL,
            notion_url TEXT,
            raw_data TEXT  -- Armazenaremos o JSON como texto para máxima flexibilidade
        )
        """)
        
        # Tabela para commits do GitHub (Nossa Memória Processual)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS github_commits (
            commit_hash TEXT PRIMARY KEY,
            repository TEXT NOT NULL,
            message TEXT,
            author TEXT,
            committed_at TIMESTAMP
        )
        """)

        # Tabela de ligação (As Sinapses) - Antecipando a Fase 2
        # Relaciona o conhecimento entre domínios diferentes.
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS knowledge_links (
            link_id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_type TEXT NOT NULL, -- Ex: 'notion'
            source_id TEXT NOT NULL,   -- Ex: page_id
            target_type TEXT NOT NULL, -- Ex: 'github'
            target_id TEXT NOT NULL,   -- Ex: commit_hash
            relationship TEXT,         -- Ex: 'mentions', 'based_on'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        conn.commit()
        print("Estrutura neural construída com sucesso. O cérebro está pronto.")

    except sqlite3.Error as e:
        print(f"Erro catastrófico durante a Gênese: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    initialize_database()
