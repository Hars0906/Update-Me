const sql = require('mysql');
const db = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'G4!t7fN@x2$sTqL8',
    database: 'Myapp'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected');
});

const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);

app.use(express.static(__dirname + '/../public'));

const { Server } = require('socket.io');
const io = new Server(server);

io.on('connection', (socket) => {
    socket.emit('naming');
    console.log('A user connected');

    // Fetch previous chat messages from the database
    db.query('SELECT user_name, message FROM messages ORDER BY timestamp', (err, results) => {
        if (err) throw err;
        results.forEach(row => {
            socket.emit('chat message', row.message, row.user_name);
        });
    });

    socket.on('chat message from a user', (msg, Unm) => {
        const query = 'INSERT INTO messages (user_name, message) VALUES (?, ?)';
        db.query(query, [Unm, msg], (err) => {
            if (err) throw err;
            io.emit('chat message', msg, Unm);
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(8000, () => {
    console.log('Server running on http://localhost:8000');
});
