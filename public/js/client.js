const socket = io();
let User_Name = "";
let selectedLocations = ["All"];

// Prompt for username on connection
socket.on('naming', () => {
    User_Name = prompt("Enter your name");
    document.getElementById('u-name').innerText = User_Name;
});

// Load all previous messages from the database
socket.on('load messages', (dbMessages) => {
    updateMessages(dbMessages);
});

// Toggle dropdown visibility for location filter
function toggleDropdown() {
    const dropdown = document.getElementById("dropdown-menu");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Apply location filter and update displayed messages
function applyLocationFilter() {
    const checkboxes = document.querySelectorAll('#dropdown-menu input[type="checkbox"]');
    selectedLocations = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    toggleDropdown();
    socket.emit('load messages'); // Request the latest messages to be reloaded
}

// Update messages in the UI
function updateMessages(messages) {
    const messagesContainer = document.querySelector('.middlesection');
    messagesContainer.innerHTML = ''; // Clear existing messages

    // Render each message with delete button for the sender
    messages.forEach(msg => {
        if (selectedLocations.some(loc => msg.locations.includes(loc))) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.style.alignSelf = msg.username === User_Name ? 'flex-end' : 'flex-start';
            messageElement.setAttribute('data-id', msg.id);  // Set the message ID in the HTML element
            messageElement.innerHTML = `
                <div style="display: flex; flex-direction: column;">
                    <div>
                        <p class="user-name">${msg.username}:</p>
                        <p class="user-message">${msg.message}</p> 
                        <p class="time">${new Date(msg.timestamp).toLocaleString()}</p>  <!-- Display formatted timestamp -->
                    </div>
                    <div style="display: flex;">
                        <button class="del-btn" data-id="${msg.id}" style="display: ${msg.username === User_Name ? 'inline' : 'none'};">DEL</button>
                    </div>
                </div>
            `;
            messagesContainer.prepend(messageElement);
        }
    });

    // Attach event listeners for delete buttons after rendering messages
    document.querySelectorAll('.del-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const messageId = e.target.getAttribute('data-id');
            if (messageId) {
                deleteMessage(messageId);  // Send the message ID to the server
            }
        });
    });

    // Scroll to bottom to show latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send a new message to the server
function sendMessage() {
    const messageInput = document.getElementById('ip');
    const message = messageInput.value;

    if (message.trim() === '') return; // Avoid sending empty messages

    // Send the message with all selected locations at once
    socket.emit('chat message from a user', { message, locations: selectedLocations, username: User_Name });

    messageInput.value = ''; // Clear the input field
}

// Add event listeners for the send button and Enter key
document.getElementById('button').querySelector('button').addEventListener('click', sendMessage);
document.getElementById('ip').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Function to send delete request to the server
function deleteMessage(messageId) {
    socket.emit('delete message', messageId);  // Emit the delete message request to the server
}
