const mysql = require('mysql');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Database connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'G4!t7fN@x2$sTqL8',
    database: 'Myapp'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('MySQL connected');
});

const app = express();
const server = http.createServer(app);
app.use(express.static(__dirname + '/../public'));

const io = new Server(server);

// Function to load all messages from the database and emit them to a client
function loadMessages(socket) {
    db.query('SELECT * FROM messages ORDER BY timestamp', (err, rows) => {
        if (err) throw err;
        const dbMessages = rows.map(row => ({
            id: row.id, 
            message: row.message,
            locations: JSON.parse(row.locations),
            username: row.username,
            timestamp: row.timestamp
        }));
        socket.emit('load messages', dbMessages.reverse());
    });
}

io.on('connection', (socket) => {
    // Prompt the client for a username
    socket.emit('naming');

    // Load all previous messages from the database when a client connects
    loadMessages(socket);

    // Handle a new chat message
    socket.on('chat message from a user', (msgData) => {
        let { message, locations, username } = msgData;
        const locationsJson = JSON.stringify(locations);

        db.query(
            'INSERT INTO messages (message, locations, username) VALUES (?, ?, ?)',
            [message, locationsJson, username],
            (err, result) => {
                if (err) throw err;
                
                // Immediately reload and emit all messages to update clients
                loadMessages(io);
            }
        );
    });

    // Handle message deletion
    socket.on('delete message', (messageId) => {
        db.query('DELETE FROM messages WHERE id = ?', [messageId], (err) => {
            if (err) {
                console.error('Error deleting message:', err);
                return;
            }
            
            // Immediately reload and emit all messages to update clients
            loadMessages(io);
        });
    });
});

server.listen(8000, () => {
    console.log('Server running on port 8000');
});
