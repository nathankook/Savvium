from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, BudgetCategory, Expense
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
    return jsonify([
        {
            "id": c.id,
            "user_id": c.user_id,
            "name": c.name,
            "budget": c.budget,
            "color": c.color
        }
        for c in categories
    ])

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

@app.get("/expenses")
def get_all_expenses():
    expenses = Expense.query.all()
    return jsonify([
        {
            "id": exp.id,
            "category_id": exp.category_id,
            "name": exp.name,
            "amount": exp.amount,
            "category_name": exp.category.name  # Important!
        }
        for exp in expenses
    ])

@app.route('/expenses/<int:category_id>', methods=['GET'])
def get_expenses(category_id):
    expenses = Expense.query.filter_by(category_id=category_id).all()
    return jsonify([
        {
            "id": exp.id,
            "category_id": exp.category_id,
            "name": exp.name,
            "amount": exp.amount
        } for exp in expenses
    ])

@app.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    category = BudgetCategory.query.get(category_id)
    if not category:
        return {'message': 'Category not found'}, 404

    try:
        db.session.delete(category)
        db.session.commit()
        return {'message': 'Category and related expenses deleted successfully.'}, 200
    except Exception as e:
        db.session.rollback()
        return {'message': 'Error deleting category', 'error': str(e)}, 500


# <<< NOW AT THE VERY END >>>
if __name__ == '__main__':
    with app.app_context():
        print("Creating database and tables...")
        db.create_all()
    app.run(debug=True, host='0.0.0.0')
