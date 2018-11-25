const Socket = require('socket.io/lib/socket');
const Io = require('socket.io/lib/index');
var io;

module.exports = {

    bind : function(server){
        io = require('socket.io')(server);
        server.listen(3002, function(){
            console.log('listening on *:3002');
        });

        io.on('connection', function(socket){
            module.exports.onConnect(socket);
            socket.on('disconnect', () => {
                module.exports.onDisconnect();
            });
        });

    },
    onConnect : (socket) =>{
        io.emitClientConnected(socket);
    },
    onDisconnect: () => {
        io.emitClientConnected(null);
    }

};

Io.prototype.emitSystemMessage = function(msg) {
    this.emit('msg_sys', msg);
};

Io.prototype.emitClientConnected = function(socket) {
    let total = this.engine.clientsCount;
    if (!socket) total -= 1;
    this.emit('clients', total);
};

Socket.prototype.sendSystemMessage = function (msg) {
   this.emit('msg_sys', msg);
};
