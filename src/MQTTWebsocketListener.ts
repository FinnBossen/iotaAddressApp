import {addBalanceToAddress} from "./AddressStore";

class MQTTWebsocketListener {
    conn = new WebSocket('ws://localhost:9090');

    constructor() {

        this.conn.onopen = () => {
            console.log("Connected to MQTT WebSocket");
        };
        this.conn.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            console.log("Got message", data);
            try {
                switch (data.type) {
                    case "registeredInWebsocket":
                        console.log("Registered in Websocket with " + data.websocketId)
                        break;
                    case "updateBalance":
                        console.log("Changing amount of " + data.address + " to " + data.amount)
                        addBalanceToAddress(data.address, data.amount)
                        break;
                    case "subscriptionSuccessful":
                        console.log("Subscription for " + data.address + "was successful and is registered with subscription id " + data.subscriptionId)
                        break;
                    case "unSubscriptionSuccessful":
                        console.log("Unsubscription for " + data.address + " with id " + data.subscriptionId + "was successful")
                        break;
                    default:
                        break;
                }
            } catch (e) {
                console.log('Error', e)
            }

        };
        this.conn.onerror = function (err) {
            console.log("Got error", err);
        };
    }

    public addSubscription(addressHash: string) {
        this.conn.send(JSON.stringify({
            type: "subscribe",
            address: addressHash
        }));
    }

    public removeSubscription(addressHash: string) {
        this.conn.send(JSON.stringify({
            type: "unsubscribe",
            address: addressHash
        }));
    }
}

export const MQTTListener = new MQTTWebsocketListener();



