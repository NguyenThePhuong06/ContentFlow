#!/usr/bin/env bash
set -e

# ==============================================================================
# ContentFlow 1-Line VPS Deployment & Auto SSL (Lean & Fast)
# Usage:
#   DOMAIN=yourdomain.com EMAIL=admin@yourdomain.com bash deploy.sh
# ==============================================================================

DOMAIN=${DOMAIN:-"localhost"}
EMAIL=${EMAIL:-"admin@example.com"}

echo "🚀 [1/4] Preparing environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  # Generate random 32-byte string for APP_SECRET
  RANDOM_SECRET=$(openssl rand -hex 16)
  sed -i "s/your_32_byte_secret_key_change_me!/$RANDOM_SECRET/g" .env
  echo "Created .env with secure random secret."
fi

echo "🐳 [2/4] Building and launching containers..."
docker compose down --remove-orphans
docker compose up -d --build

echo "🔄 [3/4] Running database migrations..."
docker compose exec backend npx prisma migrate deploy

if [ "$DOMAIN" != "localhost" ]; then
  echo "🔒 [4/4] Issuing Let's Encrypt SSL certificate for $DOMAIN..."
  mkdir -p ./certbot/conf ./certbot/www
  docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" --agree-tos --no-eff-email \
    -d "$DOMAIN"
  
  docker compose restart frontend
  echo "✅ SSL certificate issued and Nginx reloaded!"
else
  echo "⏩ [4/4] Running in local mode (HTTP on port 80). Skipping SSL certbot."
fi

echo "✨ ContentFlow deployed successfully! Visit: http://$DOMAIN"

