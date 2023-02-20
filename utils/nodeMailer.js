const nodemailer = require('nodemailer');
const sendEmail= async(email,subject,text)=>{
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: "shomeforum@gmail.com",
                pass: "JHK7gs87gjs@scx",
            },
        });

        await transporter.sendMail({
            from: "shomeforum@gmail.com",
            to: email,
            subject: subject,
            text:'Mật khẩu mới: '+text 
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
}
module.exports= sendEmail