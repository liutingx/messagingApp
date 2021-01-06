const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const expressWS = require('express-ws')

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

const ROOM = {}

const app = express()
//enhance app for websocket support
const appWS = expressWS(app)

app.use(morgan('combined'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.ws('/chat', (ws, req) => {
    const name = req.query.name
    console.log(`New websocket connection: ${name}`)
    //add the web socket connection to the room
    ws.participantName = name
    ROOM[name] = ws
    const welcome = JSON.stringify({
        from: 'server', 
        message: `Welcome ${name}`,
        timestamp: (new Date()).toString()
    })
    //broadcast to everyone in the room
    for(let p in ROOM) {
        ROOM[p].send(welcome)
    }
    //setup
    ws.on('message', (payload) => {
        console.log('payload:', payload)

        //construct message and stringify it
        const chat = JSON.stringify({
            from: name, 
            message: payload,
            timestamp: (new Date()).toString()
        })
        //broadcast to everyone in the room
        for(let p in ROOM) {
            ROOM[p].send(chat)
        }
    })

    ws.on('close', () => {
        console.log(`Closing websocket connection for: ${name}`)
        
        //close our end of the connection
        ROOM[name].close()
        //remove ourself from the room
        delete ROOM[name]
        const goodbye = JSON.stringify({
            from: 'server', 
            message: `Goodbye ${name}`,
            timestamp: (new Date()).toString()
        })
        //broadcast to everyone in the room
        for(let p in ROOM) {
            ROOM[p].send(goodbye)
        }
        
    })
})

app.listen(PORT, () => {
    console.log(`Application started at PORT ${PORT} at ${new Date()}`)
})