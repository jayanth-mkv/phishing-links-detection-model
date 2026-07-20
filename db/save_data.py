from pathlib import Path
import sqlite3

import pandas as pd

from feature import FeatureExtraction


DATABASE_PATH = Path(__file__).resolve().parents[1] / "database.db"


def save_data(url, label):
    with sqlite3.connect(DATABASE_PATH) as connection:
        cursor = connection.cursor()
        cursor.execute("SELECT 1 FROM urls WHERE url = ?", (url,))
        if cursor.fetchone() is not None:
            return {"message": "URL already exists in the database"}

        features = FeatureExtraction(url).getFeaturesList()
        features.append(label)
        frame = pd.read_sql_query("SELECT * FROM phishing", connection)
        features.insert(0, frame.shape[0] + 1)
        cursor.execute(
            "INSERT INTO phishing VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            features,
        )
        cursor.execute("INSERT INTO urls (url) VALUES (?)", (url,))

    return {"message": "Data added successfully"}
