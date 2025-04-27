from flask import Flask, request, jsonify
from models import db, BudgetCategory, Expense
from auth import auth_bp
from plaid_routes import plaid_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
db.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(plaid_bp)

@app.route('/')
def hello_world():
    return "Hello, Savvium Server!"

@app.route('/categories', methods=['POST'])
def create_category():
    data = request.get_json()
    new_cat = BudgetCategory(
        user_id=data["user_id"],
        name=data["name"],
        budget=data["budget"],
        color=data.get("color", "#cccccc")
    )
    db.session.add(new_cat)
    db.session.commit()
    return jsonify({"message": "Category created", "category": {
        "id": new_cat.id,
        "user_id": new_cat.user_id,
        "name": new_cat.name,
        "budget": new_cat.budget,
        "color": new_cat.color
    }})

@app.route('/categories/<int:user_id>', methods=['GET'])
def get_categories(user_id):
    categories = BudgetCategory.query.filter_by(user_id=user_id).all()
    result = [{
        "id": c.id,
        "user_id": c.user_id,
        "name": c.name,
        "budget": c.budget,
        "color": c.color
    } for c in categories]
    return jsonify(result)

@app.route('/expenses', methods=['POST'])
def create_expense():
    data = request.get_json()
    new_expense = Expense(
        category_id=data["category_id"],
        name=data["name"],
        amount=data["amount"]
    )
    db.session.add(new_expense)
    db.session.commit()
    return jsonify({"message": "Expense created", "expense": {
        "id": new_expense.id,
        "category_id": new_expense.category_id,
        "name": new_expense.name,
        "amount": new_expense.amount
    }})

@app.route('/expenses/<int:user_id>', methods=['GET'])
def get_user_expenses(user_id):
    # Get expenses tied to the user's categories
    expenses = Expense.query.join(BudgetCategory).filter(BudgetCategory.user_id == user_id).all()
    result = [{
        "id": e.id,
        "category_id": e.category_id,
        "name": e.name,
        "amount": e.amount,
        "category_name": e.category.name
    } for e in expenses]
    return jsonify(result)

@app.route('/expenses/<int:category_id>', methods=['GET'])
def get_expenses(category_id):
    expenses = Expense.query.filter_by(category_id=category_id).all()
    result = [{
        "id": e.id,
        "category_id": e.category_id,
        "name": e.name,
        "amount": e.amount
    } for e in expenses]
    return jsonify(result)

@app.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    category = BudgetCategory.query.get_or_404(category_id)
    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Category and associated expenses deleted."})


if __name__ == '__main__':
    with app.app_context():
        print("Creating database and tables...")
        db.create_all()
    app.run(debug=True, host='0.0.0.0')
