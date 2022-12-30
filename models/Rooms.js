const mongoose = require("mongoose");

const rooms = mongoose.Schema(
    {
        // name: {
        //     type: String,
        //     default: ''
        // },
        // home: {
        //     type: mongoose.SchemaTypes.ObjectId,
        //     ref: 'homes'
        // },
        // devices: [
        //     {
        //         type: mongoose.SchemaTypes.ObjectId,
        //         ref: 'devices'
        //     }
        // ]
        name: String,
        devicesList: [
            {
                _id: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "devices",
                },
                deviceName: String,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("rooms", rooms);
