from flask import Flask, request
import requests

# Flask app initialization
app = Flask(__name__)

# Telegram Bot Token (আপনার দেওয়া টোকেন)
BOT_TOKEN = "7828394833:AAGWXAKToC37qL_Ebh_huR2CA1bzK9H-zzU"
BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

# Webhook endpoint
@app.route('/webhook', methods=['POST'])
def webhook():
    # Get the JSON data from Telegram
    update = request.json
    chat_id = update['message']['chat']['id']
    text = update['message']['text']

    # Simple response logic
    if text == "/start":
        response_text = "Hello! I am your bot. How can I assist you?"
    else:
        response_text = f"You said: {text}"

    # Send the response back to Telegram
    send_message(chat_id, response_text)
    return "OK"

# Function to send message via Telegram API
def send_message(chat_id, text):
    url = f"{BASE_URL}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text
    }
    requests.post(url, json=payload)

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
