# ИнфХелпер

Небольшой сайт на Flask для подготовки к ЕГЭ по информатике.

## Локальный запуск

```powershell
cd "c:\GOG Games"
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Откройте в браузере адрес, который покажет Flask (обычно http://127.0.0.1:5000).

## Вариант 1: сайт на GitHub Pages (бесплатно, без сервера)

На GitHub **нельзя** запускать Python в браузере для посетителей, поэтому в репозитории настроена **статическая сборка**: команда `python freeze.py` генерирует каталог `build/`, а workflow выкладывает его на Pages.

1. Установите [Git](https://git-scm.com/download/win), если его ещё нет.
2. Создайте новый репозиторий на [GitHub](https://github.com/new) (можно пустой, без README).
3. В папке проекта выполните (подставьте свой URL репозитория):

   ```powershell
   cd "c:\GOG Games"
   git init
   git add .
   git commit -m "Initial commit: ИнфХелпер"
   git branch -M main
   git remote add origin https://github.com/ВАШ_ЛОГИН/ИМЯ_РЕПО.git
   git push -u origin main
   ```

4. На GitHub откройте репозиторий → **Settings** → **Pages**.
5. В **Build and deployment** для **Source** выберите **GitHub Actions**.
6. После следующего push в ветку `main` запустится workflow **Deploy GitHub Pages**. Через минуту-две сайт будет по адресу:

   `https://ВАШ_ЛОГИН.github.io/ИМЯ_РЕПО/`

Проверка ответов в практике работает в браузере (JSON с ответами лежит в `static/data/practice.json`).

## Вариант 2: полный Flask на Render.com + код на GitHub

Если нужен именно сервер Flask (редко требуется для этого проекта):

1. Залейте проект в репозиторий GitHub (как в шагах 1–3 выше).
2. Зарегистрируйтесь на [Render](https://render.com).
3. **New** → **Blueprint** → подключите репозиторий; Render подхватит `render.yaml`.
4. После деплоя откройте выданный URL сервиса.

Локально продакшен-режим можно проверить так:

```powershell
.\venv\Scripts\gunicorn.exe --bind 127.0.0.1:5000 app:app
```

## Полезные файлы

| Файл | Назначение |
|------|------------|
| `freeze.py` | Сборка статики в `build/` для GitHub Pages |
| `.github/workflows/pages.yml` | Автоматическая публикация на Pages при push в `main` |
| `render.yaml` | Шаблон деплоя Flask на Render |

Каталоги `venv/` и `build/` в Git не попадают (см. `.gitignore`).
