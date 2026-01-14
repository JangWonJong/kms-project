from waitress import serve

import quardian_controller

serve(quardian_controller.app, host='0.0.0.0', port=5000)

""" from flask import Flask

wsgiapp = Flask(__name__)

@wsgiapp.route("/")
def index():
    return "Hello World!"

from waitress import serve
serve(wsgiapp, listen='*:8080') """