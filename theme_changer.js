// Change themes in PotinixChat

const themes = {
    // Name:  Sidebar,    Chat,     ChatInputBg,ChatInput, TopChat
    "green": ["#1c2824", "#131915", "#131915", "#1c2824", "#081200"]
}

let currentTheme = themes["green"]

document.addEventListener("DOMContentLoaded", () => {
    const sideBar = document.getElementById("sidebar")
    const chat = document.getElementById("chat")
    const chatInputBg = document.getElementById("message-input")
    const chatInput = document.getElementById("message")
    const topChat = document.getElementById("chat-header")

    sideBar.style.backgroundColor = currentTheme[0]
    chat.style.backgroundColor = currentTheme[1]
    chatInputBg.style.backgroundColor = currentTheme[2]
    chatInput.style.backgroundColor = currentTheme[3]
    topChat.style.backgroundColor = currentTheme[4]
})