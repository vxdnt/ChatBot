from flask import Flask, request, jsonify, render_template, send_from_directory
import re
import logging
import pymongo
from threading import Timer
from pymongo import ReturnDocument

# Initialize Flask app
app = Flask(__name__)

# Route for serving ads.txt
@app.route('/ads.txt')
def ads_txt():
    return send_from_directory('.', 'ads.txt')

# Configure logging
logging.basicConfig(level=logging.INFO)

# MongoDB connection URI
uri = "mongodb+srv://vedant:happypeople@sortmyentries01.1qm2a.mongodb.net/?retryWrites=true&w=majority&appName=sortmyentries01"

# Create a new client and connect to the server
client = pymongo.MongoClient(uri, tlsDisableOCSPEndpointCheck=True)
try:
    client.admin.command('ping')  # Test the connection
    logging.info("Connected to MongoDB successfully!")
except Exception as e:
    logging.error(f"Error connecting to MongoDB: {e}")

# MongoDB database and collection
db = client["ticket_reselling"]
user_collection = db["users"]

# Store user state (in-memory)
user_state = {}

# Function to save user data to MongoDB
def save_user_data(user_id):
    user_data = user_state.get(user_id, {})
    if user_data:
        try:
            existing_user = user_collection.find_one({'_id': user_id})
            if existing_user:
                # Update existing user
                user_collection.find_one_and_update(
                    {'_id': user_id},
                    {'$set': user_data},
                    return_document=ReturnDocument.AFTER
                )
                logging.info(f"Updated data for user_id: {user_id}")
            else:
                # Insert new user data
                user_data["_id"] = user_id
                user_collection.insert_one(user_data)
                logging.info(f"Inserted new data for user_id: {user_id}")
        except Exception as e:
            logging.error(f"Error saving user data for user_id {user_id}: {e}")

# Helper functions for validation
def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def is_valid_phone(phone):
    return phone.isdigit() and len(phone) == 10  # Adjust based on region

def clear_user_state(user_id):
    """Clear user state after inactivity or session end."""
    user_state.pop(user_id, None)
    logging.info(f"Cleared state for user_id: {user_id}")

# Homepage route
@app.route("/")
def home():
    return render_template("index.html")

# Success route
@app.route('/success')
def success():
    return render_template('success.html')

# Restart route
@app.route("/restart", methods=["GET"])
def restart():
    user_state.clear()
    return jsonify({"reply": "Chat restarted. Please begin again."})

# Webhook route
@app.route("/webhook", methods=["POST"])
def webhook():
    data = request.json
    user_id = data.get("user_id")
    user_message = data.get("message", "").lower()

    if not user_id:
        return jsonify({"reply": "Invalid user ID."}), 400

    # Initialize user state if not already set
    if user_id not in user_state:
        user_state[user_id] = {"step": 1}
        Timer(600, clear_user_state, args=[user_id]).start()  # Clear state after 10 minutes
        logging.info(f"New session started for user_id: {user_id}")

    # Get current step
    step = user_state[user_id].get("step", 1)

    # Chatbot logic based on steps
    if step == 1:  # Greeting
        user_state[user_id]["step"] = 2
        return jsonify({"reply": "Hi!! Let me help you.", "options": ["Want to Sell", "Want to Buy"]})

    elif step == 2:  # Options
        if "sell" in user_message:
            user_state[user_id]["step"] = 3
            return jsonify({"reply": "Great! You want to sell. Tell me which event it is?"})
        elif "buy" in user_message:
            user_state[user_id]["step"] = 4
            return jsonify({"reply": "Great! You want to buy. Tell me which event you’re interested in?"})
        else:
            return jsonify({"reply": "Please select an option: Want to Sell or Want to Buy."})

    # Selling flow
    elif step == 3:  # Ask event for selling
        user_state[user_id]["event"] = user_message
        user_state[user_id]["step"] = 5
        return jsonify({"reply": "Got it! What ticket category are you selling, and how many tickets?"})

    elif step == 5:  # Ask category
        user_state[user_id]["category"] = user_message
        user_state[user_id]["step"] = 6
        return jsonify({"reply": "At what price do you want to sell one ticket (per category)?"})

    elif step == 6:  # Ask price
        if not user_message.isdigit():
            return jsonify({"reply": "Please provide a valid numeric price."})
        user_state[user_id]["price"] = int(user_message)
        user_state[user_id]["step"] = 7
        return jsonify({"reply": "Got it! Now, may I know your name?"})

    elif step == 7:  # Ask name
        user_state[user_id]["name"] = user_message
        user_state[user_id]["step"] = 8
        return jsonify({"reply": "Thanks! Can you share your 10-digit mobile number?"})

    elif step == 8:  # Ask contact
        if not is_valid_phone(user_message):
            return jsonify({"reply": "Please provide a valid phone number."})
        user_state[user_id]["contact"] = user_message
        user_state[user_id]["step"] = 9
        return jsonify({"reply": "Got it! Lastly, please provide your email address."})

    elif step == 9:  # Ask email
        if not is_valid_email(user_message):
            return jsonify({"reply": "That doesn’t look like a valid email. Please try again."})
        user_state[user_id]["email"] = user_message
        save_user_data(user_id)  # Save data to MongoDB
        user_state[user_id]["step"] = 10
        return jsonify({"reply": "Thank you! We’ll let you know via email or WhatsApp. Click 'Start New Chat' to begin again.", "options": ["Start New Chat"]})

    # Restart chat
    elif step == 10:
        if "start new chat" in user_message:
            user_state[user_id]["step"] = 2
            return jsonify({"reply": "Hi!! Let me help you.", "options": ["Want to Sell", "Want to Buy"]})

    return jsonify({"reply": "Oops! Something went wrong. Please try again."})

# Run Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
