from flask import Blueprint, request, jsonify
from plaid_client import client
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from datetime import date, timedelta

plaid_bp = Blueprint('plaid', __name__)

@plaid_bp.route('/create_link_token', methods=['POST'])
def create_link_token():
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400

    request_data = LinkTokenCreateRequest(
        products=[Products('transactions')],
        client_name='Savvium App',
        country_codes=[CountryCode('US')],
        language='en',
        user=LinkTokenCreateRequestUser(client_user_id=user_id)
    )

    try:
        response = client.link_token_create(request_data)
        return jsonify(response.to_dict()), 200
    except Exception as e:
        print("Error creating link token:", e)
        return jsonify({'error': 'Failed to create link token'}), 500  # Avoid exposing internal errors

@plaid_bp.route('/exchange_token', methods=['POST'])
def exchange_token():
    print("\n/exchange_token endpoint hit")

    try:
        public_token = request.json.get('public_token')
        if not public_token:
            return jsonify({'error': 'Missing public_token'}), 400

        print("Received public_token:", public_token)

        exchange_request = ItemPublicTokenExchangeRequest(public_token=public_token)
        exchange_response = client.item_public_token_exchange(exchange_request).to_dict()
        access_token = exchange_response.get('access_token')
        item_id = exchange_response.get('item_id')

        print("Access token:", access_token)
        print("Item ID:", item_id)

        start_date = (date.today() - timedelta(days=30)).isoformat()
        end_date = date.today().isoformat()

        txn_request = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date,
            end_date=end_date,
            options=TransactionsGetRequestOptions(count=10)
        )

        txn_response = client.transactions_get(txn_request).to_dict()
        transactions = txn_response.get('transactions', [])
        print("Transactions retrieved:", len(transactions))

        return jsonify({'transactions': transactions}), 200

    except Exception as e:
        print("Exception during /exchange_token:", e)
        return jsonify({'error': 'Failed to exchange token or fetch transactions'}), 500
