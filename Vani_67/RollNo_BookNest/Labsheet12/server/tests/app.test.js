const path=require('path');
const fs=require('fs');
const request=require('supertest');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const {openDb}=require('../src/db/database');
const {createApp}=require('../src/app');
const {seed}=require('../src/db/seed');
const {calculateFine}=require('../src/utils/fine');
const testDb=path.join(__dirname,'test.sqlite');
let db,app,adminToken,aaravToken,meeraToken;
process.env.JWT_SECRET='test-secret';
beforeAll(async()=>{process.env.TEST_DB_PATH=testDb;db=await openDb(testDb);app=createApp(db);});
beforeEach(async()=>{
 await db.exec('DELETE FROM issues; DELETE FROM books; DELETE FROM members;');
 const hash=await bcrypt.hash('Pass@123',4);
 for(const [id,name,email,role] of [[1,'Admin','admin@lib.example','librarian'],[2,'Aarav','aarav@lib.example','member'],[3,'Meera','meera@lib.example','member'],[4,'Rohan','rohan@lib.example','member']])
  await db.run('INSERT INTO members(id,name,email,role,password_hash) VALUES(?,?,?,?,?)',[id,name,email,role,hash]);
 for(const b of [[1,'LIB-1001','The Pragmatic Programmer','Hunt & Thomas',2,2],[2,'LIB-1002','Clean Code','Robert C. Martin',1,1],[3,'LIB-1003','Operating System Concepts','Silberschatz',3,3],[4,'LIB-1004','Database System Concepts','Silberschatz',1,0],[5,'LIB-1005','Computer Networks','Tanenbaum',2,2]])
  await db.run('INSERT INTO books(id,code,title,author,total_copies,available_copies) VALUES(?,?,?,?,?,?)',b);
 const today=new Date();today.setUTCHours(0,0,0,0);
 const issued=new Date(today);issued.setUTCDate(issued.getUTCDate()-20);
 const due=new Date(issued);due.setUTCDate(due.getUTCDate()+14);
 const iso=d=>d.toISOString().slice(0,10);
 await db.run('INSERT INTO issues(id,member_id,book_id,issued_on,due_on) VALUES(1,4,4,?,?)',[iso(issued),iso(due)]);
 adminToken=jwt.sign({id:1,role:'librarian'},'test-secret',{expiresIn:'1h'});
 aaravToken=jwt.sign({id:2,role:'member'},'test-secret',{expiresIn:'1h'});
 meeraToken=jwt.sign({id:3,role:'member'},'test-secret',{expiresIn:'1h'});
});
afterAll(async()=>{if(db)await db.close();try{fs.unlinkSync(testDb)}catch{}});
test('wrong password gives 401',async()=>{
 const r=await request(app).post('/api/auth/login').send({email:'admin@lib.example',password:'wrong'});
 expect(r.status).toBe(401);
});
test('books endpoint requires login and search is parameterised',async()=>{
 expect((await request(app).get('/api/books')).status).toBe(401);
 const r=await request(app).get('/api/books?search=%27%20OR%20%271%27=%271').set('Authorization',`Bearer ${aaravToken}`);
 expect(r.status).toBe(200);expect(r.body.total).toBe(0);
});
test('issuing the last copy twice returns NO_COPIES on second attempt',async()=>{
 const first=await request(app).post('/api/issues').set('Authorization',`Bearer ${adminToken}`).send({member_id:2,book_id:2});
 const second=await request(app).post('/api/issues').set('Authorization',`Bearer ${adminToken}`).send({member_id:3,book_id:2});
 expect(first.status).toBe(201);expect(second.status).toBe(409);expect(second.body.error.code).toBe('NO_COPIES');
});
test('a fourth active issue returns LIMIT_REACHED',async()=>{
 await db.run('UPDATE books SET available_copies=total_copies');
 for(const book_id of [1,3,5]) { const r=await request(app).post('/api/issues').set('Authorization',`Bearer ${adminToken}`).send({member_id:2,book_id});expect(r.status).toBe(201); }
 const r=await request(app).post('/api/issues').set('Authorization',`Bearer ${adminToken}`).send({member_id:2,book_id:2});
 expect(r.status).toBe(409);expect(r.body.error.code).toBe('LIMIT_REACHED');
});
test('returning overdue seed issue charges fine 12 and duplicate return conflicts',async()=>{
 const r=await request(app).post('/api/issues/1/return').set('Authorization',`Bearer ${adminToken}`).send({});
 expect(r.status).toBe(200);expect(r.body.fine).toBe(12);
 const book=await db.get('SELECT available_copies FROM books WHERE id=4');expect(book.available_copies).toBe(1);
 const again=await request(app).post('/api/issues/1/return').set('Authorization',`Bearer ${adminToken}`).send({});
 expect(again.status).toBe(409);expect(again.body.error.code).toBe('ALREADY_RETURNED');
});
test('calculateFine returns 0 on time, 2 for one day, and 20 for ten days',()=>{
 expect(calculateFine('2026-10-14','2026-10-14')).toBe(0);
 expect(calculateFine('2026-10-14','2026-10-15')).toBe(2);
 expect(calculateFine('2026-10-14','2026-10-24')).toBe(20);
});
test('member sees only their own issues and cannot view librarian overdue list',async()=>{
 const mine=await request(app).get('/api/issues/mine').set('Authorization',`Bearer ${aaravToken}`);
 expect(mine.status).toBe(200);expect(mine.body).toEqual([]);
 expect((await request(app).get('/api/issues/overdue').set('Authorization',`Bearer ${aaravToken}`)).status).toBe(403);
});
