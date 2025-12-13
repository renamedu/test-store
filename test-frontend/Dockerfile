FROM node:14
# Создаем рабочую директорию
WORKDIR /app
# Копируем файлы в контейнер
COPY package.json /app
COPY package-lock.json /app
# Устанавливаем зависимости
RUN npm install
# Копируем остальные файлы
COPY . /app
# Собираем приложение
RUN npm run build
# Открываем порт для сервера React
EXPOSE 3000
# Запускаем приложение
CMD ["npm", "start"]
