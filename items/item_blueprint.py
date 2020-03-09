from flask import flash, redirect, session, url_for, render_template, Blueprint, request
from functools import wraps
from items.item import Item
import items.manage 

item_bp = Blueprint('item_blueprint', __name__, template_folder='templates')

def login_required(test):
    @wraps(test)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return test(*args, **kwargs)
        else:
            flash('You need to login first.')
            return redirect(url_for('login'))
    return wrap

@item_bp.route('/rent')
def rent():
	if "logged_in" in session:
		return render_template('rent.html', username=session['username'], logout=True)
	
	return render_template('rent.html', username="Not signed in", logout=False)

@item_bp.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
	if request.method == 'POST':
		item_title = None
		weekly_price = None
		if 'title' in request.form:
		    item_title = request.form['title']
		if 'weekly_price' in request.form:
		    weekly_price = request.form['weekly_price']
		json_result = {}

		item_id = 0

		try:
		    if item_id:
		        item = Item(item_id, title, weekly_price)
		        items.manage.log('saving list item for ID: %s' % item_id)
		        #manage.save_list_item(item)
		    else:
		        items.manage.log('saving new list item')
		        items.manage.create_list_item(Item(None, item_title, weekly_price))
		    json_result['ok'] = True
		except Exception as exc:
		    items.manage.log(str(exc))
		    json_result['error'] = 'The item was not saved.'
	return render_template('upload.html', username=session['username'])

@item_bp.route('/load-items')
def load_items():
    # first we load the list items

    items.manage.log('loading list items.')
    item_list = items.manage.get_list_items()
    json_list = []

    # then we convert it into a normal list of dicts so that we can easily turn
    # it into JSON
    for item in item_list:
        d = item.to_dict()
        d['id'] = str(item.id)
        json_list.append(d)

    responseJson = json.dumps(json_list)
    return flask.Response(responseJson, mimetype='application/json')