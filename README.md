# Full-Stack Task Manager Application

This is a comprehensive Full-Stack Task Management application built for the FSD Intern Assignment. It features a robust Spring Boot backend, a React frontend, and a containerized PostgreSQL database.

## 🚀 Tech Stack

* **Frontend:** React.js, Axios, React Router
* **Backend:** Java 17, Spring Boot 3.x, Spring Security (JWT)
* **Database:** PostgreSQL (Containerized via Docker)
* **Testing:** JUnit 5, Mockito
* **API Documentation:** Swagger UI / OpenAPI 3

## ✨ Key Features Implemented

* **User Authentication:** Secure registration and login using JWT (JSON Web Tokens)
* **Role-Based Access Control:** Standard users can manage their own tasks, while admins have global visibility
* **CRUD Operations:** Create, Read, Update, and Delete tasks
* **Advanced Filtering & Sorting:** Filter tasks by `Status` and `Priority`, and sort by `Priority` or `Due Date`
* **File Management:** Attach and download PDF documents associated with tasks
* **Automated Testing:** Mockito-based unit tests without requiring a live database
* **Interactive API Documentation:** Swagger UI for endpoint testing and verification

---

## 🏗️ Architectural & Design Decisions

### 1. JWT for Security (Stateless Authentication)

JWT is used instead of session-based authentication to keep the API stateless. This improves scalability and cleanly separates the React frontend from the backend.

### 2. Dockerized Database (PostgreSQL)

Using `docker-compose` ensures a consistent database environment for anyone running the project, avoiding “works on my machine” issues.

### 3. Pure Unit Testing (Mockito)

Instead of `@SpringBootTest`, pure unit tests using Mockito are implemented. This keeps tests fast and independent of database state.

### 4. Layered Architecture

The backend follows a Controller–Service–Repository pattern:

* Controllers handle HTTP requests
* Services contain business logic
* Repositories manage database operations via JPA

---

## 🛠️ How to Run the Project

### 1. Start the Database

Ensure Docker Desktop is running. Open a terminal in the root `TaskManager` directory and run:

```bash id="db1x9p"
docker compose up -d
```

Note: If you encounter password errors, run:

```bash id="db2x8q"
docker compose down -v
```

Then start again.

### 2. Start the Spring Boot Backend

```bash id="be7k2m"
cd backend
./mvnw spring-boot:run
```

Backend runs at:
http://localhost:8080

### 3. View API Documentation

Open in browser:
http://localhost:8080/swagger-ui/index.html

### 4. Start the React Frontend

```bash id="fe4n6z"
cd frontend
npm install
npm start
```

Frontend runs at:
http://localhost:3000

---

## 🧪 Running Tests

```bash id="test9q1w"
cd backend
./mvnw test
```

---

## 🎯 Final Notes

* Do not include `node_modules` or `target` folders when submitting
* Ensure `.gitignore` is properly configured
* Make sure all services (Docker, backend, frontend) run without errors before submission

---

## 🎉 Conclusion

This project demonstrates:

* Full-stack development (React + Spring Boot)
* Secure authentication using JWT
* REST API design and documentation
* Database containerization using Docker
* Unit testing with Mockito

It reflects the ability to design, build, and deploy a production-ready application from scratch.
