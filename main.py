from flask import Flask, render_template, url_for, redirect, request, session, flash, g
import os
from functools import wraps
from passlib.hash import sha256_crypt
from items.item_blueprint import item_bp
from user import User
import manage_user

app = Flask(__name__, static_url_path='/static')
app.register_blueprint(item_bp)
app.secret_key = 'secret'



#wrap used to prevent unwanted accesses
def login_required(f):
	@wraps(f)
	def wrap(*args, **kwargs):
		if 'logged_in' in session:
			return f(*args, **kwargs)
		else:
			flash('you need to login first')
			return redirect(url_for('login'))
	return wrap

@app.route('/')
def homepage():
	return render_template('homepage.html')

@app.route('/signup', methods = ['GET', 'POST'])
def signup():
    error = None
    username = None
    pass_hash = None
    email = None
    first_name = None
    last_name = None
    user_id = 0

    if request.method == 'POST':   
        if 'psw' in request.form:
	        pass_hash = sha256_crypt.encrypt(request.form['psw'])
        if 'email' in request.form:
	        email = request.form['email']
        if 'first_name' in request.form:
	        first_name = request.form['first_name']
        if 'last_name' in request.form:
	        last_name = request.form['last_name']
        json_result = {}

        try:
            if user_id:
                user = User(user_id, pass_hash, email, first_name, last_name) 
                manage_user.log('saving user for ID: %s' % user_id)
                manage_user.save_list_item(user)
            else:
                manage_user.log('saving new user')
                manage_user.create_list_item(User(None, pass_hash, email, first_name, last_name))
                return redirect(url_for('homepage'))
            json_result['ok'] = True
        except Exception as exc:
            manage_user.log(str(exc))
            json_result['error'] = 'The item was not saved.'
            

    return render_template('CreateProfile.html')

@app.route('/login', methods = ['GET', 'POST'])
def login():
    error = None
    username = None
    if request.method == 'POST':
        pass_hash_compare = manage_user.get_passhash(request.form['username'])
        if request.form['username'] != 'admin' or request.form['password'] != 'admin':
            error = 'invalid credentials'
        else:
            #store session value as true to indicate login
            session['logged_in'] = True
            flash('you were just logged in')
            session['username'] = request.form['username']
            return redirect(url_for('item_blueprint.rent', username=session['username']))
        if pass_hash_compare != "":
            if not sha256_crypt.verify(request.form['password'], pass_hash_compare):
                error = 'invalid credentials'
            else:
                #store session value as true to indicate login
                session['logged_in'] = True
                flash('you were just logged in')
                session['username'] = request.form['username']
                return redirect(url_for('item_blueprint.rent', username=session['username']))
			
    return render_template('login.html', error=error)

@login_required
@app.route('/profilepage')
def profilepage():
	return render_template('profilepage.html', username=session['username'], logout=True)

@login_required
@app.route('/logout')
def logout():
    session['username'] = ''
    session.pop('logged_in', None)
    flash('you were just logged out')
	
    return redirect(url_for('homepage'))

if __name__ == '__main__':
	app.run(debug=True)
