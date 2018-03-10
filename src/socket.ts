/* External Dependency */
import socketIO from "socket.io";

/* Internal Dependency */
import server from "./server";

export default class SocketIO {
    static io: any = undefined;
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
                io.emit("chat", "Server Respond Hello");
                socket.on("chat", (msg: any) => {
                    console.log("msg: ", msg);
                    io.emit("chat", msg);
                });
                console.log("connected");
            });
        }
    }
}