/* External Dependency */
import socketIO from "socket.io";

/* Internal Dependency */
import server from "./server";

export default class SocketIO {
    static io: any = undefined;
    static lastPlayerID: number = 0;
    // room list
    static rooms: any = [];
    static roomTotal: number = 0;

    constructor() {
        console.log("Created Socket IO");
    }

    /**
     * Socket IO Config
     */
    static create(_io: any) {
        if (!SocketIO.io) { // if does not exist, then create event listener
            SocketIO.io = _io;
            const io = SocketIO.io;
            io.on("connection", (socket: any) => {
                console.log("Client Connected id: " + socket.id);
                socket.on("globalChat", (msg: any) => {
                    console.log("Server got globalChat msg", msg);
                    io.emit("globalChat", msg);
                });
                socket.on("enterRoom", (room: number) => {
                    console.log("Client Entered");
                    socket.room = room;
                    socket.join(room);
                    socket.player = {
                        serverId: SocketIO.lastPlayerID++,
                        x: randomInt(-3, 3),
                        y: randomInt(-3, 3),
                        room: room
                    };

                    console.log("Client Enter: ", room, "id: ", socket.player.serverId);
                    io.to(socket.id).emit("roomUpdate", socket.player); // emit to sender
                    socket.to(socket.player.room).emit("roomUpdate", socket.player); // emit without sender
                });
                socket.on("listRoom", () => {
                    console.log("현재 룸 리스트", getAllRooms());
                    io.to(socket.id).emit("listRoom", getAllRooms());
                });
                // Todo: Only Demo
                socket.on("newPlayer", function() {
                    socket.player = {
                        serverId: SocketIO.lastPlayerID++,
                        x: randomInt(100, 400),
                        y: randomInt(100, 400),
                        room: undefined
                    };
                    socket.emit("allPlayers", getAllPlayers());
                    socket.broadcast.emit("newPlayer", socket.player);
                });
                socket.on("click", function(data: any) {
                    console.log("click to " + data.x + ", " + data.y);
                    socket.player.x = data.x;
                    socket.player.y = data.y;
                    io.emit("move", socket.player);
                });
                socket.on("disconnect", function() {
                    io.emit("remove", socket.serverId);
                });
                socket.on("test", function() {
                    console.log("test received");
                });
                socket.on("userPos", (_data: string) => {
                    if (isChangedPos(socket, _data)) {
                        console.log("socket.player is", socket.player);
                        socket.to(socket.player.room).emit("userPos", socket.player); // emit without sender
                    }
                });
            });
        }
    }
}

function getAllPlayers() {
    const players: number[] = [];
    Object.keys(SocketIO.io.sockets.connected).forEach(function(socketID) {
        const player = SocketIO.io.sockets.connected[socketID].player;
        if (player) players.push(player);
    });
    return players;
}

function getAllRooms() {
    const rooms: number[] = [];
    Object.keys(SocketIO.io.sockets.connected).forEach(function(socketID) {
        const room = SocketIO.io.sockets.connected[socketID].room;
        if (room) rooms.push(room);
    });
    return rooms;
}

function randomInt (low: number, high: number) {
    return Math.floor(Math.random() * (high - low) + low);
}

function isChangedPos(socket: any, _data: any) {
    const data = JSON.parse(_data);
    const playerId = data[0];
    let isChanged = false;

    if (socket.player.x != data[1]) {
        socket.player.x = data[1];
        isChanged = true;
    }
    if (socket.player.y != data[2]) {
        socket.player.y = data[2];
        isChanged = true;
    }

    return isChanged;
}