from flask import Flask, render_template, url_for, redirect, request, session, flash, g
import os
from functools import wraps

app = Flask(__name__)

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

@login_required
@app.route('/')
def rent():
	return render_template('rent.html')

@login_required
@app.route('/upload')
def upload():
	return render_template('upload.html')

@app.route('/login', methods = ['GET', 'POST'])
def login():
	error = None
	if request.method == 'POST':
		if request.form['username'] != 'admin' or request.form['password'] != 'admin':
			error = 'invalid credentials'
		else:
			#store session value as true to indicate login
			session['logged_in'] = True
			flash('you were just logged in')
			return redirect(url_for('rent'))
			

	return render_template('login.html', error=error)

if __name__ == '__main__':
	app.run(debug=True)
