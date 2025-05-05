FROM node:18 as build

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build ứng dụng
RUN npm run build

# Production environment
FROM nginx:alpine

# Copy build từ stage trước
COPY --from=build /app/build /usr/share/nginx/html

# Copy cấu hình nginx nếu cần
# COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
