const Device = require("../models/Devices");
const Home = require("../models/Homes");
const Room = require("../models/Rooms");
const Account = require("../models/Accounts");
const utils = require("../utils");
const sendEmail = require("../utils/nodeMailer");
const { generateRandomStr, sha256 } = require("../utils");

const accountController = {
    signUp: async (req, res) => {
        try {
            //check Account existent
            let account = await Account.findOne({
                username: req.body.username,
            });

            if (account) {
                return res.send({
                    result: "failed",
                    message: "Tài khoản đã tồn tại",
                });
            }

            const hashed = await utils.sha256(req.body.password);

            const newAccount = new Account({
                fullname: req.body.fullname,
                username: req.body.username,
                password: hashed,
                accessToken: "",
                gender: "",
                dob: null,
                avatar: "",
                email: "",
                address: "",
                phone: "",
                home: [],
            });

            await newAccount.save();

            return res.send({
                result: "success",
                account: newAccount,
            });
        } catch (err) {
            res.status(500).send({
                result: "failed",
                message: err,
            });
        }
    },

    signIn: async (req, res) => {
        try {
            const account = await Account.findOne({
                username: req.body.username,
                role: "USER",
            });

            if (!account) {
                return res.status(404).json({
                    result: "success",
                    message: "Tài khoản không đúng",
                });
            }

            const hashed = await utils.sha256(req.body.password);
            const validPassword = hashed === account.password;

            if (!validPassword) {
                return res.status(404).json({
                    result: "failed",
                    message: "Sai mật khẩu",
                });
            }

            if (!account.accessToken) {
                var accessToken = generateRandomStr(32);

                await account.updateOne({
                    accessToken: accessToken,
                });
            }
            const responseAccount = await Account.findOne({
                _id: account._id,
            });

            return res.send({
                result: "success",
                account: responseAccount.toJSON(),
            });
        } catch (err) {
            res.status(500).json({
                result: "failed",
                error: err,
            });
        }
    },

    getAccountData: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];
            const account = await Account.findOne({
                accessToken: accessToken,
            });

            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            res.send({
                result: "success",
                accountData: account,
            });
        } catch (error) {
            res.status(500).send({
                result: "failed",
                reason: error.message,
            });
        }
    },

    updateAccountData: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: Dữ liệu mới của tài khoản (trừ homeList)
            const fileData = req.file;
            const newData = { ...req.body, avatar: fileData?.path };
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
            const newAccountData = await Account.findByIdAndUpdate(
                account._id,
                {
                    ...newData,
                }
            );

            // Sửa thông tin nhà ở accountList của các nhà liên quan
            account.homeList.map(
                async (item) =>
                    await Home.updateOne(
                        { _id: item._id, "accountList._id": account._id },
                        {
                            $set: {
                                "accountList.$.fullname": newData.fullname,
                                "accountList.$.avatar": newData.avatar,
                            },
                        }
                    )
            );

            await newAccountData.save();

            // Trả về thông tin mới của tài khoản
            return res.send({
                result: "success",
                newAccountData: newAccountData,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    updateAccountDataOfAdmin: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: Dữ liệu mới của tài khoản (trừ homeList)
            const fileData = req.file;
            const newData = { ...req.body, avatar: fileData?.path };
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account || account.role !== "ADMIN") {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }
            // Cập nhật thông tin mới
            const newAccountData = await Account.findByIdAndUpdate(
                newData._id,
                {
                    ...newData,
                }
            );

            // Sửa thông tin nhà ở accountList của các nhà liên quan
            newAccountData.homeList.map(
                async (item) =>
                    await Home.updateOne(
                        {
                            _id: item._id,
                            "accountList._id": newAccountData._id,
                        },
                        {
                            $set: {
                                "accountList.$.fullname": newData.fullname,
                                "accountList.$.avatar": newData.avatar,
                            },
                        }
                    )
            );

            await newAccountData.save();

            // Trả về thông tin mới của tài khoản
            return res.send({
                result: "success",
                newAccountData: newAccountData,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    signOut: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            await account.updateOne({
                accessToken: null,
            });

            const responseAccount = await Account.findOne({
                _id: account._id,
            });
            res.send({
                result: "success",
            });
        } catch (error) {
            res.status(500).send({
                result: "failed",
                reason: error.message,
            });
        }
    },

    changePassword: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            const password = await sha256(req.body.password);
            const newPassword = await sha256(req.body.newPassword);

            if (account) {
                if (password === account.password) {
                    await Account.findByIdAndUpdate(account.id, {
                        password: newPassword,
                    });
                    return res.send({
                        result: "success",
                        message: "Đổi mật khẩu thành công",
                    });
                }
                return res.send({
                    result: "failed",
                    message: "Mật khẩu cũ không chính xác",
                });
            }
            return res.send({
                result: "faled",
                message: "Sai email",
            });
        } catch (err) {
            res.send({
                result: "faled",
                message: err,
            });
        }
    },

    adminSignIn: async (req, res) => {
        try {
            const account = await Account.findOne({
                username: req.body.username,
                role: "ADMIN",
            });

            if (!account) {
                return res.status(404).json({
                    result: "success",
                    message: "Tài khoản không đúng",
                });
            }

            const hashed = await utils.sha256(req.body.password);
            const validPassword = hashed === account.password;

            if (!validPassword) {
                return res.status(404).json({
                    result: "failed",
                    message: "Sai mật khẩu",
                });
            }

            if (!account.accessToken) {
                var accessToken = generateRandomStr(32);

                await account.updateOne({
                    accessToken: accessToken,
                });
            }
            const responseAccount = await Account.findOne({
                _id: account._id,
            });

            return res.send({
                result: "success",
                account: responseAccount.toJSON(),
            });
        } catch (err) {
            res.status(500).json({
                result: "failed",
                error: err,
            });
        }
    },
    getUsersListOfAdmin: async (req, res) => {
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

            // Lọc danh sách người dùng
            const usersList = await Account.find({
                role: "USER",
                fullname: { $regex: ".*" + q + ".*" },
            });

            // Trả về danh sách người dùng
            if (usersList.length > 0) {
                return res.send({
                    result: "success",
                    usersList: usersList,
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

    deleteUserOfAdmin: async (req, res) => {
        try {
            // accessToken của admin
            const accessToken = req.headers.authorization.split(" ")[1];

            // Đầu vào: id tài khoản đang bị xóa
            const { userId } = req.query;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account || account.role !== "ADMIN") {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            // Xóa thông tin tài khoản bị xóa khỏi accountList của các căn nhà
            const deleteUser = await Account.findById(userId);
            deleteUser.homeList.map((home) =>
                Home.findByIdAndUpdate(home._id, {
                    $pull: {
                        accountList: { _id: userId },
                    },
                })
            );

            await Account.deleteMany({_id: userId});

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

module.exports = accountController;
