// const Devices = require("../models/Devices");
// const { findById } = require("../models/Devices");
const Account = require("../models/Accounts");
const Home = require("../models/Homes");
const Room = require("../models/Rooms");

// const getTemperature = async (req,res) => {
//     try {
//         const {roomId} = req.params;
//         const room = await Rooms.findById(roomId);
//         const devices = room.devices;
//         console.log(devices);
//         var value;
//         for (let i = 0; i < devices.length; i++) {
//             const device = await Devices.findById(devices[i]);
//             if(device.deviceType == 'temperature-celsius') {
//                 var data = device.data;
//                 value = data[data.length - 1];
//                 console.log(value);
//                 break;
//             }
//         }
//         res.status(200).json({
//             status: 'OK',
//             msg: 'Get room temperature success',
//             temperature: value
//         })
//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error',
//             error: err
//         })

//     }
// }
// const getHumidity = async (req,res) => {
//     try {
//         const {roomId} = req.params;
//         const room = await Rooms.findById(roomId);
//         const devices = room.devices;
//         var humidities ;
//         for (let i = 0; i < devices.length; i++) {
//             let device = await Devices.find({
//                 _id : devices[i],
//                 deviceType: 'air-humidifier'
//             },{
//                 data: {
//                     $slice: -10
//                 }
//             });
//             if(device.length != 0){
//                  humidities = device[0].data
//                  humidities = humidities.map(e => { return {value: e.value, createAt: e.createAt}} )
//                 break;
//             }
//         }

//         res.status(200).json({
//             ok: 'OK',
//             msg: 'Get last 10 humidities data success',
//             humidities: humidities
//         });
//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error',
//             error: err
//         });
//     }
// }

// const getRoomData = async (req, res) => {
//     try {
//         const room = await Rooms.findById(req.params.roomId).populate('devices').exec()
//         res.status(200).json({
//             status: 'OK',
//             msg: 'Get room data success!',
//             room: room
//         })

//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error',
//             error: err
//         })
//     }
// }

// const removeDevice = async (req,res) => {
//     try {
//         const {deviceId, roomId} = req.params;
//         await Rooms.updateOne({_id: roomId},{
//             $pullAll: {
//                 devices: [{_id: deviceId}]
//             }
//         })
//       //  await Devices.deleteMany({_id: deviceId})
//         res.status(200).json({
//             status: 'OK',
//             msg: 'Remove device from room success'
//         })
//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error',
//             error: err
//         })
//     }
// }

// const createRoom = async (req,res) => {
//     try {
//         const {homeId, roomInfo} = req.body
//         console.log(homeId);
//         console.log(roomInfo);
//         const newroom = new Rooms({
//             home: homeId,
//             name: roomInfo.name
//         })
//         await newroom.save()
//         console.log(newroom);
//         const home = await Homes.findByIdAndUpdate({
//             _id : homeId
//         },
//         {
//             $push : {
//                 rooms: newroom._id
//             }
//         })
//         res.status(200).json({
//             status: 'OK',
//             msg: 'Add new room success!',
//             newRoom: newroom
//         })

//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error'
//         })
//     }
// }
// const addExitedDevice = async (req, res) => {
//     try {
//         console.log('go here');
//         const {roomId, deviceId} = req.body;
//         await Rooms.findByIdAndUpdate(roomId,{
//             $push: {
//                 devices: deviceId
//             }
//         })
//         res.status(200).json({
//             status: 'OK',
//             msg: 'Add new device success',
//             deviceId: deviceId
//         })
//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Add device failed',
//             error: err
//         })
//     }
// }

// module.exports = {getRoomData,createRoom, getTemperature, removeDevice, getHumidity, addExitedDevice}

const roomController = {
    createRoom: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: homeId và thông tin mới của phòng
            const { homeId, newName } = req.body;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            // Thêm phòng mới
            const newRoom = new Room({
                homeId: homeId,
                roomName: newName,
            });

            await newRoom.save();

            // Thêm thông tin phòng mới vào roomsList của nhà này
            await Home.findByIdAndUpdate(homeId, {
                $addToSet: {
                    roomsList: {
                        _id: newRoom._id,
                        roomName: newRoom.roomName,
                    },
                },
            });

            //Trả về thông tin phòng mới thêm
            return res.send({
                result: "success",
                room: newRoom,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    deleteRoom: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: Id của phòng bị xóa
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

            const roomData = await Room.findById(roomId);

            // Xóa thông tin phòng khỏi roomsList của nhà đó
            await Home.updateOne(
                { _id: roomData.homeId },
                {
                    $pull: {
                        roomsList: { _id: roomId },
                    },
                }
            );

            // Xóa phòng khỏi database
            await Room.findByIdAndDelete(roomId);

            //Thông báo thành công
            return res.send({
                result: "success",
                message: "Xóa phòng thành công"
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    getRoomData: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: id của phòng muốn lấy dữ liệu
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
            const roomData = await Room.findById(roomId);
            
            // Trả về thông tin chi tiết căn phòng
            return res.send({
                result: "success",
                roomData: roomData,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    getRoomsList: async (req, res) => {
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
            const roomsList = await Room.find({homeId: homeId});
            
            // Trả về danh sách phòng của căn nhà
            return res.send({
                result: "success",
                roomsList: roomsList,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    updateRoomData: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: Dữ liệu mới của phòng
            const {  roomId, newName } = req.body;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }
            // Cập nhật thông tin mới
            const newRoomData = await Room.findByIdAndUpdate(roomId, {
                roomName: newName,
            });

            // Sửa thông tin phòng ở roomsList của nhà
                    await Home.updateOne(
                        { _id: newRoomData.homeId, "roomsList._id": roomId },
                        {
                            $set: {
                                'roomsList.$.roomName': newName,
                            },
                        }
                    )

            await newRoomData.save();

            // Trả về thông tin mới của căn phòng
            return res.send({
                result: "success",
                // newRoomData: newRoomData,
                message : "Cập nhật thành công"
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },
};

module.exports = roomController;
