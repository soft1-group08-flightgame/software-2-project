import os
import mysql.connector
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS


import config

# 1. Load the secrets from the .env file into the system
load_dotenv()

# 2. Initialize the Flask web server
app = Flask(__name__)

# 3. Enable CORS so  HTML/JS can talk to this Python server without security errors
CORS(app)

# 4. Connect to MariaDB using the secrets we loaded from .env

config.conn = mysql.connector.connect(
    host=os.environ.get('HOST'),
    database=os.environ.get('DB_NAME'),
    user=os.environ.get('DB_USER'),
    password=os.environ.get('DB_PASS'),
    autocommit=True
)


# --- THE ROUTES (Endpoints) ---

# This route starts a new game.
# Address: http://127.0.0.1:5000/newgame?player=YourName
@app.route('/newgame')
def newgame():
    # Grab the 'player' name from the URL address
    player_name = request.args.get("player")

    # Get the starting values we defined in config.py
    money = config.starting_money
    rank = config.starting_rank

    # Return this data as a JSON object (a format the browser understands)
    return jsonify({
        "status": "success",
        "player": player_name,
        "money": money,
        "rank": rank
    })


# 5. Start the server on port 5000
if __name__ == '__main__':
    # debug=True means the server restarts automatically when you save changes
    app.run(debug=True, port=5000)