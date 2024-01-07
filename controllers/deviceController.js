const mqtt = require("mqtt");
const broker = "mqtts://5233f9fd02c24818937557bb15993b3f.s2.eu.hivemq.cloud:8883";
const topic = "/control_device";
const Device = require("../models/Devices");
const options = {
    username: 'iot-sensor', 
    password: '27082002' 
};
const client = mqtt.connect(broker, options);
const Room = require("../models/Rooms");
const Account = require("../models/Accounts");
const pusher = require("../pusher");

const deviceController = {
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
            const { deviceId, newName, newRoomId } = req.body;
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
                message: "Cập nhật thành công",
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    getDevicesListOfRoom: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: roomId
            const { roomId } = req.query;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            const devicesList = await Device.find({ roomId: roomId });
            return res.send({
                result: "success",
                devicesListOfRoom: devicesList,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    getDevicesListOfHome: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: homeId
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
                devicesListOfHome: devicesList,
            });
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
    // retrieveData: async () => {
    //     try {
    //         const led = await Device.findById("64d01207cfd9fc49181e18cf");
    //         console.log(led);
    //         const air_conditioner = await Device.findById(
    //             "64d0121bcfd9fc49181e18dd"
    //         );
    //         const fan = await Device.findById("64d01225cfd9fc49181e18ec");
    //         client.publish(
    //             topic,
    //             JSON.stringify({
    //                 deviceId: led._id,
    //                 control: led.control,
    //                 automatic: led.automatic,
    //             }),
    //             (err) => {
    //                 if (err) console.log("MQTT publish error: ", err);
    //                 else console.log("Published!");
    //             }
    //         );
    //         client.publish(
    //             topic,
    //             JSON.stringify({
    //                 deviceId: air_conditioner._id,
    //                 control: air_conditioner.control,
    //                 automatic: air_conditioner.automatic,
    //             }),
    //             (err) => {
    //                 if (err) console.log("MQTT publish error: ", err);
    //                 else console.log("Published!");
    //             }
    //         );
    //         client.publish(
    //             topic,
    //             JSON.stringify({
    //                 deviceId: fan._id,
    //                 control: fan.control,
    //                 automatic: fan.automatic,
    //             }),
    //             (err) => {
    //                 if (err) console.log("MQTT publish error: ", err);
    //                 else console.log("Published!");
    //             }
    //         );
    //     } catch (error) {
    //         console.log(error);
    //     }
    // },
    updateData: async (_data) => {
        try {
            const {
                deviceId,
                deviceType,
                deviceChannel,
                data,
                control,
                automatic,
            } = _data;

            if (deviceType === "dhtSensor") {
                pusher.trigger("device", "temperature-humidity", {
                    tempData: {
                        ...data,
                    },
                });
            } else if (deviceType === "lightSensor") {
                pusher.trigger("device", "light-sensor", {
                    lightData: {
                        ...data,
                    },
                });
            } else {
                const device = await Device.findById(deviceId);
                await Device.findByIdAndUpdate(deviceId, {
                    data: {
                        ...device.data,
                        ...data,
                    },
                    control: {
                        ...device.control,
                        ...control,
                    },
                    automatic: {
                        ...device.automatic,
                        ...automatic,
                    },
                });
                pusher.trigger("device", "device-data", {
                    deviceData: {
                        deviceId: device._id,
                        data: {
                            ...device.data,
                            ...data,
                        },
                        control: {
                            ...device.control,
                            ...control,
                        },
                        automatic: {
                            ...device.automatic,
                            ...automatic,
                        },
                    },
                });
            }
        } catch (err) {
            console.log(err);
        }
    },
    controlDevice: async (req, res) => {
        try {
            const { deviceId, deviceChannel, control, automatic } = req.body;

            const currentDevice = await Device.findByIdAndUpdate(deviceId, {
                control: control,
                automatic: automatic,
            });
            // client.on('connect', () => {
            // console.log('Connected broker')
            client.publish(
                topic,
                JSON.stringify({
                    deviceId: deviceId,
                    deviceChannel: deviceChannel,
                    control: control,
                    automatic: automatic,
                }),
                (err) => {
                    if (err) console.log("MQTT publish error: ", err);
                    else console.log("Published!");
                }
            );
            // })
            console.log(control);
            res.status(200).json({
                status: "OK",
                msg: "Send control signal success!",
                currentDevice: currentDevice,
            });
        } catch (err) {
            res.status(500).json({
                status: "ERR",
                msg: "Server Error!",
                error: err,
            });
        }
    },
    getTemperatureAndHumidity: async (req, res) => {
        try {
            const { deviceId } = req.query;
            var data;
            const deviceData = await Device.findById(deviceId);
            console.log(deviceData);
            if (deviceData.deviceType === "Nhiệt độ, độ ẩm") {
                // value = device.value[device.value.length - 1];
                data = deviceData.data;
            }
            console.log(data);

            res.status(200).json({
                status: "OK",
                msg: "Get room temperature and humidity success",
                data: data,
            });
        } catch (err) {
            res.status(500).json({
                status: "ERR",
                msg: "Server error",
                error: err,
            });
        }
    },

    // getHumidity: async (req, res) => {
    //     try {
    //         const { deviceId } = req.query;
    //         var data;
    //         const deviceData = await Device.findById(deviceId);
    //         console.log(deviceData);
    //         if (deviceData.deviceType === "Cảm biến độ ẩm") {
    //             // value = device.value[device.value.length - 1];
    //             data = deviceData.data;
    //         }
    //             console.log(data);

    //         res.status(200).json({
    //             status: "OK",
    //             msg: "Get room humidity success",
    //             humidity: data,
    //         });
    //     } catch (err) {
    //         res.status(500).json({
    //             status: "ERR",
    //             msg: "Server error",
    //             error: err,
    //         });
    //     }
    // },

    getDevicesListOfAdmin: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: string tìm kiếm
            const { q } = req.query;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account || account.role !== "ADMIN") {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            // Lọc danh sách thiết bị của hệ thống
            const devicesList = await Device.find({
                deviceType: { $regex: ".*" + q + ".*" },
            });

            // Trả về danh sách thiết bị
            if (devicesList.length > 0) {
                return res.send({
                    result: "success",
                    devicesList: devicesList,
                });
            } else {
                return res.send({
                    result: "failed",
                    message: "Danh sách rỗng",
                });
            }
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },
};
// module.exports = {
//     getData,control,createDevice, deleteDevice, getDevice, updateData
// }

module.exports = deviceController;
