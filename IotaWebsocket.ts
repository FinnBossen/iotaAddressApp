//require our websocket library
const WebSocketServer = require('ws').Server;

//creating a websocket server at port 9090
const wss = new WebSocketServer({port: 9090});

const crypto = require("crypto");

const subscriptionNumberConnections = {};

const connectionSubscriptions: Map<string, string[]> = new Map<string, string[]>();

type subscriptionStatusMessage = {
    type: 'subscriptionSuccessful' | 'unSubscriptionSuccessful'
    address: string
    subscriptionId: number
}

type connectedMessage = {
    type: 'registeredInWebsocket'
    websocketId: string
}

type subscriptionAmountMessage = {
    type: 'updateBalance'
    address: string
    amount: number
}

const {MqttClient} = require("@iota/mqtt.js");

const MQTT_ENDPOINT = "https://api.thin-hornet-1.h.chrysalis-devnet.iota.cafe";

const mqttClient = new MqttClient(MQTT_ENDPOINT);


// when a client connects to our sever
wss.on('connection', function (connection) {

    console.log('Client connected');
    // assign connection id add login
    connection.id = crypto.randomBytes(20).toString('hex');
    console.log('Client got id: ' + connection.id + ' assigned')
    sendSuccessfulConnection(connection, {type: 'registeredInWebsocket', websocketId: connection.id})

    //when server gets a message from a connected client
    connection.on('message', function (message) {

        let data;
        //accepting only JSON messages
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.log('Invalid JSON');
            data = {};
        }

        // switching type of the client message
        switch (data.type) {

            //when a client wants to subscribe a iota address
            case 'subscribe':
                console.log('Trys to add subscription for ' + connection.id + ' and address ' + data.address);
                addSubscription(connection, data.address);
                break;

            case 'unsubscribe':
                console.log('Address is unsubscribing: ', data.address);
                removeSubscription(connection, data.address);
                break;

            default:
                sendTo(connection, {
                    type: 'error',
                    message: 'Command not found: ' + data.type
                });

                break;
        }
    });

    //when client exits (closes Browser)
    connection.on('close', function () {
        console.log('Client Connection for id ' + connection.id + ' is closed');
        // closing all subscriptions that are still open for the client
        if (connectionSubscriptions.has(connection.id)) {
            for (const subscriptionId of connectionSubscriptions.get(connection.id)) {
                mqttClient.unsubscribe(subscriptionId);
                console.log('Removed subscription on closing ' + subscriptionId);
            }
        }
    });

});

function sendUpdateValue(connection, message: subscriptionAmountMessage) {
    sendTo(connection, message);
}

function sendSuccessfulConnection(connection, message: connectedMessage) {
    sendTo(connection, message);
}

function sendSubscriptionStatus(connection, message: subscriptionStatusMessage) {
    sendTo(connection, message);
}

function sendTo(connection, message) {
    connection.send(JSON.stringify(message));
}

function addSubscription(connection: any, address: string) {
    const connectionId = connection.id;
    const identifier = connection.id + address;
    if (subscriptionNumberConnections[identifier]) {
        console.log("Subscription for address " + address + " and connection Id " + connection.id + " already exists");
    }
    // stores subscription Number in Object on a identifier that combines connection.id and the address
    subscriptionNumberConnections[identifier] = mqttClient.addressOutputs(address, (topic, data) => sendUpdateValue(connection, {
        type: 'updateBalance',
        address: address,
        amount: data.output.amount
    }))

    // add subscription to array so it can later be unsubscribed when client is closed
    const subscriptionId = subscriptionNumberConnections[identifier];
    if (connectionSubscriptions.has(connectionId)) {
        connectionSubscriptions.get(connectionId).push(subscriptionId);
        console.log('Added subscriptionNumber ' + subscriptionId + ' in already existing Array stored in connectionSubscriptions for connectionId ' + connectionId);
    } else {
        connectionSubscriptions.set(connectionId, [subscriptionId]);
        console.log('Added subscriptionNumber ' + subscriptionId + ' in new Array stored in connectionSubscriptions for connectionId ' + connectionId);
    }
    console.log("Subscription for address " + address + " was successful is connected with subscriptionId " + subscriptionNumberConnections[identifier]);
    sendSubscriptionStatus(connection, {
        type: 'subscriptionSuccessful',
        address,
        subscriptionId: subscriptionNumberConnections[identifier]
    });
}

function removeSubscription(connection: any, address: string) {
    const connectionId = connection.id;
    const identifier = connection.id + address;
    if (subscriptionNumberConnections[identifier] === null) {
        console.log("Subscription for address " + address + " and connection Id " + connection.id + " already is unsubscribed");
    }
    // gets subscription number stored in object (key is a combination of connection.id + address)
    const subscriptionId = subscriptionNumberConnections[identifier];

    // Unsubscribes the subscription from mqttClient
    mqttClient.unsubscribe(subscriptionId);

    // removing subscription from subscription array
    if (connectionSubscriptions.has(connectionId)) {
        let array = connectionSubscriptions.get(connectionId);
        let index = connectionSubscriptions.get(connectionId).indexOf(subscriptionId);
        array.splice(index);
        console.log('Removed subscriptionNumber ' + subscriptionId + ' in Array stored in connectionSubscriptions for connectionId ' + connectionId);
    }

    delete subscriptionNumberConnections[identifier];
    sendSubscriptionStatus(connection, {type: 'unSubscriptionSuccessful', address, subscriptionId});
}

export {}
