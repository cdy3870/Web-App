from flask import Flask, render_template, url_for, redirect, request, session, flash, g
import os
from functools import wraps
from passlib.hash import sha256_crypt
from google.cloud import datastore

app = Flask(__name__)
app.secret_key = 'secret'

"""datastore_client = datastore.Client()

def store_time(dt):
    entity = datastore.Entity(key=datastore_client.key('visit'))
    entity.update({
        'timestamp': dt
    })

    datastore_client.put(entity)


def fetch_times(limit):
    query = datastore_client.query(kind='visit')
    query.order = ['-timestamp']

    times = query.fetch(limit=limit)

    return times"""

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

@app.route('/signup')
def signup():
	return render_template('CreateProfile.html')

@app.route('/rent')
def rent():
	if "logged_in" in session:
		return render_template('rent.html', username=session['username'], logout=True)
	
	return render_template('rent.html', username="Not signed in", logout=False)

@app.route('/upload')
@login_required
def upload():
	return render_template('upload.html', username=session['username'])

@app.route('/login', methods = ['GET', 'POST'])
def login():
	error = None
	username = None
	if request.method == 'POST':

		pass_hash = sha256_crypt.encrypt(request.form['password'])

		#print(sha256_crypt.verify("admin", pass_hash))

		#SQL query database to get the row with the username
		#verify the hashed password with a hashed version of the input
		if request.form['username'] != 'admin' or request.form['password'] != 'admin':
			error = 'invalid credentials'
		else:
			#store session value as true to indicate login
			session['logged_in'] = True
			flash('you were just logged in')
			session['username'] = request.form['username']
			return redirect(url_for('rent', username=session['username']))
			
	return render_template('login.html', error=error)

@login_required
@app.route('/logout')
def logout():
	session.pop('logged_in', None)
	flash('you were just logged out')
	return redirect(url_for('homepage'))

if __name__ == '__main__':
	app.run(debug=True)
