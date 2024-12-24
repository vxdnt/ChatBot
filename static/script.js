document.addEventListener('DOMContentLoaded', () => {
    displayGreeting();
});

// Function to display the initial greeting and options
function displayGreeting() {
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML += `<p><img src="static/images/pfp5.png" alt="Bot" style="width: 25px; height: 25px; vertical-align: middle; margin-right: 5px; border-radius: 50%; border: 1px solid #000000;"> Hi!! Let me help you.</p>`;
    displayOptions(["Want to Sell", "Want to Buy"]);
}

// Function to display selectable options (buttons)
function displayOptions(options) {
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';  // Clear any previous options

    // Hide the text input and send button while displaying options
    document.getElementById('userInput').style.display = 'none';
    document.getElementById('sendButton').style.display = 'none';

    // Check if options include "Start New Chat"
    if (options.includes('Start New Chat')) {
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Start New Chat';
        restartButton.className = 'option-btn';
        restartButton.onclick = () => startNewChat();
        optionsContainer.appendChild(restartButton);
    } else {
        // Create buttons for other options
        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'option-btn';
            button.onclick = () => sendMessage(option);
            optionsContainer.appendChild(button);
        });
    }

}

// Function to send the user's message to the server and handle the response
function sendMessage(userMessage) {
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;

    // Clear options after selection
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    fetch('/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: "12345", message: userMessage })
    })
    .then(response => response.json())
    .then(data => {
        chatbox.innerHTML += `<p><img src="static/images/pfp5.png" alt="Bot" style="width: 25px; height: 25px; vertical-align: middle; margin-right: 5px; border-radius: 50%; border: 1px solid #000000;"> ${data.reply}</p>`;
        chatbox.scrollTop = chatbox.scrollHeight;  // Scroll to the latest message

        // If there are new options to display, show them
        if (data.options) {
            displayOptions(data.options);
        } else {
            // Show input field when direct user input is required
            document.getElementById('userInput').style.display = 'block';
            document.getElementById('sendButton').style.display = 'block';
        }
    });
}

// Function to handle text input (when buttons are not present)
function sendTextMessage() {
    const userInput = document.getElementById('userInput');
    const userMessage = userInput.value.trim();

    if (userMessage) {
        sendMessage(userMessage);
        userInput.value = '';  // Clear the input field
    }
}

//share
const shareButton = document.getElementById('share-button');
const sharePopup = document.getElementById('share-popup');
const copyLinkButton = document.getElementById('copy-link');

// Toggle popup visibility
shareButton.addEventListener('click', (event) => {
  event.preventDefault(); // Prevent default anchor behavior
  
  const buttonRect = shareButton.getBoundingClientRect();
  
  // Position the popup below the button, slightly to the right
  const popupX = buttonRect.left + buttonRect.width / 2 - sharePopup.offsetWidth / 2 + 20; // 20px to the right of the center
  const popupY = buttonRect.bottom + 10; // 10px below the button
  
  // Set popup position
  sharePopup.style.left = `${popupX}px`;
  sharePopup.style.top = `${popupY}px`;

  // Toggle visibility of popup
  sharePopup.classList.toggle('hidden');
});

// Close popup when clicking outside
document.addEventListener('click', (event) => {
  if (!sharePopup.contains(event.target) && !shareButton.contains(event.target)) {
    sharePopup.classList.add('hidden');
  }
});

// Copy link functionality
copyLinkButton.addEventListener('click', () => {
  const link = 'https://www.sortmyentries.in'; // Replace YOUR_URL with the URL you want to share
  navigator.clipboard.writeText(link).then(() => {
    alert('Link copied to clipboard!');
  }).catch((err) => {
    alert('Failed to copy link: ', err);
  });
});


//trying to join pages

