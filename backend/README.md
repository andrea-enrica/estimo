## Backend Setup (Spring Boot)

1. **Clone the repository**
   ```bash
   git clone https://github.com/andrea-enrica/estimo.git
   cd estimo/backend

2. **Start PostgreSQL with Docker**

    docker run --name estimo-db \
    -e POSTGRES_DB=planitpoker \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -p 5432:5432 \
    -d postgres:latest

3. **Configure application properties**
Edit src/main/resources/application.properties (or .yml):

    spring.datasource.url=jdbc:postgresql://localhost:5432/planitpoker
    spring.datasource.username=postgres
    spring.datasource.password=postgres

4. **Run the backend**
Open the project in IntelliJ IDEA, build, and run it.
Liquibase will automatically create the schema and seed default users.

Or via CLI:
./mvnw spring-boot:run

Backend will be available at:
http://localhost:8080