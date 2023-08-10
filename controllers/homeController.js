
const Account = require("../models/Accounts");
const Home = require("../models/Homes");
const Room = require("../models/Rooms");
const Device = require("../models/Devices");

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

    deleteHome: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: Id của căn nhà
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

            // Lấy thông tin nhà bị xóa
            const home = await Home.findById({
                _id: homeId,
            });

            // Xóa thông tin nhà khỏi homeList của các tài khoản liên quan
            home.accountList.map(
                async (item) =>
                    await Account.updateOne(
                        { _id: item._id },
                        {
                            $pull: {
                                homeList: { _id: homeId },
                            },
                        }
                    )
            );

            // Xóa các thiết bị trong nhà khỏi database
            home.roomsList.map(
                async (item) => await Device.deleteMany({ roomId: item._id })
            );

            // Xóa các phòng trong nhà khỏi database
            await Room.deleteMany({ homeId: home._id })

            // Xóa nhà khỏi database
            await Home.findByIdAndDelete(homeId);

            //Thông báo thành công
            return res.send({
                result: "success",
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

            // Đầu vào: string tìm kiếm
            const { q } = req.query;
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
                name: { $regex: ".*" + q + ".*" },
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

    updateHomeData: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: Dữ liệu mới của nhà (name, address)
            const { _id, name, address } = req.body;
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
            const newHomeData = await Home.findByIdAndUpdate(_id, {
                name: name,
                address: address,
            });

            // Sửa thông tin nhà ở homeList của các tài khoản liên quan
            newHomeData.accountList.map(
                async (item) =>
                    await Account.updateOne(
                        { _id: item._id, "homeList._id": _id },
                        {
                            $set: {
                                "homeList.$.homeName": name,
                                "homeList.$.homeAddress": address,
                            },
                        }
                    )
            );

            await newHomeData.save();
            // Trả về thông tin mới của căn nhà
            return res.send({
                result: "success",
                newHomeData: newHomeData,
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
            const { homeId } = req.body;
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

    refuseJoinHome: async (req, res) => {
        try {
            // accessToken của chủ nhà
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: id nhà và id tài khoản đang bị từ chối
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

            // Xóa thông tin tài khoản bị từ chối khỏi accountList của căn nhà
            const homeData = await Home.findByIdAndUpdate(homeId, {
                $pull: {
                    accountList: { _id: accountId },
                },
            });

            // Xóa thông tin nhà khỏi homeList của tài khoản bị từ chối
            const accountData = await Account.findByIdAndUpdate(accountId, {
                $pull: {
                    homeList: { _id: homeId },
                },
            });

            // Trả về
            return res.send({
                result: "success",
                req: req.body,
                message: "Hủy yêu cầu thành công!",
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    deleteMember: async (req, res) => {
        try {
            // accessToken của chủ nhà
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: id nhà và id tài khoản đang bị xóa
            const { homeId, accountId } = req.query;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            // Xóa thông tin tài khoản bị xóa khỏi accountList của căn nhà
            const homeData = await Home.findByIdAndUpdate(homeId, {
                $pull: {
                    accountList: { _id: accountId },
                },
            });

            // Xóa thông tin nhà khỏi homeList của tài khoản bị xóa
            const accountData = await Account.findByIdAndUpdate(accountId, {
                $pull: {
                    homeList: { _id: homeId },
                },
            });

            // Trả về
            return res.send({
                result: "success",
                message: "Xóa thành công!",
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
