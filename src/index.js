const express = require('express');
const http = require('http');
const path = require('path');
const socket = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');


const app = express();
const server = http.createServer(app);
const io = socket(server);

const staticPath = path.join(__dirname, '../puplic');

app.use(express.static(staticPath))


io.on('connection', (socket) => {
    console.log('New Websocket connection');

    socket.emit('message', generateMessage('Welcome!'));
    socket.broadcast.emit('message', generateMessage('A new user has joined!'))
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
        socket.broadcast.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${data.latitude},${data.longitude}`));
        callback();
    })

})




server.listen(3000, () => {
    console.log('Server up on port 3000')
})