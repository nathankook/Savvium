from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
from plaid_client import client


auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    print("Signup data received:", data)

    if User.query.filter_by(email=data['email']).first():
        print("User already exists.")
        return jsonify({'message': 'User already exists'}), 409

    try:
        new_user = User(
            name=data['name'],
            last_name=data.get('last_name', ''),
            phone=data.get('phone', ''),
            email=data['email'],
            password=generate_password_hash(data['password'])
        )
        db.session.add(new_user)
        db.session.commit()
        print("New user created!")
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        print("Error while creating user:", e)
        return jsonify({'message': 'Server error'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    return jsonify({'message': 'Login successful', 'name': user.name}), 200


