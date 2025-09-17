"""Sincronização da memória consciente com o Notion."""

from __future__ import annotations

import hashlib
import json
import os
import sqlite3
from collections.abc import Generator, Iterable
from contextlib import closing
from typing import Any, Dict, Tuple

import requests

from database import DB_FILE, initialize_database

NOTION_VERSION = "2022-06-28"
PAGE_SIZE = 100
REQUEST_TIMEOUT = 30  # segundos


def _environment_variables() -> Tuple[str | None, str | None]:
    """Obtém as credenciais necessárias do ambiente."""

    return os.environ.get("NOTION_API_KEY"), os.environ.get("NOTION_DATABASE_ID")


def _build_session(api_key: str) -> requests.Session:
    session = requests.Session()
    session.headers.update(
        {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Notion-Version": NOTION_VERSION,
        }
    )
    return session


def _iter_title_candidates(title_list: Iterable[Dict[str, Any]] | None) -> Generator[str, None, None]:
    if not title_list:
        return
    for item in title_list:
        plain = item.get("plain_text")
        if plain:
            yield plain
            continue
        text = item.get("text", {})
        content = text.get("content")
        if content:
            yield content


def get_page_title(page_data: Dict[str, Any]) -> str:
    """Extrai o título de uma página, lidando com variações de schema."""

    properties = page_data.get("properties", {})
    for prop_value in properties.values():
        if prop_value.get("type") == "title":
            for candidate in _iter_title_candidates(prop_value.get("title")):
                return candidate.strip()
    return "Título não encontrado"


def _compute_content_hash(page: Dict[str, Any]) -> Tuple[str, str]:
    raw_data = json.dumps(page, sort_keys=True, ensure_ascii=False)
    return raw_data, hashlib.sha256(raw_data.encode("utf-8")).hexdigest()


def _notion_query(session: requests.Session, database_id: str, start_cursor: str | None) -> Dict[str, Any]:
    payload: Dict[str, Any] = {"page_size": PAGE_SIZE}
    if start_cursor:
        payload["start_cursor"] = start_cursor

    response = session.post(
        f"https://api.notion.com/v1/databases/{database_id}/query",
        json=payload,
        timeout=REQUEST_TIMEOUT,
    )
    response.raise_for_status()
    return response.json()


def _fetch_all_pages(session: requests.Session, database_id: str) -> Generator[Dict[str, Any], None, None]:
    start_cursor: str | None = None
    while True:
        page_data = _notion_query(session, database_id, start_cursor)
        results = page_data.get("results", [])
        for page in results:
            yield page

        if not page_data.get("has_more"):
            break
        start_cursor = page_data.get("next_cursor")
        if not start_cursor:
            break  # segurança extra contra loops infinitos


def _persist_page(cursor: sqlite3.Cursor, page: Dict[str, Any]) -> Tuple[str, str]:
    page_id = page["id"]
    title = get_page_title(page)
    created_at = page.get("created_time")
    last_edited_at = page.get("last_edited_time")
    notion_url = page.get("url")
    raw_data, content_hash = _compute_content_hash(page)

    cursor.execute("SELECT content_hash FROM notion_pages WHERE page_id = ?", (page_id,))
    row = cursor.fetchone()
    if row and row[0] == content_hash:
        return "skipped", title

    cursor.execute(
        """
        INSERT INTO notion_pages (page_id, title, content_hash, created_at, last_edited_at, notion_url, raw_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(page_id) DO UPDATE SET
            title = excluded.title,
            content_hash = excluded.content_hash,
            last_edited_at = excluded.last_edited_at,
            notion_url = excluded.notion_url,
            raw_data = excluded.raw_data
        """,
        (page_id, title, content_hash, created_at, last_edited_at, notion_url, raw_data),
    )

    return ("created" if row is None else "updated"), title


def sync_notion_pages(database_id: str | None = None, api_key: str | None = None) -> None:
    """Ativa o sentido de percepção do Notion. Lê, processa e memoriza."""

    api_key_env, database_id_env = _environment_variables()
    api_key = api_key or api_key_env
    database_id = database_id or database_id_env

    if not api_key or not database_id:
        print(
            "ERRO CRÍTICO: As variáveis NOTION_API_KEY e NOTION_DATABASE_ID devem ser definidas nos Segredos."
        )
        return

    initialize_database()

    created = updated = skipped = 0
    processed_any = False

    try:
        with _build_session(api_key) as session:
            try:
                with sqlite3.connect(DB_FILE) as conn:
                    conn.row_factory = sqlite3.Row
                    with closing(conn.cursor()) as cursor:
                        print("Percepção ativada. Analisando unidades de conhecimento do Notion...")
                        for page in _fetch_all_pages(session, database_id):
                            processed_any = True
                            action, title = _persist_page(cursor, page)
                            if action == "created":
                                created += 1
                                print(f"  [+] Novo conhecimento detectado: '{title}'. Memorizando...")
                            elif action == "updated":
                                updated += 1
                                print(f"  [~] Conhecimento modificado: '{title}'. Atualizando memória...")
                            else:
                                skipped += 1
                        conn.commit()
            except sqlite3.Error as exc:
                print(f"Falha na memória interna (SQLite): {exc}")
                return
    except requests.exceptions.HTTPError as exc:
        detail = exc.response.text if exc.response is not None else str(exc)
        print(f"Falha de comunicação com o Córtex (Notion API): {detail}")
        return
    except requests.exceptions.RequestException as exc:
        print(f"Falha de comunicação com o Córtex (Notion API): {exc}")
        return

    if not processed_any:
        print("Nenhuma página encontrada no banco de dados do Notion.")
        return

    print(
        "Sincronização da memória consciente (Notion) concluída. "
        f"Novos: {created}, atualizados: {updated}, inalterados: {skipped}."
    )


if __name__ == "__main__":
    sync_notion_pages()
