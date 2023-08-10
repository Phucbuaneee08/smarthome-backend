const mongoose = require('mongoose');
const connection= async(req,res)=>{
    try{
        const conn = await mongoose.connect(
            `mongodb+srv://vercel-admin-user:jVSyDuBZbRW7CSph@smarthome.vexghpd.mongodb.net/smarthome?retryWrites=true&w=majority`
            // `mongodb+srv://dunghlhh:1s5a43X8axZgJRMk@smarthome.vexghpd.mongodb.net/?retryWrites=true&w=majority`
            , {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("Database connected!")
    }catch(err){
         console.log(err);
    }
}

module.exports=connection;