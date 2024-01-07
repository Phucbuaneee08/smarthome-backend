const mongoose = require("mongoose");

const devices = mongoose.Schema(
    {
        deviceName: {
            type: String,
            default: "",
        },
        deviceType: {
            type: String,
            default: "",
        },
        deviceChannel: {
            type: Number,
            default: 0,
        },
        roomId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "rooms",
        },
        data: {
            temperature: {
                type: String,
                default: "",
            },
            humidity: {
                type: String,
                default: "",
            },
            lightSensor: {
                type: String,
                default: "",
            },
        },
        control: {
            status: {
                type: Boolean,
                default: false,
            },
            intensity: {
                type: Number,
                default: 8000,
            },
            lightAuto: {
                type: Boolean,
                default: false,
            },
            timerAuto: {
                type: Boolean,
                default: false,
            },
        },
        automatic: {
            lightValue: {
                type: Number,
                default: 4095,
            },
            hourFrom: {
                type: Number,
                default: 0,
            },
            hourTo: {
                type: Number,
                default: 0,
            },
            minuteFrom: {
                type: Number,
                default: 0,
            },
            minuteTo: {
                type: Number,
                default: 0,
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("devices", devices);
