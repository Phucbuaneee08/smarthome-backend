// const mqtt = require("mqtt");
// const broker = "mqtt://broker.hivemq.com:1883";
// const topic = "/control_IOT";
const Device = require("../models/Devices");
// const options = {};
// const client = mqtt.connect(broker, options);
const Room = require("../models/Rooms");
const Account = require("../models/Accounts");

const deviceController = {
    // getData: async (req, res) => {
    //     try {
    //         res.status(200).json({
    //             status: "OK",
    //             msg: "Get Data success",
    //             value: value,
    //         });
    //     } catch (err) {
    //         res.status(500).json({
    //             status: "ERR",
    //             msg: "Server Error",
    //             error: err,
    //         });
    //     }
    // },

    // controlDevice: async (req, res) => {
    //     try {
    //         const { deviceId, ...control } = req.body;

    //         console.log("deviceid: ", deviceId);
    //         console.log("control: ", control.control);
    //         await Devices.findByIdAndUpdate(deviceId, {
    //             control: { ...control.control },
    //         });
    //         // client.on('connect', () => {
    //         // console.log('Connected broker')
    //         client.publish(
    //             topic,
    //             JSON.stringify({
    //                 deviceId: deviceId,
    //                 control: { ...control.control },
    //             }),
    //             (err) => {
    //                 if (err) console.log("MQTT publish error: ", err);
    //                 else console.log("Published!");
    //             }
    //         );
    //         // })
    //         console.log(control);
    //         res.status(200).json({
    //             status: "OK",
    //             msg: "Send control signal success!",
    //             control: control.control,
    //         });
    //     } catch (err) {
    //         res.status(500).json({
    //             status: "ERR",
    //             msg: "Server Error!",
    //             error: err,
    //         });
    //     }
    // },
    // getDeviceData: async (req, res) => {
    //     try {
    //         const deviceId = req.params.deviceId;
    //         const device = await Devices.findById(deviceId);
    //         res.status(200).json({
    //             status: "OK",
    //             msg: "Get device info success!",
    //             deviceInfo: {
    //                 deviceName: device.deviceName,
    //                 deviceType: device.deviceType,
    //                 control: device.control,
    //             },
    //         });
    //     } catch (err) {
    //         res.status(404).json({
    //             status: "ERR",
    //             msg: "Something wrong on server",
    //             error: err,
    //         });
    //     }
    // },

    // createDevice: async (req, res) => {
    //     try {
    //         const { deviceInfo, roomId } = req.body;
    //         const device = new Devices(deviceInfo);
    //         await device.save();
    //         await Room.findByIdAndUpdate(roomId, {
    //             $push: {
    //                 devices: device._id,
    //             },
    //         });
    //         res.status(200).json({
    //             status: "OK",
    //             msg: "Create new device success!",
    //             deviceId: device._id,
    //         });
    //     } catch (err) {
    //         res.status(500).json({
    //             status: "ERR",
    //             msg: "Server Error",
    //             error: err,
    //         });
    //     }
    // },
    createDevice: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: thông tin mới của thiết bị {roomId, deviceName, deviceType}
            const deviceInfo = req.body;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            // Thêm thiết bị mới
            const newDevice = new Device(deviceInfo);

            await newDevice.save();

            // Thêm thông tin thiết bị mới vào devicesList của phòng này
            await Room.findByIdAndUpdate(newDevice.roomId, {
                $addToSet: {
                    devicesList: {
                        _id: newDevice._id,
                        deviceName: newDevice.deviceName,
                    },
                },
            });

            //Trả về thông tin thiết bị mới thêm
            return res.send({
                result: "success",
                device: newDevice,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    getDeviceData: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: deviceId
            const { deviceId } = req.query;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            const deviceData = await Device.findById(deviceId);
            // Trả về dữ liệu thiết bị
            return res.send({
                result: "success",
                deviceData: deviceData,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    updateDeviceData: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: id thiết bị, tên mới của thiết bị, id phòng muốn đổi
            const {  deviceId, newName, newRoomId } = req.body;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            const deviceInfo = await Device.findById(deviceId);

            // Xóa thông tin thiết bị khỏi devicesList của phòng trước đó
            await Room.updateOne(
                { _id: deviceInfo.roomId },
                {
                    $pull: {
                        devicesList: { _id: deviceId },
                    },
                }
            );

            // Cập nhật thông tin mới của thiết bị
            const newDevice = await Device.findByIdAndUpdate(deviceId, {
                deviceName: newName,
                roomId: newRoomId,
            });

            // Thêm thông tin thiết bị ở devicesList của phòng mới đổi
            await Room.findByIdAndUpdate(newRoomId, {
                $addToSet: {
                    devicesList: {
                        _id: deviceInfo._id,
                        deviceName: newName,
                    },
                },
            });

            await newDevice.save();

            return res.send({
                result: "success",
                message : "Cập nhật thành công"
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    getDevicesList: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: homeId hoặc để trống
            const { homeId } = req.query;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }
            if (homeId) {
                // let DevicesOfHome = [];
                // const currentHome = await Home.findById(homeId);
                //     for (let i = 0; i < currentHome.roomsList.length; i++) {
                //         let DevicesOfRoom = await Device.find({
                //             roomId: currentHome.roomsList[i]._id,
                //         });
                //         DevicesOfHome = DevicesOfHome.concat(DevicesOfRoom);
                //     }
                const roomsList = await Room.find({ homeId: homeId });
                let devicesList = [];
                for (let i = 0; i < roomsList.length; i++) {
                    devicesList = devicesList.concat(
                        await Device.find({ roomId: roomsList[i]._id })
                    );
                }
                // Trả về danh sách các thiết bị
                return res.send({
                    result: "success",
                    devicesList: devicesList,
                });
            } else {
                const AllDevices = await Device.find();
                // Trả về danh sách tất cả các thiết bị
                return res.send({
                    result: "success",
                    AllDevices: AllDevices,
                });
            }
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    deleteDevice: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: Id của thiết bị bị xóa
            const { deviceId } = req.query;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }
            const deviceInfo = await Device.findById(deviceId);

            // Xóa thông tin thiết bị khỏi devicesList của phòng đó
            await Room.updateOne(
                { _id: deviceInfo.roomId },
                {
                    $pull: {
                        devicesList: { _id: deviceId },
                    },
                }
            );

            // Xóa thiết bị khỏi database
            await Device.findByIdAndDelete(deviceId);

            //Thông báo thành công
            return res.send({
                result: "success",
                message: "Xóa thiết bị thành công",
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },
    // updateData: async (data) => {
    //     try {
    //         const device = await Devices.findByIdAndUpdate(data.deviceId, {
    //             $push: {
    //                 data: {
    //                     value: data.value,
    //                 },
    //             },
    //         });
    //     } catch (err) {
    //         console.log(err);
    //     }
    // },
};
// module.exports = {
//     getData,control,createDevice, deleteDevice, getDevice, updateData
// }

module.exports = deviceController;
