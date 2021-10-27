from flask import Flask, render_template, session, redirect, url_for, request, flash, jsonify  
from flask_socketio import SocketIO
from flaskr import create_app

NAME = ""

app = create_app()
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
        if len(name) >= 2:
            session[NAME] = name
            flash(f"You are logged in as {name}.")
            return redirect(url_for("home"))
        else:
            flash("Name must be longer than 1 character.")

    return render_template("login.html")

@app.route("/logout")
def logout():
    """
    logs the user out by removing name from dictionary.
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
    
    """handles saving messages once received from web server
    and sending message to other clients
    :param json: json
    :param methods: POST GET
    :return: None """
    
    socketio.emit('message response', json) 

@app.route("/get_name")
def get_name():
    
    data = {"name": ""}
    if NAME in session:
        data = {"name": session[NAME]}
    return jsonify(data)


if __name__ == '__main__':
    socketio.run(app, debug=True)