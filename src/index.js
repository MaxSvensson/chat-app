const express = require('express');
const http = require('http');
const path = require('path');
const socket = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socket(server);

const staticPath = path.join(__dirname, '../puplic');

app.use(express.static(staticPath))


io.on('connection', (socket) => {
    console.log('New Websocket connection');

    socket.on('join', ({username, room}) => {
        socket.join(room);

        socket.emit('message', generateMessage('Welcome!'));
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`));
    })

    socket.on('messageSend',(message, callback) => {
        const filter = new Filter()

        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.emit('message', generateMessage(message))
        callback()
    })
    socket.on('disconnect', () => {
        io.emit('message', generateMessage('User has left'))
    })
    socket.on('sendLocation', (data, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${data.latitude},${data.longitude}`));
        callback();
    })

})




server.listen(port, () => {
    console.log('Server up on port 3000')
})