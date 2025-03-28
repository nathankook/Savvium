from plaid import Configuration, ApiClient
from plaid.api import plaid_api
import os
from dotenv import load_dotenv

load_dotenv()

configuration = Configuration(
    host='https://sandbox.plaid.com',
    api_key={
        'clientId': os.getenv('PLAID_CLIENT_ID'),
        'secret': os.getenv('PLAID_SECRET'),
    }
)

api_client = ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)
