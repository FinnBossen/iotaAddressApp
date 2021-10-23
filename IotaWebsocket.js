"use strict";
exports.__esModule = true;
//require our websocket library
var WebSocketServer = require('ws').Server;
//creating a websocket server at port 9090
var wss = new WebSocketServer({ port: 9090 });
var crypto = require("crypto");
var subscriptionNumberConnections = {};
var connectionSubscriptions = new Map();
var MqttClient = require("@iota/mqtt.js").MqttClient;
var MQTT_ENDPOINT = "https://api.thin-hornet-1.h.chrysalis-devnet.iota.cafe";
var mqttClient = new MqttClient(MQTT_ENDPOINT);
// when a client connects to our sever
wss.on('connection', function (connection) {
    console.log('Client connected');
    // assign connection id add login
    connection.id = crypto.randomBytes(20).toString('hex');
    console.log('Client got id: ' + connection.id + ' assigned');
    sendSuccessfulConnection(connection, { type: 'registeredInWebsocket', websocketId: connection.id });
    //when server gets a message from a connected client
    connection.on('message', function (message) {
        var data;
        //accepting only JSON messages
        try {
            data = JSON.parse(message);
        }
        catch (e) {
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
            for (var _i = 0, _a = connectionSubscriptions.get(connection.id); _i < _a.length; _i++) {
                var subscriptionId = _a[_i];
                mqttClient.unsubscribe(subscriptionId);
                console.log('Removed subscription on closing ' + subscriptionId);
            }
        }
    });
});
function sendUpdateValue(connection, message) {
    sendTo(connection, message);
}
function sendSuccessfulConnection(connection, message) {
    sendTo(connection, message);
}
function sendSubscriptionStatus(connection, message) {
    sendTo(connection, message);
}
function sendTo(connection, message) {
    connection.send(JSON.stringify(message));
}
function addSubscription(connection, address) {
    var connectionId = connection.id;
    var identifier = connection.id + address;
    if (subscriptionNumberConnections[identifier]) {
        console.log("Subscription for address " + address + " and connection Id " + connection.id + " already exists");
    }
    // stores subscription Number in Object on a identifier that combines connection.id and the address
    subscriptionNumberConnections[identifier] = mqttClient.addressOutputs(address, function (topic, data) { return sendUpdateValue(connection, {
        type: 'updateBalance',
        address: address,
        amount: data.output.amount
    }); });
    // add subscription to array so it can later be unsubscribed when client is closed
    var subscriptionId = subscriptionNumberConnections[identifier];
    if (connectionSubscriptions.has(connectionId)) {
        connectionSubscriptions.get(connectionId).push(subscriptionId);
        console.log('Added subscriptionNumber ' + subscriptionId + ' in already existing Array stored in connectionSubscriptions for connectionId ' + connectionId);
    }
    else {
        connectionSubscriptions.set(connectionId, [subscriptionId]);
        console.log('Added subscriptionNumber ' + subscriptionId + ' in new Array stored in connectionSubscriptions for connectionId ' + connectionId);
    }
    console.log("Subscription for address " + address + " was successful is connected with subscriptionId " + subscriptionNumberConnections[identifier]);
    sendSubscriptionStatus(connection, {
        type: 'subscriptionSuccessful',
        address: address,
        subscriptionId: subscriptionNumberConnections[identifier]
    });
}
function removeSubscription(connection, address) {
    var connectionId = connection.id;
    var identifier = connection.id + address;
    if (subscriptionNumberConnections[identifier] === null) {
        console.log("Subscription for address " + address + " and connection Id " + connection.id + " already is unsubscribed");
    }
    // gets subscription number stored in object (key is a combination of connection.id + address)
    var subscriptionId = subscriptionNumberConnections[identifier];
    // Unsubscribes the subscription from mqttClient
    mqttClient.unsubscribe(subscriptionId);
    // removing subscription from subscription array
    if (connectionSubscriptions.has(connectionId)) {
        var array = connectionSubscriptions.get(connectionId);
        var index = connectionSubscriptions.get(connectionId).indexOf(subscriptionId);
        array.splice(index);
        console.log('Removed subscriptionNumber ' + subscriptionId + ' in Array stored in connectionSubscriptions for connectionId ' + connectionId);
    }
    delete subscriptionNumberConnections[identifier];
    sendSubscriptionStatus(connection, { type: 'unSubscriptionSuccessful', address: address, subscriptionId: subscriptionId });
}
