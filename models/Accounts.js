const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accounts = new Schema(
    {
        // username: {
        //     type: String,
        //     required: true
        // },
        // password: {
        //     type: String,
        //     required: true
        // },
        // phone: {
        //     type: String,
        //     default: ''
        // },
        // fullname: {
        //     type: String,
        //     default: ''
        // },
        // home: {
        //     type: mongoose.SchemaTypes.ObjectId,
        //     default: null,
        //     ref: 'homes'
        // },
        // createAt: {
        //     type: Date,
        //     default: Date.now
        // }
        username: String,
        password: String,
        fullname: String,
        phone: String,
        email: String,
        avatar: String,
        dob: String,
        gender: String,
        address: String,
        accessToken: String,
        homeList: [
            {
                _id: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "homes",
                },
                homeName: String,
                homeAddress: String,
                status: {
                    type: String,
                    default: 'requesting'   
                }
            },
        ],
        expirationDateToken: Date,
        resetPasswordToken: String,
        expirationDateResetPasswordToken: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("accounts", accounts);
