# websocket-chat-server

A node.js software that allow clients communicate using WebSockets.

# Require

Refer to the "websocket-chat-client" repository (https://github.com/vavarm/websocket-chat-client) as an example of client.

# Includes

npm modules:
|Name            |Description                                 |Link                                     |
|----------------|--------------------------------------------|-----------------------------------------|
|ws              |WebSocket Library                           |https://www.npmjs.com/package/ws         |
|uuid-random     |Random and unique identifier for each client|https://www.npmjs.com/package/uuid-random|
|chalk           |Syntax highlighting in terminal             |https://www.npmjs.com/package/chalk      |

# Graph

```mermaid
graph LR
A((Client 1: id)) -- Client/Server connection --> S{Server: adress, port}
B((Client 2: id)) -- Client/Server connection --> S
C((Client 3: id)) -- Client/Server connection --> S
A -- Client creates a room --> Y[Room 1: name, password]
B -- Client joins a room --> Y
C -- Client creates a room --> Z[Room 2: name, password]
S -- Server's room --> Y
S -- Server's room --> Z
```
