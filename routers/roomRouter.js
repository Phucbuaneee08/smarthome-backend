const express = require('express')
const roomController = require('../controllers/roomController')
const router = express.Router()

// route.get('/:roomId',getRoomData)
// route.get('/temperature/:roomId',getTemperature)
// route.get('/humidity/:roomId',getHumidity)
// route.post('/',createRoom)
// route.post('/adddevice',addExitedDevice)
// route.delete('/:roomId/:deviceId',removeDevice)

//create room
router.post('/api/room/create', roomController.createRoom);

//delete room
router.delete('/api/room/delete', roomController.deleteRoom);

//update room data
router.put('/api/room/update', roomController.updateRoomData);

//get room data
router.get('/api/room/detail', roomController.getRoomData);

//get room list of home
router.get('/api/room/find', roomController.getRoomsList);

module.exports = router