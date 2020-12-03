const express = require('express')
const { v4 : uuidv4} = require('uuid')  //for creating a unique url
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {ExpressPeerServer} = require('peer')   //p2p -- documentation
const peerServer = ExpressPeerServer(server, {
    debug: true
})

//setting the view engine to ejs
app.use(express.static('public'))
app.set('view engine', 'ejs')

//url's
app.use('/peerjs', peerServer)

//unique url
app.get('/', (req,res) => {
    res.redirect(`/${uuidv4()}`)
})

//creating unique roomID
app.get('/:room', (req,res) => {
    res.render('room', {roomId: req.params.rooms})
})

//broadcast user connected
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) =>{
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)
        socket.on('message', message=>{
            io.to(roomId).emit('createMessage', message)
        })
    })
})

//port
server.listen(process.env.PORT||5000)

