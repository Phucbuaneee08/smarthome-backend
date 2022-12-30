// const devices = require("../models/Devices");
// const mongoose = require('mongoose')
// const User = require('../models/Users')
// const Rooms = require("../models/Rooms");
// const { findByIdAndUpdate, findById } = require("../models/Devices");
const Account = require("../models/Accounts");
const Home = require("../models/Homes");

// const getHomeData = async (req, res) => {

//     try {
//        const account = await User.findById(req.params.accountId)
//        const home =await Homes.findById(account.home).populate('rooms')
//     //    .populate('devices','deviceName').exec();
//        console.log(home);
//        res.status(200).json({
//         status: 'OK',
//         msg: 'Get home data success!',
//         home: home
//        })

//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error',
//             error: err
//         })
//     }
// }

// const deleteRoom = async (req,res) => {
//     try {
//         const {roomId, homeId} = req.params;
//         console.log('roomid ',roomId);
//         await Homes.updateOne({_id: homeId}, {
//             $pullAll : {
//                 rooms: [{_id: roomId}]
//             }
//         })
//         console.log('homeid: ',homeId);
//          await Rooms.findByIdAndDelete(roomId)
//             res.status(200).json({
//             status: 'OK',
//             msg: 'Delete Room success'})
//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error',
//             error : err
//         })
//     }
// }

// module.exports = {
//     getHomeData, deleteRoom
// }

const homeController = {
    createHome: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: tất cả thông tin của căn nhà
            const home = req.body;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            // Thêm nhà mới và thêm tài khoản là chủ nhà vào danh sách thành viên
            const newHome = new Home({
                ...home,
                accountList: {
                    _id: account._id,
                    fullname: account.fullname,
                    avatar: account.avatar,
                    status: "owner",
                },
            });

            await newHome.save();

            // Thêm thông tin nhà mới vào homeList của tài khoản này, trạng thái là chủ nhà
            await Account.findByIdAndUpdate(account._id, {
                $addToSet: {
                    homeList: {
                        _id: newHome._id,
                        homeName: newHome.name,
                        homeAddress: newHome.address,
                        status: "owner",
                    },
                },
            });

            //Trả về thông tin nhà mới thêm
            return res.send({
                result: "success",
                home: newHome,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    getOtherHomesList: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: chỉ cần accessToken
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            // Lọc những nhà không trong danh sách đã sở hữu hoặc đang yêu cầu của tài khoản
            const otherHomesList = await Home.find({
                "accountList._id": { $ne: account._id },
            });

            // Trả về danh sách các nhà không liên quan
            if (otherHomesList.length > 0) {
                return res.send({
                    result: "success",
                    otherHomesList: otherHomesList,
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

    getHomeData: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: id của nhà muốn lấy dữ liệu
            const homeId = req.query.homeId;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }
            const homeData = await Home.findById(homeId);

            // Trả về thông tin chi tiết căn nhà
            return res.send({
                result: "success",
                homeData: homeData,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    requestToJoinHome: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: id nhà muốn được Join vào
            const homeId = req.body.homeId;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }
            const homeData = await Home.findById(homeId);

            // Cập nhật thêm thông tin tài khoản vào danh sách thành viên của nhà đó,
            // trạng thái đang yêu cầu
            await Home.findByIdAndUpdate(homeId, {
                $addToSet: {
                    accountList: {
                        _id: account._id,
                        fullname: account.fullname,
                        avatar: account.avatar,
                        status: "requesting",
                    },
                },
            });

            // Cập nhật thêm thông tin nhà vào danh sách nhà của tài khoản,
            // trạng thái đang yêu cầu
            await Account.findByIdAndUpdate(account._id, {
                $addToSet: {
                    homeList: {
                        _id: homeData._id,
                        homeName: homeData.name,
                        homeAddress: homeData.address,
                        status: "requesting",
                    },
                },
            });

            // Trả về
            return res.send({
                result: "success",
                message: "Gửi yêu cầu thành công!",
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    confirmJoinHome: async (req, res) => {
        try {
            // accessToken của chủ nhà
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: id nhà và id tài khoản đang yêu cầu
            const { homeId, accountId } = req.body;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            const homeData = await Home.findById(homeId);
            const accountData = await Account.findById(accountId);

            // Chuyển trạng thái từ "requesting" sang "owner" của tài khoản mới được xác nhận
            // trong danh sách thành viên
            await Home.updateOne(
                { _id: homeId, "accountList._id": accountId },
                {
                    $set: { "accountList.$.status": "owner" },
                }
            );

            // Chuyển trạng thái từ "requesting" sang "owner" của tài khoản mới được xác nhận
            // trong danh sách nhà của tài khoản đó
            await Account.updateOne(
                { _id: accountId, "homeList._id": homeId },
                {
                    $set: { "homeList.$.status": "owner" },
                }
            );

            // Trả về
            return res.send({
                result: "success",
                message: "Xác nhận thành công!",
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },
};

module.exports = homeController;
