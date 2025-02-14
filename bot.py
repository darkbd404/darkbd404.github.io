import os
import requests
from bs4 import BeautifulSoup
from telegram import Update, InputMediaPhoto
from telegram.ext import Updater, CommandHandler, CallbackContext

# Telegram Bot API Token
BOT_TOKEN = "7828394833:AAGWXAKToC37qL_Ebh_huR2CA1bzK9H-zzU"

# Google Image Search URL
GOOGLE_IMAGE_SEARCH_URL = "https://www.google.com/search?hl=en&tbm=isch&q={query}&imgsz=xxlarge"

# Function to send a message
def send_message(chat_id, text, context):
    context.bot.send_message(chat_id=chat_id, text=text)

# Function to send images in a grid
def send_image_grid(chat_id, photos, context):
    media_group = [InputMediaPhoto(media=photo) for photo in photos]
    context.bot.send_media_group(chat_id=chat_id, media=media_group)
    send_message(chat_id, "এখানে আপনার ছবি:", context)

# Function to handle the /goggle command
def goggle_command(update: Update, context: CallbackContext):
    message = update.message.text
    chat_id = update.message.chat_id

    # Extract the search term from the message
    search_term = message[len("/goggle "):].strip()

    if search_term:
        # Perform Google Image Search
        url = GOOGLE_IMAGE_SEARCH_URL.format(query=search_term)
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
        }
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            # Parse the HTML to extract image URLs
            soup = BeautifulSoup(response.text, "html.parser")
            images = soup.find_all("img")
            image_urls = [img["src"] for img in images if img.get("src")]

            # Send the first 6 images
            if image_urls:
                send_image_grid(chat_id, image_urls[:6], context)
            else:
                send_message(chat_id, "দুঃখিত, গুগল থেকে ছবি পাওয়া যায়নি।", context)
        else:
            send_message(chat_id, "দুঃখিত, গুগল থেকে ছবি পাওয়া যায়নি।", context)
    else:
        send_message(chat_id, "দয়া করে '/goggle [যে কোন ছবির নাম]' দিয়ে ছবি সার্চ করুন।", context)

# Main function to start the bot
def main():
    updater = Updater(BOT_TOKEN, use_context=True)
    dp = updater.dispatcher

    # Add command handler for /goggle
    dp.add_handler(CommandHandler("goggle", goggle_command))

    # Start the bot
    updater.start_polling()
    updater.idle()

if __name__ == "__main__":
    main()
# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
