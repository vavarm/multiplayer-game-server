const uuid = require("uuid-random");
const chalk = require("chalk");
const WebSocket = require("ws");
const Room = require("./Room.js");
const wss = new WebSocket.WebSocketServer({ port: 8080 }, () => {
    console.log("server started");
});

//Object that stores player data
var playersData = {
    type: "playerData",
};

var roomsList = [];

//=====WEBSOCKET FUNCTIONS======

//Websocket function that manages connection with clients
wss.on("connection", function connection(client) {
    //Create Unique User ID for player
    client.id = uuid();

    console.log(`Client ${client.id} Connected!`);

    var currentClient = playersData["" + client.id];

    //Send default client data back to client for reference
    str = `id: ${client.id}`;
    SendMessage(client, str);

    //Method retrieves message from client
    client.on("message", (data) => {
        //parsed data to analyse it
        var dataJSON = JSON.parse(data);
        //Client creates a room
        if (dataJSON.topic == "CreateRoom") {
            PrintDebug("Creating a room");
            if (
                roomsList
                .map(function(e) {
                    return e.name;
                })
                .indexOf(dataJSON.name) == -1
            ) {
                room = new Room(dataJSON.name, dataJSON.pwd);
                room.addPlayer(client.id);
                roomsList.push(room);
                //Debug room
                PrintDebug(room.name);
                PrintDebug(room.pwd);
                PrintDebug(room.info());
                PrintDebug(room.playersList.toString());

                var str =
                    "Room created: " +
                    room.info() +
                    " / By: " +
                    client.id +
                    " / Players: " +
                    room.getPlayersList().toString();
                SendMessage(client, str);
            } else {
                SendMessage(client, "The name of the new room is already used");
            }
        }
        //Client joins a room
        // TODO - test this method
        else if (dataJSON.topic == "JoinRoom") {
            var index = roomsList
                .map(function(e) {
                    return e.name;
                })
                .indexOf(dataJSON.name);
            if (index != -1) {
                room = roomLists.index;
                if (dataJSON.pwd == room.pwd) {
                    room.playersList.push(client.id);
                    var str =
                        "Room joined: " +
                        room.toString() +
                        " / By: " +
                        client.id +
                        " / Players: " +
                        room.getPlayersList.toString();
                    SendMessage(client, str);
                } else {
                    SendMessage(client, "Wrong Password");
                }
            } else {
                SendMessage(client, "The room doesn't exist");
            }
        }
        //Client sends a simple message
        else {
            console.log("Player Message");
            console.log(dataJSON);
        }
    });

    //Method notifies when client disconnects
    client.on("close", () => {
        console.log("This Connection Closed!");
        console.log("Removing Client: " + client.id);
    });
});

wss.on("listening", () => {
    console.log("listening on 8080");
});

function PrintDebug(msg) {
    console.log(chalk.hex("#FFA500")(`[DEBUG] ${msg}`));
}

function SendMessage(client, msg) {
    var data = { sender: "server", msg: msg };
    client.send(JSON.stringify(data));
}