const mongoose = require("mongoose");

const rooms = mongoose.Schema(
    {
        homeId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'homes'
        },
        roomName: String,
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
