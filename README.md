Запуск

git clone <репозиторий>
cd <папка-проекта>

cp .env.example .env

docker-compose up -d --build

docker-compose exec app php artisan migrate

