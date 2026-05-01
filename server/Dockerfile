FROM eclipse-temurin:21-jdk-alpine

# Thư mục làm việc trong container
WORKDIR /app

# Copy file .jar từ thư mục target vào container
# Phải chạy 'mvn clean package' trước khi build docker
COPY target/*.jar app.jar

# Mở port 8080
EXPOSE 8080

# Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]