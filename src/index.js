const express = require('express');
const http = require('http');
const path = require('path');
const socket = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socket(server);

const staticPath = path.join(__dirname, '../puplic');

app.use(express.static(staticPath))


io.on('connection', (socket) => {
    console.log('New Websocket connection');

    socket.on('join', ({username, room}, callback) => {
       const {error, user} = addUser({
            id:socket.id,
            username,
            room
        })
        if (error) {
            return callback(error)
        }


        socket.join(user.room);

        socket.emit('message', generateMessage('Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(message, callback) => {
        // const filter = new Filter()

        // if(filter.isProfane(message)) {
        //     return callback('Profanity is not allowed')
        // }

        const user = getUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', generateMessage(user.username,message))
            callback()
        }
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
    socket.on('sendLocation', (data, callback) => {
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${data.latitude},${data.longitude}`));
            callback();
        }
    })

})




server.listen(port, () => {
    console.log('Server up on port 3000')
})