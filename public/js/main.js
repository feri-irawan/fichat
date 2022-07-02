const chatWrapper = document.getElementById('chatWrapper')
const loadingRoom = document.getElementById('loadingRoom')
const chatForm = document.getElementById('chatForm')
const chatMessages = document.getElementById('messagesContainer')

// get username and room from URL
const params = new URLSearchParams(window.location.search)
const username = params.get('username')
const room = params.get('room')

const socket = io()

// Join chat room
socket.emit('joinRoom', {
  username,
  room,
})

// Get room and users
socket.on('roomUsers', ({room, users}) => {
  loadingRoom.classList.add('hidden')
  chatWrapper.classList.remove('hidden')

  outputUsers(users)
})

// Message from server
socket.on('message', (message) => {
  console.log(message)
  outputMessage(message)

  // scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

// message submit
chatForm.onsubmit = (e) => {
  e.preventDefault()

  // get message text from the input
  const msg = e.target.elements.textMessage.value.trim()

  // if message text is empty
  if (!msg) {
    e.target.elements.textMessage.focus()
    return false
  }

  // emit message to server
  socket.emit('message', escapeHtml(msg))

  // Clear the input message
  e.target.elements.textMessage.value = ''
}

// ------------------------------------------------------------
// Output message to DOM
function outputMessage({user, text, time}) {
  const div = document.getElementById('messagesContainer')
  const {username, id, room} = user

  const me = socket.id === id ? true : false

  div.innerHTML += `
  <div class="flex ${me ? 'justify-end' : ''}">
    <div class="p-2 mb-2 max-w-max text-sm bg-rose-200 rounded-t-lg ${
      me ? 'ml-5 rounded-bl-lg' : 'mr-5 rounded-br-lg'
    }">
        <div class="flex justify-between">
        <span class="font-semibold text-rose-500 capitalize">${username}</span>
        <span class="ml-2 text-xs">${time}</span>
        </div>
        <p class="mt-1">${text.replace(/\n/g, '<br />')}</p>
    </div>
  </div>
  `

  window.scrollTo({
    top: div.offsetHeight,
    left: 0,
    behavior: 'smooth',
  })
}

// Add users to DOM
function outputUsers(users) {
  const usersList = document.getElementById('users')
  const usersCount = document.getElementById('usersCount')

  usersList.innerHTML = users.map((user) => user.username).join(', ')
  usersCount.innerHTML = users.length
}

// Escape html
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
