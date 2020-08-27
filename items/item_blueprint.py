from flask import flash, redirect, session, url_for, render_template, Blueprint, request, Response
from functools import wraps
from items.item import Item
import items.manage
import manage_user as user
import uuid
import json

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


@item_bp.route('/rent', methods=['GET', 'POST'])
def rent():
    if "logged_in" in session:
        return render_template('rent.html', username=session['username'], logout=True)
   
    return render_template('rent.html', username="Not signed in", logout=False)


@item_bp.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    return render_template('upload.html', username=session['username'], logout=True)

@item_bp.route('/pay', methods=['GET', 'POST'])
@login_required
def pay():
    return render_template('pay.html', username=session['username'], logout=True)


@item_bp.route('/load-items/<kind>/<history>')
def load_items(kind, history):
    # first we load the list items
    items.manage.log('loading list items.')

    item_list = items.manage.get_list_items(kind, session['username'], history)
    json_list = []

    # then we convert it into a normal list of dicts so that we can easily turn
    # it into JSON
    for item in item_list:
        d = item.to_dict()
        d['id'] = str(item.id)
        json_list.append(d)

    responseJson = json.dumps(json_list)
    
    return Response(responseJson, mimetype='application/json')

@item_bp.route('/query-items/<category>/<location>/<daily_price_range>', methods=['GET', 'POST'])
def query_items(category, location, daily_price_range):
    item_list = items.manage.get_list_items_query('Item', session['username'], location, category, daily_price_range)
    print(item_list)
    json_list = []
    # then we convert it into a normal list of dicts so that we can easily turn
    # it into JSON
    for item in item_list:
        d = item.to_dict()
        d['id'] = str(item.id)
        json_list.append(d) 
    responseJson = json.dumps(json_list)
    print(responseJson)
    
    return Response(responseJson, mimetype='application/json')



@item_bp.route('/save-item/<kind>', methods=['GET', 'POST'])
def save_item(kind):
    title = None
    item_title = None
    daily_price = 0
    weekly_price = 0
    monthly_price = 0
    description = None
    retail_price = 0
    category = None
    location = None
    uploaded_photo = None   

    if 'title' in request.form:
        item_title = request.form['title']
    if 'daily_price' in request.form:
        daily_price = request.form['daily_price']
    if 'weekly_price' in request.form:
        weekly_price = request.form['weekly_price']
    if 'monthly_price' in request.form:
        monthly_price = request.form['monthly_price']
    if 'description' in request.form:
        description = request.form['description']
    if 'retail_price' in request.form:
        retail_price = request.form['retail_price']
    if 'category' in request.form:
        category = request.form['category']
    if 'location' in request.form:
        location = request.form['location']
    if 'file' in request.files:
        uploaded_photo = request.files['file']

    json_result = {}

    item_id = 0
    try:
        if item_id:
            item = Item(item_id, title, daily_price, weekly_price,
                        monthly_price, description, retail_price, kind)
            items.manage.log('saving list item for ID: %s' % item_id)
            # manage.save_list_item(item)
        else:
            items.manage.log('saving new list item')
            if kind == 'Item':
                blob_url = items.manage.create_image_blob(uploaded_photo, uploaded_photo.filename)
                
                items.manage.create_list_item(Item(
                    None, item_title, daily_price, weekly_price, monthly_price, description, retail_price, kind, renter=session['username'], 
                    category=category, location=location, blob_url=blob_url), kind)
                
            else:
                print("Saving rented item for {}".format(session['username']))
                items.manage.create_list_item(Item(None, item_title, daily_price, weekly_price,
                                              monthly_price, description, retail_price, kind, False, session['username'], past_rented=False), kind)
    except Exception as exc:
        items.manage.log(str(exc))
        json_result['error'] = 'The item was not saved.'

    return Response(json.dumps(json_result), mimetype='application/json')


@item_bp.route('/get-item/<itemid>/<kind>')
def get_item(itemid, kind):
    items.manage.log('retrieving item for ID: %s' % itemid)
    item = items.manage.get_list_item(itemid, kind)
    d = item.to_dict()
    d['id'] = itemid
    return Response(json.dumps(d), mimetype='application/json')


@item_bp.route('/delete-item/<kind>', methods=['POST'])
def delete_item(kind):
    # retrieve the parameters from the request
    item_id = request.form['id']
    json_result = {}
    try:
        items.manage.log('deleting item for ID: %s' % item_id)
        items.manage.delete_list_item(item_id, kind)
        json_result['ok'] = True
    except Exception as exc:
        items.manage.log(str(exc))
        json_result['error'] = 'The item was not removed.'

    return Response(json.dumps(json_result), mimetype='application/json')


@item_bp.route('/change-item/<kind>', methods=['POST'])
def change_item(kind):
    # retrieve the parameters from the request
    item_id = request.form['id']
    json_result = {}
    try:
        items.manage.log('editing item for ID: %s' % item_id)
        items.manage.edit_list_item(item_id, kind)
        json_result['ok'] = True
    except Exception as exc:
        items.manage.log(str(exc))
        json_result['error'] = 'The item was edited.'

    return Response(json.dumps(json_result), mimetype='application/json')


@item_bp.route('/return-item/<itemid>/<kind>', methods=['POST'])
def return_item(itemid, kind):
    # retrieve the parameters from the request
    item_id = request.form['id']
    json_result = {}
    try:
        items.manage.log('editing item for ID: %s' % item_id)
        items.manage.return_list_item(itemid, kind)
        json_result['ok'] = True
    except Exception as exc:
        items.manage.log(str(exc))
        json_result['error'] = 'The item was edited.'

    return Response(json.dumps(json_result), mimetype='application/json')

@item_bp.route('/load-own-data/<username>', methods=['GET', 'POST'])
def load_own_data(username):
    user_name = None
    if username == 'own':
        user_name = session['username']
    else:
        user_name = username
    print(user_name)

    user_list = user.get_own_data(user_name)
    currently_listed_list = items.manage.get_list_items_user('Item', user_name, False)

    json_list = []
    # then we convert it into a normal list of dicts so that we can easily turn
    # it into JSON
    for item in user_list:
        d = item.to_dict()
        d['id'] = str(item.id)
        json_list.append(d) 

    for item in currently_listed_list:
        d = item.to_dict()
        d['id'] = str(item.id)
        json_list.append(d)


    responseJson = json.dumps(json_list)
    return Response(responseJson, mimetype='application/json')
