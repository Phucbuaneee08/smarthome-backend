const express = require('express')
const homeController = require('../controllers/homeController')
const router = express.Router()

// router.get('/:accountId',getHomeData)
// router.delete('/deleteroom/:homeId/:roomId',deleteRoom)

//create home
router.post('/api/home/create-home', homeController.createHome);

//delete home
router.delete('/api/home/delete-home', homeController.deleteHome);

//update home data
router.put('/api/home/update', homeController.updateHomeData);

//get home data
router.get('/api/home/detail', homeController.getHomeData);

//get other homes list
router.get('/api/home/find', homeController.getOtherHomesList);

//request to join home
router.put('/api/home/request-to-join-home', homeController.requestToJoinHome);

//confirm join home
router.put('/api/home/confirm-join-home', homeController.confirmJoinHome);

//refuse join home
router.delete('/api/home/refuse-join-home', homeController.refuseJoinHome);

//delete member
router.delete('/api/home/delete-member', homeController.deleteMember);
module.exports = router