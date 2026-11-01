#!/bin/sh
set -eu

case "$DOMAIN" in
  ""|*[!A-Za-z0-9.-]*)
    echo "Invalid DOMAIN for HTTPS configuration" >&2
    exit 1
    ;;
esac

certificate_dir="/etc/letsencrypt/live/$DOMAIN"
if [ -f "$certificate_dir/fullchain.pem" ] && [ -f "$certificate_dir/privkey.pem" ]; then
  sed "s/@@DOMAIN@@/$DOMAIN/g" /etc/nginx/nginx-https.conf.template \
    > /etc/nginx/conf.d/default.conf
  echo "HTTPS enabled for $DOMAIN"
else
  echo "HTTPS certificate not found for $DOMAIN; serving HTTP until certificate is issued"
fi
