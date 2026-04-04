import sqlite3
import os

db_path = '../db.sqlite3'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA table_info(UserRegistrations)")
        columns = cursor.fetchall()
        for col in columns:
            print(col)
    except Exception as e:
        print(f"Error: {str(e)}")
    conn.close()
