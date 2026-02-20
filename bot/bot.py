import asyncio
import os

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "")


if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN is not set. Put it into bot/.env")

if not WEBAPP_URL:
    raise RuntimeError("WEBAPP_URL is not set. Put it into bot/.env")


def build_main_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(
                    text="Открыть CashRocket",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        ],
        resize_keyboard=True,
    )


dp = Dispatcher()


@dp.message(CommandStart())
async def start_handler(message: Message) -> None:
    await message.answer(
        "Добро пожаловать в CashRocket. Нажмите кнопку ниже, чтобы открыть мини-приложение.",
        reply_markup=build_main_keyboard(),
    )


@dp.message(F.text == "Открыть CashRocket")
async def open_handler(message: Message) -> None:
    await message.answer("Открываю мини-приложение.", reply_markup=build_main_keyboard())


async def main() -> None:
    bot = Bot(token=BOT_TOKEN)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
