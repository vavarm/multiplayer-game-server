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

    //Send default client data back to client for reference
    //str = `id: ${client.id}`;
    //SendMessage(client, str);

    //Method retrieves message from client
    client.on("message", (data) => {
        //parse data to analyse it
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
                SendMessage(client, str);
            } else {
                SendMessage(client, "The name of the new room is already used");
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
                    SendMessage(client, str);
                } else {
                    SendMessage(client, "Wrong Password");
                }
            } else {
                SendMessage(client, "The room doesn't exist");
            }
        }
        // TODO: send Broadcast Message to all clients of the same room
        else if (dataJSON.topic == "BcMsg") {
            console.log("Client's Broadcast Message");
            console.log(dataJSON.BcMsg);
            rooms.forEach((room) => {
                var index = room.getClients().indexOf(client);
                PrintDebug1(index);
                if (index != -1) {
                    room.getClients().forEach((c) => {
                        SendMessage(c, dataJSON.BcMsg);
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

function SendMessage(client, msg) {
    var data = { sender: "server", msg: msg };
    client.send(JSON.stringify(data));
}