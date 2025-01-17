from flask import Flask, request, jsonify
import pymongo
import re
import logging

# Initialize Flask app
app = Flask(__name__)

# MongoDB connection
client = pymongo.MongoClient("mongodb+srv://vedant:happypeople@sortmyentries01.1qm2a.mongodb.net/")
db = client["ticket_reselling"]
user_collection = db["users"]

# Configure logging
logging.basicConfig(level=logging.INFO)

# Store user session states
user_sessions = {}

# Helper functions for validation
def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def is_valid_phone(phone):
    return phone.isdigit() and len(phone) == 10

# Save user data to MongoDB
def save_user_data(user_id, user_data):
    try:
        user_collection.update_one({"_id": user_id}, {"$set": user_data}, upsert=True)
        logging.info(f"Saved data for user_id: {user_id}")
    except Exception as e:
        logging.error(f"Error saving user data: {e}")

# Chatbot route
@app.route("/webhook", methods=["POST"])
def webhook():
    data = request.json
    user_id = data.get("user_id")
    user_message = data.get("message", "").lower()

    if not user_id:
        return jsonify({"reply": "Invalid user ID."}), 400

    # Get or initialize user session
    user = user_sessions.setdefault(user_id, {"step": 1})

    if user["step"] == 1:  # Greeting
        user["step"] = 2
        return jsonify({"reply": "Hi! How can I help you?", "options": ["Want to Sell", "Want to Buy"]})

    elif user["step"] == 2:  # Buy or Sell
        if "sell" in user_message:
            user["step"] = 3
            return jsonify({"reply": "What event are you selling tickets for?"})
        elif "buy" in user_message:
            user["step"] = 3
            return jsonify({"reply": "What event are you interested in?"})
        else:
            return jsonify({"reply": "Please choose: Want to Sell or Want to Buy."})

    elif user["step"] == 3:  # Event
        user["event"] = user_message
        user["step"] = 4
        return jsonify({"reply": "What ticket category and quantity?"})

    elif user["step"] == 4:  # Category and Quantity
        user["category"] = user_message
        user["step"] = 5
        return jsonify({"reply": "What is the price per ticket?"})

    elif user["step"] == 5:  # Price
        if not user_message.isdigit():
            return jsonify({"reply": "Please provide a valid price."})
        user["price"] = int(user_message)
        user["step"] = 6
        return jsonify({"reply": "Your name, please?"})

    elif user["step"] == 6:  # Name
        user["name"] = user_message
        user["step"] = 7
        return jsonify({"reply": "Your 10-digit mobile number?"})

    elif user["step"] == 7:  # Contact
        if not is_valid_phone(user_message):
            return jsonify({"reply": "Please provide a valid phone number."})
        user["contact"] = user_message
        user["step"] = 8
        return jsonify({"reply": "Your email address?"})

    elif user["step"] == 8:  # Email
        if not is_valid_email(user_message):
            return jsonify({"reply": "Please provide a valid email address."})
        user["email"] = user_message
        save_user_data(user_id, user)
        user["step"] = 9
        return jsonify({"reply": "Thank you! Your details are saved. Type 'Restart' to start again."})

    elif user_message == "restart":  # Restart chat
        user_sessions[user_id] = {"step": 1}
        return jsonify({"reply": "Chat restarted. How can I help you?"})

    return jsonify({"reply": "Sorry, I didn't understand that. Please try again."})

# Run the app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
