const mqtt = require("mqtt");
const { updateData } = require("./controllers/deviceController");

const options = {
    // Clean session
    // clean: true,
    // connectTimeout: 30000,
    // Auth
    // clientId: "74c1532c-df68-470f-9675-0df3aea06bf5",
};
const broker = "mqtt://broker.hivemq.com:1883";
const topic = "datatest";

const connectMQTT = () => {
    try {
        const client = mqtt.connect(broker, options);
        console.log("MQTT connected!");
        client.on("connect", () => {
            client.subscribe(topic);
        });
        client.on("message", (tp, msg) => {
            var data = JSON.parse(msg);

            console.log("Received MQTT msg:", data);
            updateData(data);
        });
    } catch (err) {
        console.log(err);
    }
};
module.exports = { connectMQTT };
