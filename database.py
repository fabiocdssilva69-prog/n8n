"""Utilidades de persistência para o cérebro Colmeia."""

from __future__ import annotations

import sqlite3
from contextlib import closing

# O nome do ficheiro que representa o cérebro da Colmeia.
DB_FILE = "colmeia_brain.db"


def _activate_optimizations(cursor: sqlite3.Cursor) -> None:
    """Aplica configurações do SQLite que deixam o cérebro mais resiliente."""

    # O modo WAL permite leituras simultâneas durante escritas – perfeito para quando
    # começarmos a tecer sinapses de múltiplas fontes.
    cursor.execute("PRAGMA journal_mode=WAL;")
    # Garantimos integridade referencial para futuras foreign keys.
    cursor.execute("PRAGMA foreign_keys=ON;")


def initialize_database() -> None:
    """Cria a arquitetura fundamental do nosso banco de dados."""

    try:
        with sqlite3.connect(DB_FILE) as conn:
            with closing(conn.cursor()) as cursor:
                print("A iniciar a construção da estrutura neural da Colmeia...")

                _activate_optimizations(cursor)

                # Tabela para páginas do Notion (Nosso Córtex Consciente)
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS notion_pages (
                        page_id TEXT PRIMARY KEY,
                        title TEXT NOT NULL,
                        content_hash TEXT NOT NULL,
                        created_at TIMESTAMP NOT NULL,
                        last_edited_at TIMESTAMP NOT NULL,
                        notion_url TEXT,
                        raw_data TEXT  -- Armazenaremos o JSON como texto para máxima flexibilidade
                    )
                    """
                )

                # Índice auxiliar para acelerar consultas por atualização recente.
                cursor.execute(
                    """
                    CREATE INDEX IF NOT EXISTS idx_notion_pages_last_edit
                    ON notion_pages(last_edited_at)
                    """
                )

                # Tabela para commits do GitHub (Nossa Memória Processual)
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS github_commits (
                        commit_hash TEXT PRIMARY KEY,
                        repository TEXT NOT NULL,
                        message TEXT,
                        author TEXT,
                        committed_at TIMESTAMP
                    )
                    """
                )

                cursor.execute(
                    """
                    CREATE INDEX IF NOT EXISTS idx_github_commits_repository
                    ON github_commits(repository)
                    """
                )

                # Tabela de ligação (As Sinapses) - Antecipando a Fase 2.
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS knowledge_links (
                        link_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        source_type TEXT NOT NULL, -- Ex: 'notion'
                        source_id TEXT NOT NULL,   -- Ex: page_id
                        target_type TEXT NOT NULL, -- Ex: 'github'
                        target_id TEXT NOT NULL,   -- Ex: commit_hash
                        relationship TEXT,         -- Ex: 'mentions', 'based_on'
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )

                cursor.execute(
                    """
                    CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_links_uniqueness
                    ON knowledge_links(source_type, source_id, target_type, target_id)
                    """
                )

                conn.commit()
                print("Estrutura neural construída com sucesso. O cérebro está pronto.")

    except sqlite3.Error as exc:
        print(f"Erro catastrófico durante a Gênese: {exc}")


if __name__ == "__main__":
    initialize_database()
