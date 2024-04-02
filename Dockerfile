FROM dzdp-frontend-base as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install  --registry https://npm.aliyun.com/ 
COPY . .
RUN npm run build

# production stage
FROM nginx as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]k 
