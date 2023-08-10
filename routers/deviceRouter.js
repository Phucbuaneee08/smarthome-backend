const express = require('express')
const deviceController = require('../controllers/deviceController')
const router = express.Router()



//create device
router.post('/api/device/create', deviceController.createDevice);

//get device data
router.get('/api/device/detail', deviceController.getDeviceData);

//update device data
router.put('/api/device/update', deviceController.updateDeviceData);

//get devices list of home
router.get('/api/device/find-by-home', deviceController.getDevicesListOfHome);

//get devices list of room
router.get('/api/device/find-by-room', deviceController.getDevicesListOfRoom);

//delete device
router.delete('/api/device/delete', deviceController.deleteDevice);

//get temperature and humidity
router.get('/api/device/temperature-humidity',deviceController.getTemperatureAndHumidity);

//get humidity
// router.get('/api/device/humidity',deviceController.getHumidity);

//control device
router.post('/api/device/control', deviceController.controlDevice);

//get devices list of admin
router.get('/api/device/find', deviceController.getDevicesListOfAdmin);

module.exports = router