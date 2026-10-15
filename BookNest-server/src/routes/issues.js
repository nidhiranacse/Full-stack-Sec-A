const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { calculateFine } = require('../utils/fine');
const todayISO = () => new Date().toISOString().slice(0,10);
const addDays = (iso,n) => { const d=new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); };
module.exports = function issueRoutes(db) {
 const router=express.Router();
 router.post('/',authenticate,requireRole('librarian'),async(req,res,next)=>{
  const {member_id,book_id}=req.body||{};
  if(!Number.isInteger(Number(member_id))||!Number.isInteger(Number(book_id))||Number(member_id)<=0||Number(book_id)<=0)
   return res.status(400).json({error:{code:'VALIDATION_ERROR',message:'Positive member_id and book_id are required.'}});
  try {
   await db.exec('BEGIN IMMEDIATE');
   const member=await db.get('SELECT id,role FROM members WHERE id=?',[Number(member_id)]);
   if(!member||member.role!=='member'){await db.exec('ROLLBACK');return res.status(404).json({error:{code:'MEMBER_NOT_FOUND',message:'Member not found.'}});}
   const count=await db.get('SELECT COUNT(*) AS count FROM issues WHERE member_id=? AND returned_on IS NULL',[Number(member_id)]);
   if(count.count>=3){await db.exec('ROLLBACK');return res.status(409).json({error:{code:'LIMIT_REACHED',message:'A member may hold at most 3 active issues.'}});}
   const book=await db.get('SELECT id FROM books WHERE id=?',[Number(book_id)]);
   if(!book){await db.exec('ROLLBACK');return res.status(404).json({error:{code:'BOOK_NOT_FOUND',message:'Book not found.'}});}
   const update=await db.run('UPDATE books SET available_copies=available_copies-1 WHERE id=? AND available_copies>0',[Number(book_id)]);
   if(update.changes!==1){await db.exec('ROLLBACK');return res.status(409).json({error:{code:'NO_COPIES',message:'No copies are available.'}});}
   const issued=todayISO(), due=addDays(issued,14);
   const result=await db.run('INSERT INTO issues(member_id,book_id,issued_on,due_on) VALUES(?,?,?,?)',[Number(member_id),Number(book_id),issued,due]);
   const data=await db.get('SELECT * FROM issues WHERE id=?',[result.lastID]);
   await db.exec('COMMIT'); return res.status(201).json({data});
  }catch(e){try{await db.exec('ROLLBACK')}catch{} next(e);}
 });
 router.post('/:id/return',authenticate,requireRole('librarian'),async(req,res,next)=>{
  try{
   await db.exec('BEGIN IMMEDIATE');
   const issue=await db.get('SELECT * FROM issues WHERE id=?',[Number(req.params.id)]);
   if(!issue){await db.exec('ROLLBACK');return res.status(404).json({error:{code:'NOT_FOUND',message:'Issue not found.'}});}
   if(issue.returned_on){await db.exec('ROLLBACK');return res.status(409).json({error:{code:'ALREADY_RETURNED',message:'Issue has already been returned.'}});}
   const returned=todayISO(), fine=calculateFine(issue.due_on,new Date(`${returned}T00:00:00Z`));
   await db.run('UPDATE issues SET returned_on=?,fine=? WHERE id=?',[returned,fine,issue.id]);
   await db.run('UPDATE books SET available_copies=available_copies+1 WHERE id=?',[issue.book_id]);
   await db.exec('COMMIT'); return res.json({fine});
  }catch(e){try{await db.exec('ROLLBACK')}catch{}next(e);}
 });
 router.get('/overdue',authenticate,requireRole('librarian'),async(req,res,next)=>{
  try{
   const today=todayISO();
   const data=await db.all(`SELECT i.id,i.member_id,m.name AS member_name,b.title AS book_title,i.issued_on,i.due_on,
     CAST(julianday(?) - julianday(i.due_on) AS INTEGER) AS days_overdue,
     CAST(julianday(?) - julianday(i.due_on) AS INTEGER)*2 AS fine
     FROM issues i JOIN members m ON m.id=i.member_id JOIN books b ON b.id=i.book_id
     WHERE i.returned_on IS NULL AND i.due_on < ? ORDER BY i.due_on`,[today,today,today]);
   res.json(data);
  }catch(e){next(e);}
 });
 router.get('/mine',authenticate,async(req,res,next)=>{
  try{
   if(req.user.role!=='member') return res.status(403).json({error:{code:'FORBIDDEN',message:'Members only.'}});
   const data=await db.all(`SELECT i.id,i.issued_on,i.due_on,i.returned_on,i.fine,b.code,b.title,b.author
    FROM issues i JOIN books b ON b.id=i.book_id WHERE i.member_id=? ORDER BY i.id`,[req.user.id]);
   res.json(data);
  }catch(e){next(e);}
 });
 return router;
};
