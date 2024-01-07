const mqtt = require("mqtt");
const { updateData, retrieveData } = require("./controllers/deviceController");

const options = {
    username: 'iot-sensor', 
    password: '27082002' 
};
const broker = "mqtts://5233f9fd02c24818937557bb15993b3f.s2.eu.hivemq.cloud:8883";
const topic = "/data_device";
const connectMQTT = () => {
    try {
        const client = mqtt.connect(broker, options);
        client.on("connect", () => {
            console.log("MQTT connected!");
            client.subscribe(topic);
        });
        client.on("message", (tp, msg) => {
            var data = JSON.parse(msg);
            console.log(data);
            if (!data?.message) {
                updateData(data);
            } else
                console.log(
                    "Request to retrieve data of the device from the database"
                );
        });
    } catch (err) {
        console.log(err);
    }
};
module.exports = { connectMQTT };
