let currentThreadId = null;

async function sendMessage() {
    const input = document.getElementById('message');
    const message = input.value;
    input.value = '';
    
    if(!message) return;
    
    // Mostrar mensaje del usuario
    displayMessage(message, 'user');
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                threadId: currentThreadId
            })
        });
        
        const data = await response.json();
        currentThreadId = data.threadId;
        
        // Mostrar respuesta del bot
        displayMessage(data.response.content, 'bot');
    } catch (error) {
        displayMessage('Error al conectar con el asistente', 'bot');
    }
}

function displayMessage(text, type) {
    const chat = document.getElementById('chat');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}