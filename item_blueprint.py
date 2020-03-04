from flask import Blueprint

item_bp = Blueprint('item_blueprint', __name__, template_folder='templates')

@item_blueprint.route('/rent')
def rent():
    if "logged_in" in session:
		return render_template('rent.html', username=session['username'], logout=True)
	
	return render_template('rent.html', username="Not signed in", logout=False)