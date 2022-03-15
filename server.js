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
    //str = `id: ${client.id}`;
    //SendMessage(client, str);

    //Method retrieves message from client
    client.on("message", (data) => {
        //parsed data to analyse it
        var dataJSON = JSON.parse(data);
        //Client creates a room
        if (dataJSON.topic == "CreateRoom") {
            PrintDebug("Creating a room");
            //check if the room name is already used or not
            if (
                roomsList
                .map(function(e) {
                    return e.name;
                })
                .indexOf(dataJSON.name) == -1
            ) {
                //create the room
                room = new Room(dataJSON.name, dataJSON.pwd);
                room.addPlayer(client.id);
                roomsList.push(room);

                PrintDebug(room.name);
                PrintDebug(room.pwd);
                PrintDebug(room.info());
                PrintDebug(room.playersList.toString());

                //send room information to the client
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
        else if (dataJSON.topic == "JoinRoom") {
            //check if the room exists
            var index = roomsList
                .map(function(e) {
                    return e.name;
                })
                .indexOf(dataJSON.name);
            if (index != -1) {
                room = roomsList[index];
                if (dataJSON.pwd == room.pwd) {
                    room.playersList.push(client.id);

                    //send room information to the client
                    var str =
                        "Room joined: " +
                        room.info() +
                        " / By: " +
                        client.id +
                        " / Players: " +
                        room.getPlayersList().toString();
                    SendMessage(client, str);
                } else {
                    SendMessage(client, "Wrong Password");
                }
            } else {
                SendMessage(client, "The room doesn't exist");
            }
        }
        //Simple message from client
        else {
            console.log("Player Message");
            console.log(dataJSON);
        }
    });

    //On client disconnection
    client.on("close", () => {
        console.log("A client has disconnected");
        PrintDebug("Removing Client: " + client.id);
        //remove client from the playersList of the room and check if a room is empty (in that case delete the room)
        roomsList.forEach((room) => {
            if (room.getPlayersList().includes(client.id))
                room
                .getPlayersList()
                .splice(room.getPlayersList().indexOf(client.id), 1);
            if (room.getPlayersList().length == 0) {
                roomsList.splice(roomsList.indexOf(room), 1);
            }
        });
    });
});

//Start server method
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