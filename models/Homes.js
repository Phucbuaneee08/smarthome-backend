const mongoose = require("mongoose");

const homes = mongoose.Schema(
    {
        // name: {
        //     type: String,
        //     default: ''
        // },
        // rooms: [
        //     {
        //         type: mongoose.SchemaTypes.ObjectId,
        //         ref: 'rooms'
        //     }
        // ]
        name: String,
        address: String,
        roomsList: [
            {
                _id: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "rooms",
                },
                roomName: String,
            },
        ],
        accountList: [
            {
                _id: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "accounts",
                },
                fullname: String,
                avatar: String,
                status: {
                    type: String,
                    default: "requesting",
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("homes", homes);
