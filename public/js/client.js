const socket = io();
let User_Name = "";

socket.on('naming', () => {
    User_Name = prompt("Enter your name");
    document.getElementById('u-name').innerText = User_Name;
});

function sendMessage() {
    const messageInput = document.getElementById('ip');
    const message = messageInput.value;

    socket.emit('chat message from a user', message, User_Name);

    messageInput.value = '';
}

document.getElementById('button').querySelector('button').addEventListener('click', sendMessage);

document.getElementById('ip').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
        event.preventDefault();
    }
});

socket.on('chat message', function (msg, Unm) {
    const messagesContainer = document.querySelector('.middlesection');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    if (User_Name === Unm) {
        messageElement.style.alignSelf = 'flex-end';
        messageElement.innerHTML = `<p class="user-message">${msg}</p>`;
    } else {
        messageElement.style.alignSelf = 'flex-start';
        messageElement.innerHTML = `<p class="user-name">${Unm}:</p><p class="user-message">${msg}</p>`;
    }

    messagesContainer.appendChild(messageElement);
});
