from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from .plaid_client import client
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
import datetime
from . import db

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

@views.route('/create_link_token', methods=['POST'])
@login_required
def create_link_token():
    try:
        request_data = LinkTokenCreateRequest(
            user={'client_user_id': str(current_user.id)},
            client_name="Your App Name",
            products=[Products('transactions')],
            country_codes=[CountryCode('US')],
            language='en'
        )
        response = client.link_token_create(request_data)
        return jsonify(response.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@views.route('/get_access_token', methods=['POST'])
@login_required
def get_access_token():
    try:
        data = request.get_json()
        public_token = data.get('public_token')

        if not public_token:
            return jsonify({'error': 'Missing public token'}), 400

        exchange_request = ItemPublicTokenExchangeRequest(public_token=public_token)
        exchange_response = client.item_public_token_exchange(exchange_request)

        access_token = exchange_response['access_token']
        return jsonify({'access_token': access_token})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@views.route('/transactions', methods=['GET'])
@login_required
def transactions():
    try:
        access_token = request.args.get('access_token')
        if not access_token:
            return jsonify({'error': 'Missing access token'}), 400

        start_date = (datetime.datetime.now() - datetime.timedelta(days=30)).date()
        end_date = datetime.datetime.now().date()

        request_data = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date,
            end_date=end_date
        )
        response = client.transactions_get(request_data)
        transactions = response['transactions']

        return render_template('transactions.html', transactions=transactions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
