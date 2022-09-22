const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
// ------------------------------------------------------------------------------

io.on('connection', function (socket) {
    console.log('New WebSocket connection');

    socket.on('join', function (options, callback) {

        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error)
        }

        socket.join(user.room);

        // Server sends Welcome message to user.
        socket.emit('message',
            generateMessage('Admin', 'Welcome!'));

        // Server sends message to all connection 
        // if user is joined or disconnected
        socket.broadcast
            .to(user.room)
            .emit('message',
                generateMessage('Admin',
                    `${user.username} has joined!`));

        io.to(user.room)
            .emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        callback()

    })

    // Server chats with client and deliver the updates of message delivered
    socket.on('sendMessage', function (receivedMessage, callback) {

        const user = getUser(socket.id);
        const filter = new Filter()

        // Condition to check if any profanity has found.
        if (filter.isProfane(receivedMessage)) {
            return callback('Profanity is not allowed.')
        }

        io.to(user.room)
            .emit('message',
                generateMessage(user.username, receivedMessage))

        callback()
    })

    // Sharing location link to the client or vice-versa
    socket.on('sendLocation', function (coords, callback) {

        const user = getUser(socket.id);
        io.to(user.room)
            .emit('locationMessage',
                generateLocationMessage(user.username,
                    `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));

        callback()
    })

    // Shows a message if user gets disconnected
    socket.on('disconnect', function () {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room)
                .emit('message',
                    generateMessage('Admin', `${user.username} has left..`))

            io.to(user.room)
                .emit('roomData', {
                    room: user.room,
                    users: getUserInRoom(user.room)
                })
        }
    })
})

// -------------------------------------------------------------------------------
server.listen(port, function () {
    console.log(`Server is up on port ${port}!`);
})
