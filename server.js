const uuid = require("uuid-random");
const chalk = require("chalk");
const WebSocket = require("ws");
const Room = require("./Room.js");
const wss = new WebSocket.WebSocketServer({ port: 8080 }, () => {
    PrintDebug1("server started");
});

var rooms = [];

//=====WEBSOCKET FUNCTIONS======

//Websocket function that manages connection with clients
wss.on("connection", function connection(client) {
    //Create Unique User ID for client
    client.id = uuid();

    PrintDebug2(`Client ${client.id} Connected!`);

    //Method retrieves message from client
    client.on("message", (data) => {
        //parse data to analyze it
        var dataJSON = JSON.parse(data);
        //Client creates a room
        if (dataJSON.topic == "CreateRoom") {
            PrintDebug2("Creating a room");
            //check if the room name is already used or not
            if (
                rooms
                .map(function(e) {
                    return e.name;
                })
                .indexOf(dataJSON.name) == -1
            ) {
                //create the room
                room = new Room(dataJSON.name, dataJSON.pwd);

                client.username = dataJSON.username;
                room.addClient(client);
                rooms.push(room);

                PrintDebug2(room.name);
                PrintDebug2(room.pwd);
                PrintDebug2(room.info());
                PrintDebug2(
                    room.getClients().map(function(e) {
                        return e.id;
                    })
                );

                //send room information to the client
                var str =
                    "Room created: " +
                    room.info() +
                    " / By: " +
                    client.id +
                    " / Clients: " +
                    room.getClients().map(function(e) {
                        return e.id;
                    });
                var topic = "room";
                SendMessage(client, topic, str);
            } else {
                var topic = "issue";
                SendMessage(
                    client,
                    topic,
                    "The name of the new room is already used",
                    "rnau"
                );
            }
        }
        //Client joins a room
        else if (dataJSON.topic == "JoinRoom") {
            //check if the room exists
            var index = rooms
                .map(function(e) {
                    return e.name;
                })
                .indexOf(dataJSON.name);
            if (index != -1) {
                room = rooms[index];
                if (dataJSON.pwd == room.pwd) {
                    if (
                        room
                        .getClients()
                        .map(function(e) {
                            return e.username;
                        })
                        .indexOf(dataJSON.username) == -1
                    ) {
                        client.username = dataJSON.username;
                        room.addClient(client);

                        //send room information to the client
                        var str =
                            "Room joined: " +
                            room.info() +
                            " / By: " +
                            client.id +
                            " / Clients: " +
                            room.getClients().map(function(e) {
                                return e.id;
                            });
                        var topic = "room";
                        SendMessage(client, topic, str);
                    } else {
                        var topic = "issue";
                        SendMessage(
                            client,
                            topic,
                            "The username is already used in the room",
                            "uau"
                        );
                    }
                } else {
                    var topic = "issue";
                    SendMessage(client, topic, "Wrong Password", "wrongpwd");
                }
            } else {
                var topic = "issue";
                SendMessage(client, topic, "The room doesn't exist", "rde");
            }
        }

        //send Broadcast Message to all clients of the same room
        else if (dataJSON.topic == "BcMsg") {
            console.log("Client's Broadcast Message");
            console.log(dataJSON.BcMsg);
            var topic = "BcMsg";
            rooms.forEach((room) => {
                var index = room.getClients().indexOf(client);
                PrintDebug1(typeof index);
                PrintDebug1("index of the message sender in the room array: " + index);
                if (index != -1) {
                    room.getClients().forEach((c) => {
                        SendMessage(c, topic, dataJSON.BcMsg, dataJSON.sender);
                        PrintDebug1("Message sent");
                    });
                }
            });
        }
    });

    //On client disconnection
    client.on("close", () => {
        PrintDebug3("A client has disconnected");
        PrintDebug3("Removing Client: " + client.id);
        //remove client from the clients of the room and check if a room is empty (in that case delete the room)
        rooms.forEach((room) => {
            if (room.getClients().includes(client))
                room.getClients().splice(room.getClients().indexOf(client), 1);
            if (room.getClients().length == 0) {
                rooms.splice(rooms.indexOf(room), 1);
            }
        });
    });
});

// Start server method
wss.on("listening", () => {
    PrintDebug1("listening on 8080");
});

// print colored debug messages in the terminal
function PrintDebug1(msg) {
    // orange
    console.log(chalk.hex("#FFA500")(`[DEBUG] ${msg}`));
}

function PrintDebug2(msg) {
    // green
    console.log(chalk.hex("#008000")(`[DEBUG] ${msg}`));
}

function PrintDebug3(msg) {
    // red
    console.log(chalk.hex("#B22222")(`[DEBUG] ${msg}`));
}

function SendMessage(client, topic, msg, code = "") {
    var data = { sender: "server", topic: topic, msg: msg, code: code };
    client.send(JSON.stringify(data));
}