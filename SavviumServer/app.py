from flask import Flask, request, jsonify
from models import db, BudgetCategory, Expense
from auth import auth_bp
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
db.init_app(app)

app.register_blueprint(auth_bp)

@app.route('/')
def hello_world():
    return "Hello, Savvium Server!"

# Create a new category
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

# Create a new expense
@app.route('/expenses', methods=['POST'])
def create_expense():
    data = request.get_json()
    expense_date = datetime.strptime(data.get('date'), '%Y-%m-%d').date() if data.get('date') else datetime.utcnow().date()

    new_expense = Expense(
        category_id=data["category_id"],
        name=data["name"],
        amount=data["amount"],
        date=expense_date
    )
    db.session.add(new_expense)
    db.session.commit()
    return jsonify({"message": "Expense created", "expense": {
        "id": new_expense.id,
        "category_id": new_expense.category_id,
        "name": new_expense.name,
        "amount": new_expense.amount,
        "date": new_expense.date.isoformat()
    }})

# Get all expenses for the current month
@app.route('/expenses/monthly', methods=['GET'])
def get_monthly_expenses():
    try:
        # Calculate the start of the current month
        today = datetime.utcnow()
        start_of_month = today.replace(day=1)

        # Query expenses for the current month
        expenses = (
            db.session.query(Expense, BudgetCategory.name.label("category_name"))
            .join(BudgetCategory, Expense.category_id == BudgetCategory.id)
            .filter(Expense.date >= start_of_month)
            .all()
        )

        # Format the data for the frontend
        result = [
            {
                "id": expense.Expense.id,
                "name": expense.Expense.name,
                "amount": expense.Expense.amount,
                "date": expense.Expense.date.strftime("%Y-%m-%d"),
                "category_name": expense.category_name,
            }
            for expense in expenses
        ]

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get all expenses for a specific user
@app.route('/users/<int:user_id>/expenses', methods=['GET'])
def get_user_expenses(user_id):
    expenses = Expense.query.join(BudgetCategory).filter(BudgetCategory.user_id == user_id).all()
    result = [{
        "id": e.id,
        "category_id": e.category_id,
        "name": e.name,
        "amount": e.amount,
        "category_name": e.category.name
    } for e in expenses]
    return jsonify(result)

# Get all expenses for a specific category
@app.route('/categories/<int:category_id>/expenses', methods=['GET'])
def get_expenses_by_category(category_id):
    expenses = Expense.query.filter_by(category_id=category_id).all()
    result = [{
        "id": e.id,
        "category_id": e.category_id,
        "name": e.name,
        "amount": e.amount
    } for e in expenses]
    return jsonify(result)




# Delete a category (and associated expenses)
@app.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    category = BudgetCategory.query.get_or_404(category_id)
    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Category and associated expenses deleted."})

# Update a category (e.g., edit budget)
@app.route('/categories/<int:id>', methods=['PATCH'])
def update_category(id):
    data = request.get_json()
    category = BudgetCategory.query.get(id)

    if not category:
        return jsonify({'error': 'Category not found'}), 404

    if 'budget' in data:
        category.budget = data['budget']

    db.session.commit()
    return jsonify({'message': 'Category updated successfully'})

# Get categories for a specific user
@app.route('/users/<int:user_id>/categories', methods=['GET'])
def get_user_categories(user_id):
    categories = BudgetCategory.query.filter_by(user_id=user_id).all()
    result = [{
        "id": c.id,
        "user_id": c.user_id,
        "name": c.name,
        "budget": c.budget,
        "color": c.color
    } for c in categories]
    return jsonify(result)


if __name__ == '__main__':
    with app.app_context():
        print("Creating database and tables...")
        db.create_all()
    app.run(debug=True, host='0.0.0.0')
