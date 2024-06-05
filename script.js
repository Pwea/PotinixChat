const url = new URL(window.location.href).searchParams.get("data") || "unauthorized"
console.log(url)
let passkeyValid = false

// The connection to the database
let socket = 0

if (url != "unauthorized" && url.length == 15) {
    socket = new WebSocket('ws://localhost:8765');
    passkeyValid = true
    // When connected to the database
    socket.onopen = () => {
        console.log("Connected to server!")
        // Get the users
        console.log("Sent request for essentials!")
        socket.send(`["get_essentials", "${currentChannel}", "${url}"]`)
    };
} else {
    passkeyValid = false
}

socket.onerror = (event) => {
    console.error('Error in the connection:', event);
    serverStatus.style.backgroundColor = "red"
};

socket.onclose = () => {
    console.log("Connection to server CLOSED!")
    serverStatus.style.backgroundColor = "red"
};


let currentChannel = 'general';


// All the document elements (undefined until DOM content loads)
let chatWindow = undefined
let messageInput = undefined
let sendButton = undefined
let chatHeader = undefined
let channels = undefined

let userlist = undefined
let popups = undefined
let input_counter = undefined

let serverStatus = undefined

// Messages sent are stored here
const messages = {
    'general': [],
    'brainrot': [],
    'elections': [],
    'gaming': []
};

// The actual channel names are stored here
const channel_names = [
    "🌐 general",
    "💢 brainrot",
    "🔱 elections",
    "🎮 gaming"
]

// All the saved data of the users
let users = [
    // Name, Status(offline=0, online=1), Popup opened (yes=1, no=0), Image link, Roles[Name, Colour], Date Joined
    ["Python", 0, "May 25, 2024", "discord_profile.png", [["Owner", "#000"]], 0],
    ["Great General", 1, "May 28, 2024", "hashir_discord_profile.jpg", [["General", "#0f0"]], 0]
]

const ranks = {
    "Chief Warrant Officer": "#d4af37",
    "Verified": "#fff"
}

let currentUser = undefined

// How many people are online and offline
let onlineCount = 0
let offlineCount = 0

// Executes as soon as the website fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // See? I told you they weren't going to be undefined
    chatWindow = document.getElementById('chat-window');
    messageInput = document.getElementById('message');
    chatHeader = document.getElementById('chat-header');
    channels = document.querySelectorAll('.channel');
    userlist = document.getElementById("user-list");
    popups = document.getElementById("popups");
    serverStatus = document.getElementById("server_status");
    input_counter = document.getElementById("input-counter");

    if (passkeyValid) {
        chatWindow.innerText = "Connecting to server..."
        userlist.innerText = "Connecting to server..."
        // Loading colour
        serverStatus.style.backgroundColor = "orange"
    } else {
        chatWindow.innerText = "❌ You did not login!"
        userlist.innerText = "❌ You did not login!"
        // Loading colour
        serverStatus.style.backgroundColor = "red"
    }

    // Function to send a new message
    const sendMessage = () => {
        const text = messageInput.value.trim();
        if (text) {
            messages[currentChannel].push([currentUser[0], text, new Date().toLocaleDateString()]);
            messageInput.value = '';
            renderMessages(currentChannel);
            chatWindow.scrollTop = chatWindow.scrollHeight;
            if (socket.readyState) {
                console.log("Sent request to register message!")
                try {
                    socket.send(`["add_message", "${currentChannel}", "${currentUser[0]}", "${text}", "${messages[currentChannel][messages[currentChannel].length - 1][2]}"]`);
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            } else {
                console.error("Failed to send message to server do to a server connection error.")
            }
        }
    };

    messageInput.addEventListener('keyup', (e) => {
        input_counter.innerText = `${e.target.value.length}/255`
    });

    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    channels.forEach(channel => {
        if (channel.getAttribute('data-channel') === currentChannel) {
            channel.style.backgroundColor = "#000"
        }
    });
});

function renderMessages(channel) {
    chatWindow.innerHTML = '';
    messages[channel].forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `
            <div class="user_message">
                <img src="profile_pic.png" alt="${currentUser[0]}_profile" width="45px" height="45px">
                <div>
                <p style="margin-top: 1%; color: ${currentUser[2][0][1]}">${message[0]} <span class="timestamp" style="font-size: small; color: grey; margin-top: 0.6%">${message[2]}</span></p>
                <p class="user_message_text">${message[1]}</p>
                </div>
            </div>
        `;
        chatWindow.appendChild(messageElement);
    });
};

function sortUsers() {
    users.sort((user1, user2) => user2[1] - user1[1]);
}

