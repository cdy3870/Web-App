from flask import Flask, render_template, request
import os

app = Flask(__name__)

@app.route('/')
def rent():
	return render_template('rent.html')

@app.route('/upload')
def upload():
	return render_template('upload.html')

if __name__ == '__main__':
	app.run(debug=True)
