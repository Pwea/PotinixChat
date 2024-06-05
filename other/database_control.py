import asyncio
import websockets
import sqlite3
import ast
import json

users = {}

with open('users.json') as f:
    users = json.load(f)

databaseName = "/Users/33782/Desktop/myappdatabase/database.db"

# Connect to the database
conn = sqlite3.connect(databaseName)
cursor = conn.cursor()

print("Started Server!")

cursor.execute("""
CREATE TABLE IF NOT EXISTS channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(50) NOT NULL
);
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS message_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER,
  user VARCHAR(50) NOT NULL,
  text VARCHAR(255) NOT NULL,
  time VARCHAR(50) NOT NULL,
  FOREIGN KEY (channel_id) REFERENCES channels(id)
);
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) NOT NULL,
  online INT NOT NULL,
  ranks VARCHAR(255) NOT NULL,
  joined_time VARCHAR(50) NOT NULL
);
""")

# Commit the changes
conn.commit()

print("Ready to receive commands!")

def add_user(username, online, ranks, joined_time):
    cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
    if cursor.fetchone() is None:
        cursor.execute("INSERT INTO users (username, online, ranks, joined_time) VALUES (?, ?, ?, ?)", (username, online, ranks, joined_time))
        conn.commit()
    else:
        print("User with the same username already exists!")

for key, value in users.items():
    add_user(key, 1, "", "07/06/24")

def update_user(username, parameter, new_value):
    cursor.execute("UPDATE users SET {} = ? WHERE username = ?".format(parameter), (new_value, username))
    conn.commit()

update_user("Potinix", "online", 1)

def get_users():
    cursor.execute("SELECT username, online, ranks, joined_time FROM users")
    users = ["get_users"]
    for row in cursor.fetchall():
        users.append([row[0], row[1], row[2], row[3]])
    return users


def add_channel(channel_name):
    cursor.execute("SELECT 1 FROM channels WHERE name = ?", (channel_name,))
    if cursor.fetchone() is None:
        cursor.execute("INSERT INTO channels (id, name) VALUES (NULL, ?)", (channel_name,))
        conn.commit()
    else:
        print("Channel with the same name already exists!")

# Function to add a message
def add_message(channel_id, user, text, time):
    cursor.execute("INSERT INTO message_details (id, channel_id, user, text, time) VALUES (NULL, ?, ?, ?, ?)", (channel_id, user, text, time))
    conn.commit()

# Function to retrieve channels
def get_channels():
    cursor.execute("SELECT name FROM channels")
    channels = ["get_channels"]
    for row in cursor.fetchall():
        channels.append(row[0])
    return channels

# Function to retrieve messages for a specific channel
def get_messages(channel_id: str):
    cursor.execute("SELECT user, text, time FROM message_details WHERE channel_id = ?", (channel_id,))
    messages = ["get_messages"]
    for row in cursor.fetchall():
        messages.append([row[0], row[1], row[2]])
    return messages

async def decide_action(websocket, path):
    print("Connected!")
    
    while True:
        try:
            print("Waiting for data...")
            data = await websocket.recv()
            data = ast.literal_eval(data)
            print("Received data:", data)
            
            if data[0] == "add_message":
                print("Registered message to the database!")
                add_message(data[1], data[2], data[3], data[4])
                await websocket.send(f"['get_messages', {str(get_messages(data[1])[1:])[1:-1]}]")

            if data[0] == "add_user":
                print("Registered user to the database!")
                add_user(data[1], data[2], data[3], data[4])
                await websocket.send("['get_users']")

            if data[0] == "add_channel":
                print("Registered channel to the database!")
                add_channel(data[1])
            
            if data[0] == "get_essentials":
                print("Received get essentials!")
                currentUser = "Found None"
                for index, (key, value) in enumerate(users.items()):
                    if value == data[2]:
                        currentUser = index
                
                await websocket.send(str(["get_essentials", get_users()[1:] or [[]], get_messages(data[1])[1:] or [], currentUser]))
                print("Sent essentials successfully.")
                
            if data[0] == "get_messages":
                print("Received request for get_messages.")
                await websocket.send(str(get_messages(data[1])))
                
            if data[0] == "get_users":
                print("Received request for get_users.")
                await websocket.send(str(get_users()))
                
            if data[0] == "close_database":
                # Close the connection
                conn.close()
                break
        except websockets.exceptions.ConnectionClosed:
            print("Connection closed. Quitting.")
            break

start_server = websockets.serve(decide_action, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()