from flask import Blueprint, render_template
from flask_login import login_required, logout_user, current_user


views = Blueprint('views', __name__)

@views.route('/')
def landing():
    return render_template("landing.html")

@views.route('/login')
def login():
    return render_template("login.html")

@views.route('/sign-up')
def signup():
    return render_template("sign-up.html")

@views.route('/dashboard')
@login_required
def dashboard():
    return render_template("dashboard.html")

