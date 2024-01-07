const mongoose = require('mongoose');
const connection= async(req,res)=>{
    try{
        const conn = await mongoose.connect(
            `mongodb://localhost:27017/iot`
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