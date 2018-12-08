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
            socket.on('disconnect', () => module.exports.onDisconnect());
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
            if (io.sockets.sockets[s].handshake.session.user._id === userId.toString()) {
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
