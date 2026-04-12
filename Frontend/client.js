import io from 'socket.io-client'

const socket = io('http://localhost:3000')

socket.emit('chat_message', "Hola mundo")