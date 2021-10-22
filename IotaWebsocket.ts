//require our websocket library

const WebSocketServer = require('ws').Server;

//creating a websocket server at port 9090
const wss = new WebSocketServer({port: 9090});


const crypto = require("crypto");

//all connected to the server users
type Address = {
    clients: [],
    subscriptionNumber: number
}

class connectionSubscription {
    connection: any
    subscriptionNumber: number

    constructor(connection: any, subscriptionNumber: number) {
        this.connection = connection;
        this.subscriptionNumber = subscriptionNumber;
    }
}

const subscriptionNumberConnections = {};

type subscriptionMessage = {
    type:  string
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
    sendTo(connection, {type: 'registeredInWebsocket', websocketId: connection.id})

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
        console.log('Client Connection for id ' + connection.id + ' is closed')
    });

});

function sendUpdateValue(connection, message: subscriptionMessage) {
    sendTo(connection, message);
}

function sendTo(connection, message) {
    connection.send(JSON.stringify(message));
}

function addSubscription(connection: any, address: string) {

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
    console.log("Subscription for address " + address + " was successful is connected with subscriptionId " + subscriptionNumberConnections[identifier]);
    sendTo(connection,{type: 'subscriptionSuccessful',address, subscriptionId: subscriptionNumberConnections[identifier] })
}

function removeSubscription(connection: any, address: string) {
    const identifier = connection.id + address;
    if (subscriptionNumberConnections[identifier] === null) {
        console.log("Subscription for address " + address + " and connection Id " + connection.id + " already is unsubscribed");
    }
    // gets subscription number stored in object (key is a combination of connection.id + address)
    const subscriptionId = subscriptionNumberConnections[identifier];

    // Unsubscribes the subscription from mqttClient
    mqttClient.unsubscribe(subscriptionId);

    delete subscriptionNumberConnections[identifier];
    sendTo(connection,{type: 'unSubscriptionSuccessful', address, subscriptionId })
}

export {}