// JavaScript to open Terms of Use content in the chat screen
document.getElementById('terms-icon').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default anchor action
    
    // Get the chat container element (replace 'chatbox' with your actual chat container ID)
    const chatbox = document.getElementById('chatbox');
    
    // Inject the Terms and Conditions content
    chatbox.innerHTML = `
        <div class="container">
            <section class="content">
                <!-- Start of Terms and Conditions -->
                <h4>Terms & Conditions</h4>

                <p style="font-size: 0.8rem;">Welcome to Sortmyentries! By using our services, you agree to these Terms and Conditions, which govern the use of our platform. Sortmyentries serves as an offline ticketing partner, facilitating connections between buyers and sellers of event tickets. We operate strictly as a connector and are not responsible for transactions or the outcomes of deals between the parties. We prioritize official offline promoters to create a secure and reliable environment for event ticketing.</p>
                <p style="font-size: 0.8rem;">Sortmyentries provides a platform where sellers can list their tickets for a nominal fee, and buyers can connect with sellers directly to inquire about available tickets. <strong>In future, we are going to monetize this platform where sellers need to pay for listing their tickets on our platform</strong>. Buyers, on the other hand, can access the platform and connect with sellers free of charge. The details of the events and contact information of the parties are shared through our platform, but the transactions and agreements between buyers and sellers are managed independently without any involvement from Sortmyentries.</p>
                <p style="font-size: 0.8rem;"><strong>We do not require account creation</strong> on our platform. All interactions are conducted through the direct exchange of information facilitated by our team. Sellers are responsible for providing accurate and complete details about their tickets, while buyers must verify ticket details and coordinate arrangements directly with sellers. Promoters who use our services are required to ensure their listings are authentic and comply with all applicable laws. We emphasize the importance of engaging with <strong>official offline promoters</strong> to minimize fraudulent activities and maintain the integrity of the platform.</p>
                <p style="font-size: 0.8rem;">Sortmyentries collects data such as names, mobile numbers, email addresses, event preferences, and other relevant information to facilitate connections between buyers and sellers. We handle this data responsibly and only use it for the purpose of ticketing facilitation. <strong>We do not share user information with third parties</strong> except as necessary to establish connections between buyers and sellers.</p>
                <p style="font-size: 0.8rem;"><strong>It is essential to note that Sortmyentries is not involved in the financial transactions or delivery of tickets.</strong> We do not verify the authenticity of tickets or mediate disputes between parties. Our role is limited to providing a platform for communication. Buyers and sellers are solely responsible for ensuring the accuracy of the information they provide and for fulfilling their obligations in any ticket transaction.</p>
                <p style="font-size: 0.8rem;"><strong>Fees paid for ticket listings or event promotions are non-refundable.</strong> Sellers and promoters are expected to comply with all legal and ethical standards while using our services. Sortmyentries reserves the right to remove any listings, refuse service, or terminate access for users who violate these Terms or engage in fraudulent activities.</p>
                <p style="font-size: 0.8rem;">We strongly encourage users to avoid prohibited activities such as providing false or misleading information, engaging in scams, or attempting to resell tickets illegally. Such actions undermine the integrity of the platform and may result in immediate removal from our services.</p>
                <p style="font-size: 0.8rem;">Sortmyentries may update these Terms and Conditions periodically to ensure they reflect the current operations and services offered. Users are advised to review these Terms regularly to stay informed of any changes. By continuing to use the platform, you agree to the updated Terms.</p>
                <p style="font-size: 0.8rem;">For further assistance or inquiries, you can reach us via email at <a href="mailto:sortmyentrieshq@gmail.com">sortmyentrieshq@gmail.com</a>. We are committed to providing a seamless experience and fostering reliable connections between buyers and sellers.</p>
                <!-- End of Terms and Conditions -->
            </section>
        </div>
    `;
    

    document.getElementById('userInput').style.display = 'none';
    document.getElementById('sendButton').style.display = 'none';

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    // Show a button or link to restart the chat
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Start New Chat';
    restartButton.className = 'option-btn';
    restartButton.onclick = () => startNewChat();
    chatbox.appendChild(restartButton);

});

// Function to restart the chat
function startNewChat() {
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML = '';

    fetch('/restart', {
        method: 'GET', // 'GET' is fine for your '/restart' route
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to restart session');
        }
        return response.json();
    })
    .then(data => {
        console.log('Session restarted:', data.message);  // Log the success message
        // Optionally, you can update the UI here after session restart
    })
    .catch(error => {
        console.error('Error restarting session:', error);
    });

    displayGreeting()
    
}


setTimeout(() => {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}, 2000);
