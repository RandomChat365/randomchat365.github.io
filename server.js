document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const startChatBtn = document.getElementById('startChatBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const reqPhotoBtn = document.getElementById('reqPhotoBtn');
    const reportBtn = document.getElementById('reportBtn');
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    const chatMessagesContainer = document.querySelector('.chat-messages-container');
    const nameInput = document.getElementById('name-input'); // Get the name input field

    // Modals
    const ageConfirmModal = document.getElementById('ageConfirmModal');
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const cancelAgeBtn = document.getElementById('cancelAgeBtn');

    const reqPhotoConfirmModal = document.getElementById('reqPhotoConfirmModal');
    const sendReqPhotoBtn = document.getElementById('sendReqPhotoBtn');
    const cancelReqPhotoBtn = document.getElementById('cancelReqPhotoBtn');

    const reportUserModal = document.getElementById('reportUserModal');
    const reportForm = document.getElementById('reportForm');
    const cancelReportBtn = document.getElementById('cancelReportBtn');

    // State variable to simulate chat connection
    let isChatActive = false;
    // Initial userName derived from the input field. Default will be "Stranger" as per HTML.
    let userName = nameInput.value.trim();

    // Helper functions to show/hide modals
    function showModal(modalElement) {
        modalElement.classList.add('show');
    }

    function hideModal(modalElement) {
        modalElement.classList.remove('show');
    }

    // --- Button Event Listeners ---

    // START CHAT Button (initial chat start when page loads or after ending)
    startChatBtn.addEventListener('click', () => {
        if (!isChatActive) {
            userName = nameInput.value.trim(); // Capture current name from input
            if (userName === '') {
                userName = 'Anonymous'; // Fallback if input is empty
                nameInput.value = 'Anonymous'; // Update input if it was blank
            }
            showModal(ageConfirmModal);
        } else {
            alert('You are already in a chat. Click "New Chat" to find another partner.');
        }
    });

    // NEW CHAT Button (ends current chat, then starts new one with age confirm)
    newChatBtn.addEventListener('click', () => {
        if (isChatActive) {
            endCurrentChat(); // End the current chat immediately
        }
        // Always show age confirmation for a new chat
        userName = nameInput.value.trim(); // Capture current name from input for the new chat
        if (userName === '') {
            userName = 'Anonymous'; // Fallback if input is empty
            nameInput.value = 'Anonymous'; // Update input if it was blank
        }
        showModal(ageConfirmModal);
    });

    // REQ PHOTO Button
    reqPhotoBtn.addEventListener('click', () => {
        if (isChatActive) {
            showModal(reqPhotoConfirmModal);
        } else {
            alert('You need to be in a chat to request a photo.');
        }
    });

    // REPORT Button
    reportBtn.addEventListener('click', () => {
        if (isChatActive) {
            showModal(reportUserModal);
        } else {
            alert('You need to be in a chat to report a user.');
        }
    });

    // SEND Message Button
    sendButton.addEventListener('click', () => {
        const messageText = messageInput.value.trim();
        if (messageText && isChatActive) {
            // Use the captured userName for sent messages
            appendMessage(`${userName}: ${messageText}`, 'sent');
            messageInput.value = '';
            // Simulate a response from the "stranger" after a short delay
            setTimeout(() => {
                appendMessage("Stranger: " + getRandomResponse(), 'received');
            }, 1000);
        } else if (!isChatActive) {
            alert('Please start a chat first!');
        }
    });

    // Enable sending message with Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });


    // --- Modal Logic ---

    // Age Confirmation Modal Logic
    confirmAgeBtn.addEventListener('click', () => {
        hideModal(ageConfirmModal);
        startNewChat(); // Start a new chat after age confirmation
    });

    cancelAgeBtn.addEventListener('click', () => {
        hideModal(ageConfirmModal);
        // If they cancel age confirmation, and no chat was active, ensure state is reset
        if (!isChatActive) {
            endCurrentChat(); // Resets button and name input
        }
    });

    // Photo Request Confirmation Modal Logic
    sendReqPhotoBtn.addEventListener('click', () => {
        hideModal(reqPhotoConfirmModal);
        alert('Photo request sent to your chat partner!'); // In a real app, this would send a backend request
    });

    cancelReqPhotoBtn.addEventListener('click', () => {
        hideModal(reqPhotoConfirmModal);
    });

    // Report User Modal Logic
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission
        const reason = document.getElementById('reportReason').value;
        const details = document.getElementById('reportDetails').value;
        const block = document.getElementById('blockUser').checked;

        if (reason) {
            alert(`Report Submitted!\nReason: ${reason}\nDetails: ${details || 'N/A'}\nBlock User: ${block ? 'Yes' : 'No'}`);
            // In a real application, you'd send this data to your server
            hideModal(reportUserModal);
            reportForm.reset(); // Clear the form
            if (block) {
                endCurrentChat(); // Automatically end chat if user is blocked
            }
        } else {
            alert('Please select a reason for the report.');
        }
    });

    cancelReportBtn.addEventListener('click', () => {
        hideModal(reportUserModal);
        reportForm.reset();
    });

    // --- Core Chat Functions ---

    function startNewChat() {
        isChatActive = true;
        chatMessagesContainer.innerHTML = ''; // Clear previous messages
        appendMessage('You are now connected with a new Stranger!', 'system'); // System message
        startChatBtn.textContent = 'CHAT ACTIVE'; // Update button text
        startChatBtn.disabled = true; // Disable until chat ends or new chat clicked
        nameInput.disabled = true; // Disable name input once chat starts
        console.log('New chat started!');
    }

    function endCurrentChat() {
        isChatActive = false;
        appendMessage('You have disconnected from the chat.', 'system'); // System message
        startChatBtn.textContent = 'START CHAT'; // Reset button text
        startChatBtn.disabled = false; // Enable for a new chat
        nameInput.disabled = false; // Enable name input when chat ends
        // Reset name input value to default "Stranger"
        nameInput.value = "Stranger";
        userName = nameInput.value; // Re-sync userName with default
        console.log('Chat ended.');
    }

    function appendMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(type); // 'sent', 'received', or 'system'
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);
        chatMessagesContainer.appendChild(messageDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom
    }

    // A simple function to simulate stranger's responses
    function getRandomResponse() {
        const responses = [
            "Nice to meet you!",
            "How's your day going?",
            "Where are you from?",
            "What do you like to do for fun?",
            "Interesting!",
            "Tell me more.",
            "I'm not sure.",
            "That sounds cool."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Initial state setup (if no chat is active on page load)
    endCurrentChat(); // Ensure chat is not active on load and buttons are ready
});
