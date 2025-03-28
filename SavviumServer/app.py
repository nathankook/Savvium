from flask import Flask
from flask_cors import CORS
from models import db
from auth import auth_bp
from plaid_routes import plaid_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
CORS(app)

db.init_app(app)
app.register_blueprint(auth_bp)
app.register_blueprint(plaid_bp)

@app.route('/')
def hello_world():
    return "Hello, Savvium Server!"

if __name__ == '__main__':
    with app.app_context():
        print("Creating database and tables...")
        db.create_all()
    app.run(debug=True, host='0.0.0.0')