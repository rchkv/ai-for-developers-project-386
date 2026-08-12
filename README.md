### Hexlet tests and linter status:
[![Actions Status](https://github.com/rchkv/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/rchkv/ai-for-developers-project-386/actions)

@requirements.md

## Деплой

Приложение задеплоено на Render:
**https://ai-for-developers-project-386-yq3r.onrender.com**

Оно разворачивается как один web-сервис:
корневой `Dockerfile` собирает UI и отдаёт его вместе с API с одного порта.
Конфигурация описана в [`render.yaml`](./render.yaml).

Сразу после первого деплоя маршрутизация Render может несколько минут отдавать
404 с заголовком `x-render-routing: no-server` — это ожидаемо и проходит само,
рестарт сервиса не нужен.

