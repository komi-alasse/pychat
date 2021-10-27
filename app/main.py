from flask import Flask, render_template, session, redirect, url_for, request, flash, jsonify  
from flask_socketio import SocketIO

NAME = ""

app = Flask(__name__)
app.config['SECRET_KEY'] = 'password'
socketio = SocketIO(app)

@app.route("/login", methods=["POST", "GET"])
def login():
    """
    displays main login page.
    :return: None
    """
    if request.method == "POST": 
        name = request.form["inputName"]
        if len(name) > 0:
            session[NAME] = name
            flash(f"You are logged in as {name}.")
            return redirect(url_for("home"))
        else:
            flash("Name must be at least one character.")

    return render_template("login.html")

@app.route("/logout")
def logout():
    """
    logs the user out by removing name from session.
    :return: None
    """
    session.pop(NAME)
    flash("You were logged out.")
    return redirect(url_for("login"))

@app.route('/')
@app.route('/home')
def home():
    if NAME not in session:
        return redirect(url_for("login"))   
    return render_template("index.html")

@socketio.on('event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    socketio.emit('message response', json) 

@app.route("/get_name")
def get_name():
    data = {"name": ""}
    if NAME in session:
        data = {"name": session[NAME]}
    return jsonify(data)


if __name__ == '__main__':
    socketio.run(app, debug=True)