const Device = require("../models/Devices");
const Home = require("../models/Homes");
const Room = require("../models/Rooms");
const Account = require("../models/Accounts");
const utils = require("../utils");
const {
    generateRandomStr,
    sha256
} = require("../utils");
const { cloudinary } = require("../utils/cloudinary");

// const changePassword = async (req, res) => {
//     try {
//         const account = req.body;
//         const newAccount = await  Users.findByIdAndUpdate({
//             _id: account.accountId
//         }, {
//             password: account.newPassword
//         })
//         if(newAccount) res.status(200).json({
//             status: 'OK',
//             msg: 'Change password success',
//         })
//         else res.status(200).json({
//             status: 'NO',
//             msg: 'Change password fail'
//         })
//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server Error',
//             error: err
//         })
//     }
// }
// const updateInfo = async (req, res) => {
//     try {
//         const account = req.body;
//         const newAccount = await Users.findOneAndUpdate(
//           { _id: req.params.accountId }
//         ,{
//             fullname: account.fullname,
//             phone: account.phone
//         })
//         console.log(newAccount);
//         res.status(200).json({status: 'OK', msg: 'Update infomation success', newInfo: newAccount});
//         //else res.status(200).json({status: 'NO', msg: 'Update infomation fail',newInfo: newAccount})
//     } catch (err) {
//         res.status(500).json({status: 'ERR', msg: 'Server error', error: err})
//     }
// }

// const login = async (req, res) => {
//     try {
//         const account = req.body;
//         const usernameExist = await Users.findOne({username: account.username})
//         if (usernameExist) {
//             if(usernameExist.password == account.password) {
//                 res.status(200).json({
//                     status: 'OK',
//                     msg: 'Login success!',
//                     accountId : usernameExist._id
//                 })
//             }else {
//                 res.status(200).json({
//                     status: 'NO',
//                     msg: 'Password incorrect!'
//                 })
//             }
//            // const user = await users.findOne({
//              //   _id : isExist._id
//             //})
//             // .populate({path: 'home', model: 'homes', populate : {
//             //     path: 'rooms', model: 'rooms', populate: {
//             //         path: 'devices', model: 'devices'
//             //     }
//             // }})
//         }
//          else
//             res.status(200).json({status: 'NO', msg: 'Account not existed!'})

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({error: error})
//     }
// }

// const register = async (req, res) => {
//     try {
//         const account = req.body;
//         console.log(account);
//         const isExist = await Users.findOne({username: account.username})
//         if (isExist) {
//             res.status(200).json({status: 'NO', msg: "Account existed!"})
//         } else {

//             const newHome = new Homes();
//             await newHome.save();
//             const newAccount = new Users({
//                 username: account.username,
//                 password: account.password,
//                 phone: account.phone ? account.phone: '',
//                 fullname: account.fullname? account.fullname:'',
//                 home:  newHome._id
//             });
//             await newAccount.save();
//             res.status(200).json({status: 'OK', msg: "Create account success!", accountId: newAccount._id, homeId: newHome._id})
//         }
//     } catch (err) {
//         res.status(500).json({status: 'ERR', msg: 'Server Error', error: err})
//     }
// }

// const getAccountInfo = async (req,res) => {
//     try {
//         const accountId = req.params.accountId;
//         const data = await Users.findById(accountId)
//         res.status(200).json({
//             status: 'OK',
//             msg: 'Get account info success',
//             accountInfo: {
//                 username: data.username,
//                 fullname: data.fullname,
//                 phone: data.phone
//             }
//         })
//     } catch (err) {
//         res.status(500).json({
//             status: 'ERR',
//             msg: 'Server error',
//             error : err
//         })
//     }
// }

// module.exports = {
//     login,
//     register,
//     updateInfo,
//     changePassword,
//     getAccountInfo
// }
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
                gender: "UNKNOWN",
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
            const newData = req.body;
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }
            if (newData.avatar){
                newData.avatar = cloudinary.uploader.upload(newData.avatar);
            }
            // Cập nhật thông tin mới
            const newAccountData = await Account.findByIdAndUpdate(account._id, {
                ...newData
            });

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
};

module.exports = accountController;
