# NextAct Ecom Frontend

React + Vite frontend for the Laravel JWT authentication API in `../NextAct-Ecom`.

## Auth API

The app uses these backend routes:

- `POST /api/register`
- `POST /api/login`
- `GET /api/me`
- `POST /api/logout`
- `PUT /api/profile`
- `PUT /api/password`
- `POST /api/refresh`

Tokens are stored in `localStorage` and sent as `Authorization: Bearer <token>`.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The default API base URL is:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

Start the Laravel backend from `../NextAct-Ecom` first, usually with:

```bash
php artisan serve
```
