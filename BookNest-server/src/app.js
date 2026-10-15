const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const issueRoutes = require('./routes/issues');
function createApp(db) {
 const app=express();
 app.use(helmet());
 app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'}));
 app.use(express.json({limit:'1mb'}));
 app.use(morgan('combined'));
 app.get('/api/health',(req,res)=>res.json({status:'ok'}));
 app.use('/api/auth',authRoutes(db));
 app.use('/api/books',bookRoutes(db));
 app.use('/api/issues',issueRoutes(db));
 app.use((req,res)=>res.status(404).json({error:{code:'NOT_FOUND',message:'Endpoint not found.'}}));
 app.use((err,req,res,next)=>{console.error(err.message);res.status(500).json({error:{code:'INTERNAL_ERROR',message:'An unexpected server error occurred.'}});});
 return app;
}
module.exports={createApp};
