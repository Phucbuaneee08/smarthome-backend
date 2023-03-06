const express = require('express')
const router = express.Router()
const accountController = require('../controllers/accountController')
const uploadCloud =  require('../utils/cloudinary')


// router.post('/login', login);
// router.post('/', register);
// router.post('/change-password',changePassword);
// router.put('/:accountId',updateInfo);
// router.get('/:accountId',getAccountInfo)
// module.exports = router
//sign up
router.post('/api/account/sign-up', accountController.signUp);

//get account data
router.get('/api/account/detail', accountController.getAccountData);

//update account data
router.put('/api/account/update', uploadCloud.single('avatar') , accountController.updateAccountData);

//sign in
router.post('/api/account/sign-in', accountController.signIn);

//sign out
router.post('/api/account/sign-out',  accountController.signOut);

//change password
router.put('/api/account/change-password', accountController.changePassword);

//request to reset password
router.post('/api/account/request-reset-password', accountController.requestToResetPassword);

//admin sign in
router.post('/api/admin-account/sign-in', accountController.adminSignIn);

//get users list of admin
router.get('/api/account/find', accountController.getUsersListOfAdmin);

//update account data of admin
router.put('/api/account/update-user', uploadCloud.single('avatar') , accountController.updateAccountDataOfAdmin);

//delete user of admin
router.get('/api/account/delete-user', accountController.deleteUserOfAdmin);

module.exports = router;
