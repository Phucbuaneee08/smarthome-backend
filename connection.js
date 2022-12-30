const mongoose = require('mongoose');
const connection= async(req,res)=>{
    try{
        const conn = await mongoose.connect(
            `mongodb+srv://vercel-admin-user:jVSyDuBZbRW7CSph@smarthome.vexghpd.mongodb.net/smarthome?retryWrites=true&w=majority`
            // `mongodb://localhost:27017`
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