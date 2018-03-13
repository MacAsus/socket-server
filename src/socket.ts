/* External Dependency */
import socketIO from "socket.io";

/* Internal Dependency */
import server from "./server";

export default class SocketIO {
    static io: any = undefined;
    static lastPlayerID: number = 0;

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
                socket.on("chat", (msg: any) => {
                    const time = Date.now().toString();
                    console.log("msg: ", time);
                    io.emit("chat", time);
                });
                socket.on("newPlayer", function() {
                    socket.player = {
                        id: SocketIO.lastPlayerID++,
                        x: randomInt(100, 400),
                        y: randomInt(100, 400)
                    };
                    socket.emit("allPlayers", getAllPlayers());
                    socket.broadcast.emit("newPlayer", socket.player);
                    socket.on("click", function(data: any) {
                        console.log("click to " + data.x + ", " + data.y);
                        socket.player.x = data.x;
                        socket.player.y = data.y;
                        io.emit("move", socket.player);
                    });
                    socket.on("disconnect", function() {
                        io.emit("remove", socket.player.id);
                    });
                });
                socket.on("test", function() {
                    console.log("test received");
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

function randomInt (low: number, high: number) {
    return Math.floor(Math.random() * (high - low) + low);
}