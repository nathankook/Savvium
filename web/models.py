from . import db
from flask_login import UserMixin


#associate id with a user
#user_id = db.Column(db.Integer, db.ForeignKey('user.id'))#

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password1 = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    last_name = db.Column(db.String(150))
    #create a relationship
    #name = db.relationship('nameOfTable')

