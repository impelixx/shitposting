#!/usr/bin/env bash
set -euo pipefail

# Использование: ./scripts/setup-server.sh твой-домен.com твой@email.com
DOMAIN="${1:?Укажи домен: ./setup-server.sh example.com admin@example.com}"
EMAIL="${2:?Укажи email для SSL: ./setup-server.sh example.com admin@example.com}"

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> [1/6] Обновление пакетов"
apt-get update -qq

echo "==> [2/6] Установка Docker"
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
else
    echo "     Docker уже установлен"
fi

echo "==> [3/6] Установка Nginx и Certbot"
apt-get install -y -qq nginx certbot python3-certbot-nginx

echo "==> [4/6] Настройка Nginx для $DOMAIN"
# Подставляем домен в шаблон
sed "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" "$REPO_DIR/nginx/blog.conf" \
    > /etc/nginx/sites-available/blogik

# Активируем сайт
ln -sf /etc/nginx/sites-available/blogik /etc/nginx/sites-enabled/blogik

# Отключаем дефолтный сайт если есть
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

echo "==> [5/6] Получение SSL-сертификата (Let's Encrypt)"
certbot --nginx \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect \
    -d "$DOMAIN"

echo "==> [6/6] Настройка файрвола (ufw)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status

echo ""
echo "======================================"
echo "  Готово! Осталось запустить бэкенд:"
echo ""
echo "  cd $REPO_DIR"
echo "  cp backend/.env.example backend/.env"
echo "  nano backend/.env   # задай пароли и JWT_SECRET"
echo "  docker compose up -d"
echo ""
echo "  Сайт: https://$DOMAIN"
echo "======================================"
