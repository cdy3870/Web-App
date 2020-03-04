from flask import Blueprint

item_blueprint = Blueprint('item_blueprint', __name__)

@item_blueprint.route('/')
def index():
    return "This is an example app"