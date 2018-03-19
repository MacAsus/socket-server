/* External Dependency */
import socketIO from "socket.io";

/* Internal Dependency */
import server from "./server";

export default class SocketIO {
  static io: any = undefined;
  static lastPlayerID: number = 0;
  // room list
  static rooms: Set<number> = new Set();
  static roomTotal: number = 0;

  constructor() {
    console.log("Created Socket IO");
  }

  /**
   * Socket IO Config
   */
  static create(_io: any) {
    if (!SocketIO.io) {
      // if does not exist, then create event listener
      SocketIO.io = _io;
      const io = SocketIO.io;
      io.on("connection", (socket: any) => {
        console.log("Client Connected id: " + socket.id);
        socket.on("globalChat", (msg: any) => {
          console.log("Server got globalChat msg", msg);
          io.emit("globalChat", msg);
        });
        socket.on("newPlayer", (room: number) => {
          socket.room = room;
          socket.join(room);
          socket.player = {
            clientId: undefined,
            serverId: SocketIO.lastPlayerID++,
            x: randomInt(-3, 3),
            y: randomInt(-3, 3),
            room: room
          };

          console.log("newPlayer Entered", socket.player);
          console.log("allPlayers: ", getAllPlayers());
          io.to(socket.id).emit("allPlayers", {userList: getAllPlayers()}); // to sender
          socket.broadcast.emit("newPlayer", socket.player); // send all others except sender
        });
        socket.on("listRoom", () => {
          console.log("현재 룸 리스트", getAllRooms());
          io.to(socket.id).emit("listRoom", getAllRooms());
        });
        socket.on("disconnect", function() {
          socket.player.room = undefined;
          io.emit("remove", socket.player);
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
  Object.keys(SocketIO.io.sockets.connected).forEach(function(socketID) {
    const room = SocketIO.io.sockets.connected[socketID].room;
    SocketIO.rooms.add(room);
  });

  const rooms = Array.from(SocketIO.rooms);
  return rooms;
}

function randomInt(low: number, high: number) {
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
