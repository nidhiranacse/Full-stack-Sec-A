require('dotenv').config();
const path = require('path');
const bcrypt = require('bcryptjs');
const { openDb } = require('./database');

async function seed(filename = process.env.DB_PATH || path.join(__dirname, '../../booknest.sqlite')) {
  const db = await openDb(filename);
  await db.exec('DELETE FROM issues; DELETE FROM books; DELETE FROM members;');
  const hash = await bcrypt.hash('Pass@123', 10);
  const members = [
    [1,'Admin','admin@lib.example','librarian'],
    [2,'Aarav','aarav@lib.example','member'],
    [3,'Meera','meera@lib.example','member'],
    [4,'Rohan','rohan@lib.example','member']
  ];
  for (const [id,name,email,role] of members)
    await db.run('INSERT INTO members(id,name,email,role,password_hash) VALUES(?,?,?,?,?)',[id,name,email,role,hash]);
  const books = [
    [1,'LIB-1001','The Pragmatic Programmer','Hunt & Thomas',2,2],
    [2,'LIB-1002','Clean Code','Robert C. Martin',1,1],
    [3,'LIB-1003','Operating System Concepts','Silberschatz',3,3],
    [4,'LIB-1004','Database System Concepts','Silberschatz',1,0],
    [5,'LIB-1005','Computer Networks','Tanenbaum',2,2]
  ];
  for (const b of books)
    await db.run('INSERT INTO books(id,code,title,author,total_copies,available_copies) VALUES(?,?,?,?,?,?)',b);
  const today = new Date(); today.setHours(12,0,0,0);
  const issued = new Date(today); issued.setDate(issued.getDate()-20);
  const due = new Date(issued); due.setDate(due.getDate()+14);
  const iso = d => d.toISOString().slice(0,10);
  await db.run('INSERT INTO issues(id,member_id,book_id,issued_on,due_on,returned_on,fine) VALUES(1,4,4,?,?,NULL,0)',[iso(issued),iso(due)]);
  await db.close();
}
if (require.main === module) seed().then(()=>console.log('BookNest database seeded.')).catch(e=>{console.error(e);process.exit(1);});
module.exports = { seed };
