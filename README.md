# Go JWT Auth Backend

A minimal backend written in Go that supports user registration and login with JSON Web Tokens (JWT).

## Features

1. **Signup** `POST /signup` – Create an account with `name`, `email`, and `password`.
2. **Login** `POST /login` – Obtain a JWT token using `email` and `password`.
3. **Protected Endpoint** `GET /api/profile` – Returns the authenticated user‘s profile when a valid token is supplied in the `Authorization: Bearer <token>` header.

## Tech Stack

- [Gin](https://github.com/gin-gonic/gin) – HTTP router / framework.
- [GORM](https://gorm.io/) – ORM; using SQLite for simplicity.
- [golang-jwt](https://github.com/golang-jwt/jwt) – JWT creation & validation.
- [bcrypt](https://pkg.go.dev/golang.org/x/crypto/bcrypt) – Password hashing.

## Getting Started

```bash
# 1. Clone repository (skip if already inside Cursor workspace)
# git clone https://github.com/yourname/jwt-auth && cd jwt-auth

# 2. Ensure Go >= 1.20 is installed

# 3. Install dependencies and run
GO111MODULE=on go mod tidy

go run ./...
```

The server will start on `http://localhost:8080`.

### Environment variables

| Name | Description | Default |
|------|-------------|---------|
| `JWT_SECRET` | Secret key used to sign JWT tokens | `secret` |

You can override the default by exporting the variable:

```bash
export JWT_SECRET="super-secret-key"
```

### Request Examples

Signup:

```bash
curl -X POST http://localhost:8080/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'
```

Login:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"password123"}' | jq -r .token)
```

Access protected endpoint:

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/profile
```