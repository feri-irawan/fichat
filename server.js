const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {formatMessage} = require('./utils/messages')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Bot
const botName = {
  username: 'FI BOT',
  id: 0,
  room: 0,
}

// Jika client terhubung
io.on('connection', (socket) => {
  socket.on('joinRoom', ({username, room}) => {
    // Menambah user ke dalam array `users`
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // Pesan selamat datang untuk user
    // Ini hanya akan tampil untuk satu user (yaitu, user yang baru masuk)
    socket.emit('message', formatMessage(botName, 'Selamat datang di FICHAT'))

    // Broadcast jika ada user yang baru masuk
    // Ini hanya akan tampil pada user yang lebih dulu masuk
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(
          botName,
          `<strong class="capitalize">${user.username}</strong> baru saja join ke chat`
        )
      )

    // Mengirim informasi users dan room
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  })

  // Jika ada event message dari client
  socket.on('message', (msg) => {
    const user = getCurrentUser(socket.id)

    io.to(user.room).emit('message', formatMessage(user, msg))
  })

  // Jika client disconnect
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(
          botName,
          `<strong class="capitalize">${user.username}</strong> baru saja keluar dari chat`
        )
      )

      // Mengirim informasi users dan room
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      })
    }
  })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
