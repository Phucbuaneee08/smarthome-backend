const mqtt = require("mqtt");
const { updateData, retrieveData } = require("./controllers/deviceController");

const options = {
    // Clean session
    // clean: true,
    // connectTimeout: 30000,
    // Auth
    // clientId: "74c1532c-df68-470f-9675-0df3aea06bf5",
};
const broker = "mqtt://broker.hivemq.com:1883";
const topic = "/data_device";

const connectMQTT = () => {
    try {
        const client = mqtt.connect(broker, options);
        console.log("MQTT connected!");
        client.on("connect", () => {
            client.subscribe(topic);
        });
        client.on("message", (tp, msg) => {
            var data = JSON.parse(msg);
            if (!data?.message) {
                updateData(data);
            } else
                data?.message ===
                    "Request to retrieve data of the device from the database" &&
                    retrieveData();
        });
    } catch (err) {
        console.log(err);
    }
};
module.exports = { connectMQTT };
