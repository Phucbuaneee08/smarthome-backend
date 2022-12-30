const express = require('express')
const router = express.Router()
const accountController = require('../controllers/accountController')


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

//sign in
router.post('/api/account/sign-in', accountController.signIn);

//sign out
router.post('/api/account/sign-out',  accountController.signOut);

//change password
router.put('/api/account/change-password', accountController.changePassword);

module.exports = router;
