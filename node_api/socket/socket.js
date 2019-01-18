const Socket = require('socket.io/lib/socket');
const Io = require('socket.io/lib/index');
var io;
var session = require("express-session")({
        secret: "my-secret",
        resave: true,
        saveUninitialized: true
    }),
    sharedsession = require("express-socket.io-session");

var socketmiddleware = function (socket, next) {
    session(socket.handshake, {}, next);
};

export const chatroom = new Map();
export const pvpLobby = new Map();

module.exports = {


    bind: function (server, app) {

        io = require('socket.io')(server);
        app.use(session);
        io.use(socketmiddleware);

        server.listen(3002, function () {
            console.log('listening on *:3002');
        });

        io.on('connection', function (socket) {
            module.exports.onConnect(socket);
            socket.on('disconnect', () => {
                if (!socket.handshake.session.user) {
                    return;
                }
                const user_id = socket.handshake.session.user._id;
                if (!chatroom.has(user_id)) {
                    return;
                }
                const name = chatroom.get(user_id).name;
                socket.broadcast.emit('chatroom leave', name);
                chatroom.delete(user_id);
                module.exports.onDisconnect()
            });
            socket.on('pvp join', (character) => module.exports.onPvpJoin(socket, character));
            socket.on('chatroom move', (position) => module.exports.onChatRoomMove(socket, position));
            socket.on('chatroom leave', () => module.exports.onChatRoomLeave(socket));
            socket.on('chatroom join', (character) => module.exports.onChatRoomJoin(socket, character));
            socket.on('chatroom state', (state) => module.exports.onChatState(socket, state));
            socket.on('chatroom chat', (chat) => module.exports.onChatRoomChat(io, socket, chat));
            socket.on("login", function (user) {
                socket.handshake.session.user = user;
                socket.handshake.session.save();
            });
            socket.on("logout", function (user) {
                socket.handshake.session.user = undefined;
                socket.handshake.session.save();
            });
        });


    },
    onPvpJoin: (socket, character) => {
        if (!socket.handshake.session.user) {
            return;
        }
        if (pvpLobby.has(socket.handshake.session.user._id) && pvpLobby.get(socket.handshake.session.user._id) !== character) {
            socket.broadcast.emit('pvp join', [socket.handshake.session.user._id, character]);
            pvpLobby.set(socket.handshake.session.user._id, character);
            socket.emit('pvp list', pvpLobby);
            console.log('1');
        } else if (pvpLobby.has(socket.handshake.session.user._id)) {
            socket.emit('pvp list', pvpLobby);
            console.log('2');
        } else {
            console.log('3');
            socket.broadcast.emit('pvp join', [socket.handshake.session.user._id, character]);
            pvpLobby.set(socket.handshake.session.user._id, character);
            socket.emit('pvp list', pvpLobby);
        }
    },
    onChatRoomChat: (io, socket, {type, text}) => {
        if (!socket.handshake.session.user) {
            return;
        }
        const user_id = socket.handshake.session.user._id;
        const character = chatroom.get(user_id);
        if (!character) {
            return;
        }
        io.emit('chatroom chat', {id: character.name, type: type, text: text});
    },
    onChatState: (socket, {state, loop, index}) => {
        if (!socket.handshake.session.user) {
            return;
        }
        const user_id = socket.handshake.session.user._id;
        const character = chatroom.get(user_id);
        if (!character) {
            return;
        }
        socket.broadcast.emit('chatroom state', {id: character.name, state: state, loop: loop, index: index});
    },
    onChatRoomMove: (socket, {position, face}) => {
        if (!socket.handshake.session.user) {
            return;
        }
        const user_id = socket.handshake.session.user._id;
        const character = chatroom.get(user_id);
        character.position = position;
        socket.broadcast.emit('chatroom move', {id: character.name, position: position, face: face});
    },
    onChatRoomJoin: (socket, character) => {
        if (!socket.handshake.session.user) {
            return;
        }
        if (!chatroom.has(socket.handshake.session.user._id)) {
            socket.broadcast.emit('chatroom join', character);
        }
        socket.emit('chatroom list', chatroom);
        chatroom.set(socket.handshake.session.user._id, character);
    },
    onChatRoomLeave: (socket) => {
        if (!socket.handshake.session.user) {
            console.log('HANDSHAKE NOT GFOUDN');
            return;
        }
        const user_id = socket.handshake.session.user._id;
        const character = chatroom.get(user_id);
        if (character && character.id) {
            socket.broadcast.emit('chatroom leave', character.id);
            console.log('character left !');
            chatroom.delete(socket.handshake.session.user._id);
        } else {
            console.log('[CHATROOM] CHARACTER NOT FOUND');
        }
    },
    onConnect: (socket) => {
        // socket.sendSystemMessage('Welcome 1');
        // socket.sendSystemMessage('Welcome 2');
        // socket.sendSystemMessage('Welcome 3');
        io.emitClientConnected(socket);
    },
    onDisconnect: () => {
        io.emitClientConnected(null);
    },
    emit: (userId, event, data) => {
        Object.keys(io.sockets.sockets).forEach((s) => {
            if (io.sockets.sockets[s].handshake.session.user && io.sockets.sockets[s].handshake.session.user._id === userId.toString()) {
                io.sockets.sockets[s].emit(event, data);
            }
        });
    },
    getIo: () => {
        return io;
    }
}
;


Io.prototype.emitSystemMessage = function (msg) {
    this.emit('msg_sys', msg);
};

Io.prototype.emitClientConnected = function (socket) {
    let total = this.engine.clientsCount;
    if (!socket) total -= 1;
    this.emit('clients', total);
};

Socket.prototype.sendSystemMessage = function (msg) {
    this.emit('msg_sys', msg);
};
