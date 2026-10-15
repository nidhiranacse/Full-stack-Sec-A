# JWT Authentication API

## Run
```bash
npm install
npm start
```
Server: http://localhost:3000

## Test (curl)
```bash
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d '{"username":"alice","password":"secret123"}'
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"username":"alice","password":"secret123"}'
curl http://localhost:3000/profile -H "Authorization: Bearer <token>"
```
