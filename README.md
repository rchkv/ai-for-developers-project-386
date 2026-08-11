### Hexlet tests and linter status:
[![Actions Status](https://github.com/rchkv/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/rchkv/ai-for-developers-project-386/actions)

@requirements.md

## Деплой

Приложение разворачивается на [Render](https://render.com) как один web-сервис:
корневой `Dockerfile` собирает UI и отдаёт его вместе с API с одного порта.
Конфигурация описана в [`render.yaml`](./render.yaml).

Как задеплоить:

1. Откройте https://dashboard.render.com/blueprints → **New Blueprint Instance**.
2. Выберите этот репозиторий и ветку `main`, нажмите **Apply** — все параметры
   сервиса подтянутся из `render.yaml`.

Дальше каждый коммит в `main` деплоится автоматически.

### Ограничения бесплатного плана

- Сервис засыпает после ~15 минут простоя; первый запрос после сна выполняется
  ~50 секунд.
- Данные хранятся в памяти процесса (`backend/src/store.js`), поэтому созданные
  события и брони теряются при каждом рестарте, деплое и засыпании сервиса.
  Это демо-стенд, а не хранилище с персистентностью.
