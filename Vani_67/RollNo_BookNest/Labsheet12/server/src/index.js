require('dotenv').config();
const { openDb }=require('./db/database');
const { createApp }=require('./app');
(async()=>{const db=await openDb();const app=createApp(db);const port=Number(process.env.PORT)||4000;app.listen(port,()=>console.log(`BookNest API listening on ${port}`));})().catch(e=>{console.error(e);process.exit(1);});
