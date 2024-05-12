import aiosqlite
import asyncio

sql_create_users_table = """
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
"""

sql_create_penaltys_table = """
CREATE TABLE penaltys (
  penalty_id INTEGER PRIMARY KEY,
  penalty TEXT NOT NULL,
  description TEXT NOT NULL,
  value INTEGER NOT NULL    
);
"""

sql_create_user_penalty_table = """
CREATE TABLE user_penalty (
  user_penalty_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  penalty_id INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_penaltys
    FOREIGN KEY (penalty_id)
    REFERENCES penaltys(id)
    ON DELETE CASCADE
);
"""

sql_init_users = """
INSERT INTO users (name) VALUES
  ('John'),
  ('Faister'),
  ('Enno'),
  ('Linus'),
  ('Matze'),
  ('Malte'),
  ('Marcel'),
  ('Julian'),
  ('Sidney'); 
"""
# TODO namen adden
sql_init_penaltys = """
INSERT INTO penaltys (penalty_id, penalty, description, value) VALUES
  (1, 'AFK', 'Ohne Ankündigung ungemuted AFK sein', 1),
  (2, 'Dünnschissgelaber', 'Brutales Dünnschissgelaber', 0.5),
  (3, 'Rülpsen/Furzen', 'Hörbares Furzen, Rülpsen', 1),
  (4, 'Sprachfehler', 'Gravierender Sprachfehler (einzigste, als anstatt ständig, besser wie...)', 1),
  (5, 'Hintergrundgeräusch', 'Hintergrundgespräche ohne Muten (TikTok, Reels, Shorts oder andere Störungen)', 1),
  (6, 'Zeitangabe', 'Eigene Zeitangaben nicht einhalten (kann mit Nachricht geändert werden)', 2),
  (7, 'Offline', 'Ohne Tschüss sagen off gehen', 0.5),
  (8, 'Fullmute', 'Ich Channel kommen und nichts sagen oder direkt fullmute', 0.5),
  (9, 'Quitten', 'Games einfach quitten', 1),
  (10, 'Falsches Melden', 'Falsches melden von Straftaten', 2),
  (11, 'Staatsverweigerer', 'Nicht legitimes Bearbeiten von Strafeintragen', 2); 
"""


async def init_database():
    async with aiosqlite.connect("./database.db") as db:
        await db.execute(sql_create_users_table)
        await db.commit()

        await db.execute(sql_create_penaltys_table)
        await db.commit()

        await db.execute(sql_create_user_penalty_table)
        await db.commit()

        await db.execute(sql_init_users)
        await db.commit()

        await db.execute(sql_init_penaltys)
        await db.commit()


asyncio.run(init_database())
