import os, time, urllib3, requests
urllib3.disable_warnings()  # глушим предупреждения про сертификат Минцифры

TOKEN = os.environ["BOT_TOKEN"]
BASE = "https://platform-api2.max.ru"
S = requests.Session()
S.verify = False  # хакатон-режим; в проде — установленный сертификат Минцифры
S.headers["Authorization"] = TOKEN

def send(chat_id, text):
    S.post(f"{BASE}/messages", params={"chat_id": chat_id}, json={"text": text})

# подсказки команд (необязательно, но красиво)
S.patch(f"{BASE}/me/commands", json={"commands": [
    {"name": "start", "description": "Начать работу"},
    {"name": "help",  "description": "Что умеет бот"},
]})

marker = 0
print("Бот запущен: @t727_hakaton_max_bot")
while True:
    r = S.get(f"{BASE}/updates", params={"marker": marker, "timeout": 30}).json()
    marker = r.get("marker", marker)
    for e in r.get("updates", []):
        if e["update_type"] != "message_created":
            continue
        msg = e["message"]
        text = (msg.get("body") or {}).get("text", "")
        chat = (msg.get("recipient") or {}).get("chat_id") or e.get("chat_id")
        if text == "/start":
            send(chat, "Привет! Я бот команды 727.")
        elif text == "/help":
            send(chat, "Команды: /start, /help. Любое сообщение — эхо.")
        elif not text.startswith("/"):
            send(chat, f"Вы написали: «{text}»")
    time.sleep(0.3)