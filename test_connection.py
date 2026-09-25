"""Test script for TigerGraph connection."""

import sys
import os

# Add parent dir to path so we can import backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.tigergraph.connection import get_tg_connection

def test_connection():
    print("Testing connection to TigerGraph...")
    try:
        conn = get_tg_connection()
        if not conn.apiToken:
            raise RuntimeError("TigerGraph returned no API token")

        print("✅ Successfully authenticated!")
        print("\nAttempting to ping graph schema...")
        schema = conn.getSchema()
        print("✅ Successfully retrieved schema!")
        print(f"Vertex types found: {len(schema.get('VertexTypes', []))}")
        print(f"Edge types found: {len(schema.get('EdgeTypes', []))}")

        for v_type in schema.get("VertexTypes", [])[:3]:
            print(f" - {v_type['Name']}")
    except Exception as e:
        print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    test_connection()
