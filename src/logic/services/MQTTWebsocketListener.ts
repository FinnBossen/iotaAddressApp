import {addBalanceToAddress} from "../store/AddressStore";

class MQTTWebsocketListener {
    // the port where our local websocket runs
    // local port probably makes problems when we want to test on android/ios
    conn = new WebSocket('ws://localhost:9090');

    constructor() {

        this.conn.onopen = () => {
            console.log("Connected to MQTT WebSocket");
        };

        // Listens to all the messages send from the websocket
        // And sorts them by type
        this.conn.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            console.log("Got message", data);
            try {
                switch (data.type) {
                    case "registeredInWebsocket":
                        console.log("Registered in Websocket with " + data.websocketId)
                        break;
                    case "updateBalance":
                        // changes amount with values that the websocket got from his mqtt subscription
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

    // sends to the websocket that it should add a subscription for the address
    // when now a amount change happens it will be send back to the client above
    public addSubscription(addressHash: string) {
        this.conn.send(JSON.stringify({
            type: "subscribe",
            address: addressHash
        }));
    }
    // sends to the websocket that it should remove a subscription for the address
    public removeSubscription(addressHash: string) {
        this.conn.send(JSON.stringify({
            type: "unsubscribe",
            address: addressHash
        }));
    }
}

export const MQTTListener = new MQTTWebsocketListener();



