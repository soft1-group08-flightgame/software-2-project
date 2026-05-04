import os                          # Lets Python read the secret variables from the .env file
import mysql.connector             # Driver that connects Python to the MariaDB database
from dotenv import load_dotenv     # Reads the .env file and loads its values into the system
from flask import Flask, jsonify, request  # Flask = web server | jsonify = sends data as JSON | request = reads URL parameters
from flask_cors import CORS        # Allows the HTML/JS frontend to communicate with this Python server

import config                      # Imports starting game values (starting_money, starting_rank)

# Load the database credentials from the .env file
load_dotenv()

# Create the Flask web server
app = Flask(__name__)

# Allow the browser to call this server (without this, the browser blocks the requests)
CORS(app)


# This function opens a connection to the MariaDB database
# It is called inside each route so the connection stays fresh
def get_db():
    return mysql.connector.connect(
        host=os.environ.get('HOST'),
        database=os.environ.get('DB_NAME'),
        user=os.environ.get('DB_USER'),
        password=os.environ.get('DB_PASS'),
        autocommit=True
    )


# --- ROUTES ---
# A route is a URL that JavaScript can call to get data from the server


# Route 1: returns the player's starting stats when a new game begins
# Example: http://127.0.0.1:5000/newgame?player=Gaetano
@app.route('/newgame')
def newgame():
    # player_name = request.args.get('player')  # Reads the player name from the URL
    return jsonify({
        "status": "success",
        "money": config.starting_money,        # 50000 — from config.py
        "rank":  config.starting_rank,     # 250 — from config.py

        # game rules
        "TRAVEL_FEE" : config.TRAVEL_FEE,                     # travel fee is a constant amount
        "FEE_RATE" : config.FEE_RATE                       # entry fee is 2 % of the prize money
    })


# Route 2: returns all tournaments for a given month from the database
# Example: http://127.0.0.1:5000/get_tournaments?month=January
@app.route('/get_tournaments')
def get_tournaments():
    month_name = request.args.get('month')     # Reads the month name from the URL
    conn = None

    try:
        conn = get_db()                            # Open database connection
        cursor = conn.cursor(dictionary=True)      # dictionary=True returns rows as {key: value} instead of plain lists
        cursor.execute("SELECT * FROM tournaments WHERE month = %s", (month_name,))  # Query the database
        tournaments = cursor.fetchall()            # Get all results
        print(tournaments)

        return jsonify(tournaments)                # Send the list of tournaments to JavaScript as JSON
    except:
        response = {
            'message': 'Invalid Month passed to the URL',
            'status': 400
        }
        json_response = jsonify(response)

        return json_response

    finally:
        # Closes the connection
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@app.errorhandler(404)
def page_not_found(error):
    response = {
        "message": "Invalid endpoint",
        "status": 404
    }
    return jsonify(response)

# Start the server on port 5000 when running: python app.py
if __name__ == '__main__':
    app.run(debug=True, port=5000)