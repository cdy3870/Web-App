from flask import Flask, render_template, request
import os

app = Flask(__name__)

@app.route('/welcome')
def welcome():
	return render_template('welcome.html')

if __name__ == '__main__':
	app.run(debug=True)