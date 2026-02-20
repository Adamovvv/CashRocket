# CashRocket Telegram Mini App

Telegram bot on Python + Telegram Mini App on React.

## Structure

- `bot/` - Telegram bot (`aiogram`)
- `webapp/` - React mini app (Vite)

## 1) Mini app (React)

```bash
cd webapp
npm install
npm run dev
```

Build:

```bash
npm run build
```

## 2) Telegram bot (Python)

```bash
cd bot
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Fill `.env`:

- `BOT_TOKEN` - Telegram bot token
- `WEBAPP_URL` - public URL of deployed mini app

Run bot:

```bash
python bot.py
```

## 3) Deploy webapp to GitHub Pages

```bash
cd webapp
npm install
npm run deploy
```

For Telegram mini app to open correctly, set bot `WEBAPP_URL` to:

`https://adamovvv.github.io/CashRocket/`
