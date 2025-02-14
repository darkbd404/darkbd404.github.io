from telegram import Update
   from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

   # আপনার বট টোকেন এবং চ্যাট আইডি এখানে বসান
   BOT_TOKEN = '7828394833:AAGWXAKToC37qL_Ebh_huR2CA1bzK9H-zzU'
   CHAT_ID = '5916486983'

   # /start কমান্ড হ্যান্ডলার
   def start(update: Update, context: CallbackContext) -> None:
       update.message.reply_text('হ্যালো! আমি আপনার টেলিগ্রাম বট।')

   # মেসেজ হ্যান্ডলার
   def echo(update: Update, context: CallbackContext) -> None:
       user_message = update.message.text
       update.message.reply_text(f'আপনি লিখেছেন: {user_message}')

   def main() -> None:
       # বট ইনিশিয়ালাইজ করুন
       updater = Updater(BOT_TOKEN)

       # ডিসপ্যাচার নিন
       dispatcher = updater.dispatcher

       # কমান্ড এবং মেসেজ হ্যান্ডলার যোগ করুন
       dispatcher.add_handler(CommandHandler("start", start))
       dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, echo))

       # বট শুরু করুন
       updater.start_polling()
       updater.idle()

   if __name__ == '__main__':
       main()
