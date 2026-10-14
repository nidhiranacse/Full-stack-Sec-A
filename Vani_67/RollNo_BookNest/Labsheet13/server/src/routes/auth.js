const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
module.exports = function authRoutes(db) {
  const router = express.Router();
  router.post('/login', async (req,res,next) => {
    try {
      const { email, password } = req.body || {};
      if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password)
        return res.status(400).json({error:{code:'VALIDATION_ERROR',message:'Email and password are required.'}});
      const user = await db.get('SELECT id,name,email,role,password_hash FROM members WHERE email = ?', [email.trim().toLowerCase()]);
      if (!user || !(await bcrypt.compare(password,user.password_hash)))
        return res.status(401).json({error:{code:'INVALID_CREDENTIALS',message:'Email or password is incorrect.'}});
      const token = jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET || 'dev-only-change-me',{expiresIn:'1h'});
      delete user.password_hash;
      res.json({token,user});
    } catch(e){next(e);}
  });
  return router;
};
