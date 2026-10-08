FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 10000
CMD ["sh", "-c", "python manage.py migrate && python manage.py ensure_admin && gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker -b 0.0.0.0:${PORT:-10000}"]