# Deployment Guide — RoyalPlay Social Casino (royalplay.social)

Полное пошаговое руководство по развертыванию платформы **RoyalPlay Social Casino** на VPS/выделенном сервере под управлением **Ubuntu 22.04 / 24.04 LTS**.

---

## 1. Параметры сервера и требования
- **Домен**: `royalplay.social`, `www.royalplay.social`
- **ОС**: Ubuntu 22.04 / 24.04 LTS
- **Веб-сервер**: Nginx
- **PHP**: PHP 8.4 FPM (`php8.4-fpm`)
- **База данных**: MySQL 8.0+ / MariaDB 10.11+ (или SQLite)
- **SSL**: Let's Encrypt via Certbot
- **Репозиторий**: `https://github.com/SHENiiDEV/social-royalplay.git`
- **Директория проекта**: `/var/www/royalplay.social`

---

## 2. Первоначальная подготовка сервера

### 2.1 Обновление пакетов и установка зависимостей
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip software-properties-common ufw
```

### 2.2 Установка PHP 8.4 и необходимых модулей
```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.4 php8.4-fpm php8.4-cli php8.4-mysql php8.4-sqlite3 \
    php8.4-curl php8.4-mbstring php8.4-xml php8.4-zip php8.4-bcmath \
    php8.4-intl php8.4-redis php8.4-gd
```

### 2.3 Установка Composer
```bash
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
```

### 2.4 Установка Nginx и Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

---

## 3. Настройка базы данных MySQL

Войдите в MySQL:
```bash
sudo mysql
```

Выполните SQL команды для создания базы данных и пользователя:
```sql
CREATE DATABASE royalplay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'royalplay_user'@'localhost' IDENTIFIED BY 'StrongDBPassword_2026!';
GRANT ALL PRIVILEGES ON royalplay.* TO 'royalplay_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 4. Клонирование и установка проекта

### 4.1 Клонирование репозитория
```bash
sudo mkdir -p /var/www/royalplay.social
sudo git clone https://github.com/SHENiiDEV/social-royalplay.git /var/www/royalplay.social
cd /var/www/royalplay.social
```

### 4.2 Установка PHP-зависимостей
```bash
sudo composer install --no-dev --optimize-autoloader
```
*(Скомпилированный фронтенд `public/build` уже находится в Git-репозитории, поэтому запускать `npm run build` на сервере не требуется).*

---

## 5. Конфигурация окружения (`.env`)

Создайте файл `.env`:
```bash
sudo cp .env.example .env
sudo nano .env
```

Заполните ключевые переменные для `royalplay.social`:
```dotenv
APP_NAME="RoyalPlay Social Casino"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://royalplay.social

LOG_CHANNEL=daily
LOG_LEVEL=error

# База данных (MySQL)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=royalplay
DB_USERNAME=royalplay_user
DB_PASSWORD=StrongDBPassword_2026!

# Сессии и кэш
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Почта Namecheap PrivateEmail (SMTP)
MAIL_MAILER=smtp
MAIL_HOST=mail.privateemail.com
MAIL_PORT=465
MAIL_USERNAME=support@royalplay.social
MAIL_PASSWORD=YourPrivateEmailPassword
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="support@royalplay.social"
MAIL_FROM_NAME="RoyalPlay Social Casino"

# NexusGGR Casino Gold API Settings
GGR_API_SERVER="https://api.nexusggr.com"
GGR_AGENT_CODE="royalplay"
GGR_AGENT_TOKEN="4ce1c45d75d90326811c4fb2cf3c3801"
GGR_AGENT_SECRET="0fbfd24390fac179e21e1ccee9d243ff"
GGR_MOCK_MODE=false
```

Генерация ключа приложения и миграции базы:
```bash
sudo php artisan key:generate --force
sudo php artisan migrate --force --seed
```

---

## 6. Настройка прав доступа

```bash
sudo chown -R www-data:www-data /var/www/royalplay.social
sudo find /var/www/royalplay.social -type f -exec chmod 664 {} \;
sudo find /var/www/royalplay.social -type d -exec chmod 775 {} \;
sudo chmod -R 775 /var/www/royalplay.social/storage /var/www/royalplay.social/bootstrap/cache
```

---

## 7. Конфигурация Nginx

Создайте виртуальный хост:
```bash
sudo nano /etc/nginx/sites-available/royalplay.social
```

Вставьте конфигурацию:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name royalplay.social www.royalplay.social;
    root /var/www/royalplay.social/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php index.html;
    charset utf-8;

    client_max_body_size 64M;

    # GGR Gold API Webhook fast path
    location /gold_api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        fastcgi_read_timeout 300;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2|webp)$ {
        expires 30d;
        access_log off;
        add_header Cache-Control "public, no-transform";
    }
}
```

Активируйте сайт и проверьте конфигурацию:
```bash
sudo ln -s /etc/nginx/sites-available/royalplay.social /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. Установка бесплатного SSL-сертификата (Let's Encrypt / Certbot)

```bash
sudo certbot --nginx -d royalplay.social -d www.royalplay.social --non-interactive --agree-tos -m admin@royalplay.social --redirect
```

Certbot автоматически настроит HTTPS и перенаправление с HTTP.
Проверка автопродления:
```bash
sudo certbot renew --dry-run
```

---

## 9. Оптимизация кэша Laravel в Production

Выполните команды в директории проекта:
```bash
cd /var/www/royalplay.social
sudo php artisan config:cache
sudo php artisan route:cache
sudo php artisan view:cache
sudo php artisan event:cache
```

---

## 10. Планировщик задач (Laravel Scheduler Cron)

Откройте crontab пользователя `www-data`:
```bash
sudo crontab -u www-data -e
```

Добавьте строку:
```crontab
* * * * * cd /var/www/royalplay.social && php artisan schedule:run >> /dev/null 2>&1
```

---

## 11. Настройка фаервола (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 12. Настройка NexusGGR Gold API в личном кабинете провайдера

Укажите в панели управления NexusGGR:
- **Webhook URL**: `https://royalplay.social/gold_api`
- **Agent Code**: `royalplay`
- **Agent Secret**: `0fbfd24390fac179e21e1ccee9d243ff`

---

## 13. Процедура обновления (Deploy Workflow)

При выпуске обновлений на локальной машине и пуше в GitHub:
```bash
# На сервере:
cd /var/www/royalplay.social
sudo git pull origin main
sudo php artisan migrate --force
sudo php artisan config:cache
sudo php artisan route:cache
sudo php artisan view:cache
sudo systemctl reload php8.4-fpm
```
