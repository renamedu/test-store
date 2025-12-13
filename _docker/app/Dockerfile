FROM php:8.2-fpm
RUN apt-get update && apt-get install -y \
      mariadb-client \
      apt-utils \
      libpq-dev \
      libpng-dev \
      libzip-dev \
      libicu-dev \
      zip unzip \
      git && \
      docker-php-ext-install pdo_mysql && \
      docker-php-ext-install bcmath && \
      docker-php-ext-install gd && \
      docker-php-ext-install zip && \
      docker-php-ext-install intl && \
      apt-get clean && \
      rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
COPY ./_docker/app/php.ini /usr/local/etc/php/conf.d/php.ini
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN curl -sS https://getcomposer.org/installer | php -- \
    --filename=composer \
    --install-dir=/usr/local/bin
WORKDIR /var/www
COPY . .
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache
RUN composer install --no-interaction --prefer-dist \
 && php artisan key:generate