const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
module.exports = function bookRoutes(db) {
 const router = express.Router();
 router.get('/', authenticate, async (req,res,next) => {
  try {
   const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
   const page = Math.max(1, parseInt(req.query.page,10) || 1);
   const limit = Math.min(50,Math.max(1,parseInt(req.query.limit,10)||10));
   const where = search ? 'WHERE lower(title) LIKE lower(?) OR lower(author) LIKE lower(?)' : '';
   const params = search ? [`%${search}%`,`%${search}%`] : [];
   const totalRow = await db.get(`SELECT COUNT(*) AS total FROM books ${where}`,params);
   const data = await db.all(`SELECT id,code,title,author,total_copies,available_copies FROM books ${where} ORDER BY id LIMIT ? OFFSET ?`,[...params,limit,(page-1)*limit]);
   res.json({data,page,limit,total:totalRow.total,totalPages:Math.ceil(totalRow.total/limit)});
  } catch(e){next(e);}
 });
 router.post('/', authenticate, requireRole('librarian'), async(req,res,next)=>{
  try {
   const {code,title,author,total_copies} = req.body || {};
   const total = Number(total_copies);
   if (![code,title,author].every(v=>typeof v==='string'&&v.trim()) || !Number.isInteger(total)||total<0)
    return res.status(400).json({error:{code:'VALIDATION_ERROR',message:'code, title, author and non-negative integer total_copies are required.'}});
   try {
    const result = await db.run('INSERT INTO books(code,title,author,total_copies,available_copies) VALUES(?,?,?,?,?)',[code.trim(),title.trim(),author.trim(),total,total]);
    res.status(201).json({data:await db.get('SELECT * FROM books WHERE id = ?',[result.lastID])});
   } catch(e) { if (String(e.code).includes('CONSTRAINT')) return res.status(409).json({error:{code:'DUPLICATE_BOOK',message:'Book code already exists.'}}); throw e; }
  }catch(e){next(e);}
 });
 return router;
};
