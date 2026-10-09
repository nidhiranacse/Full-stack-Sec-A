PS D:\labsheet-13 full stack\RollNo_BookNest\server> npm test

> booknest-server@1.0.0 test
> jest --runInBand

POST /api/auth/login 200 7.659 ms - 253
POST /api/auth/login 200 2.825 ms - 246
POST /api/auth/login 401 2.466 ms - 79
POST /api/auth/login 200 3.293 ms - 253
POST /api/auth/login 200 3.025 ms - 246
POST /api/issues 201 3.283 ms - 159
POST /api/issues 409 1.110 ms - 80
POST /api/auth/login 200 2.505 ms - 253
POST /api/auth/login 200 3.065 ms - 246
POST /api/issues 409 0.880 ms - 89
POST /api/auth/login 200 2.573 ms - 253
 PASS  tests/api.test.js
  ● Console

    console.log
      ◇ injected env (2) from .env // tip: ⌘ suppress logs { quiet: true }

      at _log (node_modules/dotenv/lib/main.js:131:11)

    console.log
      ◇ injected env (0) from .env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }

      at _log (node_modules/dotenv/lib/main.js:131:11)

POST /api/auth/login 200 2.328 ms - 246
POST /api/issues/1/return 200 1.415 ms - 11
POST /api/auth/login 200 4.159 ms - 253
POST /api/auth/login 200 2.528 ms - 246
GET /api/issues/overdue 403 0.763 ms - 93
 PASS  tests/utils.test.js

Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        1.299 s, estimated 2 s
Ran all test suites.
PS D:\labsheet-13 full stack\RollNo_BookNest\server> 