function renderUsers() {
    userlist.innerHTML = '';
    popups.innerHTML = "";
    onlineCount = 0
    offlineCount = 0
    const onlineElement = document.createElement("div")
    onlineElement.className = "user-header"

    sortUsers()

    userlist.appendChild(onlineElement)
    users.forEach((user, index) => {
        if (user[1]) {
            const userElement = document.createElement('div');
            userElement.innerHTML = `
            <button type="button" class="user" onclick="openProfilePopup(${index}, '${(index * 50) + 20}px')">
                <img src="profile_pic.png" alt="Python_profile" width="35px" height="35px">
                <p style="color: ${user[2][0][1]}">${user[0]}</p>
            </button>
        `;

            const popupElement = document.createElement("div")
            popupElement.className = "popup"

            let roles = ""

            user[2].forEach(roleInfo => {
                roles += `<span class="role" style="background-color: ${roleInfo[1]}">${roleInfo[0]}</span>`
            })

            popupElement.innerHTML = `
        <div class="header">
            <img src="black-hole.jpg" alt="Header Image" class="header-image">
        </div>
        <div class="profile-info">
            <div class="avatar">
                <img src="profile_pic.png" alt="Avatar" class="avatar-image">
                <div class="statusOn"></div>
            </div>
            <div class="details">
                <h2>${user[0]}</h2>
                <div style="margin-bottom: 10px"></div>
                <div class="membership">
                    <div class="date">
                        <span class="icon">💫</span>
                        <span>${user[3]}</span>
                    </div>
                    <div class="date">
                        <span class="icon">🌌</span>
                        <span>May 14, 2024</span>
                    </div>
                </div>
                <h4 style="margin-bottom: 10px">Roles</h4>
                <div class="roles">
                    ${roles}
                </div>
            </div>
        </div>`
            userlist.appendChild(userElement);
            popups.appendChild(popupElement)
            onlineCount++
        } else {
            offlineCount++
        }
    });

    const offlineElement = document.createElement("div")
    offlineElement.className = "user-header"
    offlineElement.innerText = `\nOFFLINE – ${offlineCount}`

    userlist.appendChild(offlineElement)

    users.forEach((user, index) => {
        if (!user[1]) {
            const userElement = document.createElement('div');
            userElement.innerHTML = `
            <button type="button" class="user" onclick="openProfilePopup(${index}, '${(index * 50) + 20 + (Math.abs(user[1] - 1) * 30)}px')">
                <img src="profile_pic.png" alt="${user[0]}_profile" width="35px" height="35px" style="opacity: 0.5">
                <p style="color: ${user[2][0][1]}; opacity: 0.5">${user[0]}</p>
            </button>
        `;

            const popupElement = document.createElement("div")
            popupElement.className = "popup"

            let roles = ""

            user[2].forEach(roleInfo => {
                roles += `<span class="role" style="background-color: ${roleInfo[1]}">${roleInfo[0]}</span>`
            })

            popupElement.innerHTML = `
        <div class="header">
            <img src="black-hole.jpg" alt="Header Image" class="header-image">
        </div>
        <div class="profile-info">
            <div class="avatar">
                <img src="profile_pic.png" alt="Avatar" class="avatar-image">
                <div class="statusOff"></div>
            </div>
            <div class="details">
                <h2>${user[0]}</h2>
                <div style="margin-bottom: 10px"></div>
                <div class="membership">
                    <div class="date">
                        <span class="icon">💫</span>
                        <span>${user[3]}</span>
                    </div>
                    <div class="date">
                        <span class="icon">🌌</span>
                        <span>May 14, 2024</span>
                    </div>
                </div>
                <div class="roles">
                    ${roles}
                </div>
            </div>
        </div>`
            userlist.appendChild(userElement);
            popups.appendChild(popupElement)
        }
    })

    onlineElement.innerText = `ONLINE – ${onlineCount}`
};

function changeChannel(index) {
    currentChannel = channel_names[index]
    chatHeader.textContent = currentChannel;
    messageInput.setAttribute('placeholder', `Message ${currentChannel}`);
    currentChannel = currentChannel.slice(3)
    socket.send(`['get_messages', '${currentChannel}']`)
    renderMessages(currentChannel);
}

function changeChannelColor(index, status) {
    const channel = document.querySelectorAll('.channel')[index]
    switch (status) {
        case "hovering":
            if (channel.getAttribute('data-channel') != currentChannel) {
                channel.style.backgroundColor = '#36393f'
            }
            break;
        case "lefthover":
            if (channel.getAttribute('data-channel') != currentChannel) {
                channel.style.backgroundColor = '#ffffff00'
            }
            break;
        case "clicked":
            document.querySelectorAll(".channel").forEach(channel => {
                channel.style.backgroundColor = "#ffffff00"
            });
            channel.style.backgroundColor = '#464a52'
            changeChannel(index)
            break;
    }
}

function openProfilePopup(index, position) {
    const popup = document.querySelectorAll('.popup')[index]

    // If popup not opened
    if (!users[index][5]) {
        popup.style.top = position
        popup.style.display = "block"
        users[index][5] = 1
    } else {
        popup.style.display = "none"
        users[index][5] = 0
    }
}

// If the database responded
socket.onmessage = (event) => {
    let data = eval(event.data)
    console.log("Received data!", data)
    if (data[0] == "get_users") {
        data.splice(0, 1)
        console.log(data)
        data.forEach(user => {
            user[2] = eval(user[2]) || ["Verified"]
            for (let i = 0; i<user[2].length; i++) {
                console.log(user[2])
                user[2][i] = [user[2][i], ranks[user[2]]]
            }
        })
        users = data
        renderUsers()
        console.log("Received users!")

    } else if (data[0] == "get_messages") {
        data.splice(0, 1)
        console.log(data)
        messages[currentChannel] = data
        renderMessages(currentChannel)
        console.log("Received messages and rendered them!")

    } else if (data[0] == "get_essentials") {
        data.splice(0, 1)
        console.log(data)
        // Update users and messages for the new stuff
        data[0].forEach(user => {
            user[2] = eval(user[2]) || ["Verified"]
            for (let i = 0; i<user[2].length; i++) {
                console.log(user[2])
                user[2][i] = [user[2][i], ranks[user[2]]]
            }
        })
        users = data[0]
        messages["general"] = data[1]
        // The user we want to chat with
        currentUser = users[data[2]]
        // Make sure we are online
        currentUser[1] = 1

        renderMessages(currentChannel)
        renderUsers()
        chatWindow.scrollTop = chatWindow.scrollHeight;
        // Get the messages
        serverStatus.style.backgroundColor = "#43b581"
    } else if (data[0] == "update_users") {
        renderUsers()
    } else if (data[0] == "update_messages") {
        renderMessages(currentChannel)
    }
};