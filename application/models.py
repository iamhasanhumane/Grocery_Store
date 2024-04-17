from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin , RoleMixin 
from datetime import datetime
import pytz

db = SQLAlchemy()

class RolesUsers(db.Model ):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))

class User(db.Model , UserMixin):
    id = db.Column(db.Integer , primary_key = True)
    username = db.Column(db.String , unique = True) 
    email = db.Column(db.String , unique = True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255) , nullable = False , unique = True)
    roles = db.relationship('Role', secondary='roles_users', 
                         backref=db.backref('users', lazy='dynamic')) 
    categories = db.relationship('Category' , backref = 'creator')  
    products = db.relationship('Product' , backref = 'creator') 
    orders = db.relationship('Order' , backref = 'user')  
     
class Role(db.Model , RoleMixin): 
    id = db.Column(db.Integer() , primary_key = True)
    name = db.Column(db.String(80), unique = True)
    description = db.Column(db.String(255)) 

class Category(db.Model):    
    id = db.Column(db.Integer , primary_key = True)
    category_name = db.Column(db.String , nullable = False)  
    creator_id = db.Column(db.Integer , db.ForeignKey('user.id') , nullable = False)
    is_approved = db.Column(db.Boolean() , default = False) 
    products = db.relationship('Product', backref = 'category',cascade ='all, delete-orphan')       

    

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(100), nullable=False , unique = True) 
    unit = db.Column(db.String , nullable = False) 
    price = db.Column(db.Float, nullable=False) 
    quantity = db.Column(db.Integer , nullable = False) 
    creator_id = db.Column(db.Integer , db.ForeignKey('user.id'),nullable = False)
    category_id = db.Column(db.Integer , db.ForeignKey('category.id',ondelete='CASCADE'),nullable = False) 
    sold = db.Column(db.Integer , default = 0)    


class CategoryEditRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String , nullable = False)  
    category_id = db.Column(db.Integer , db.ForeignKey('category.id'),nullable = False)
    requested_by = db.Column(db.Integer , db.ForeignKey('user.id') , nullable = False)
    is_edited = db.Column(db.Boolean() , default = False)

class CategoryDeleteRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String , nullable = False)  
    category_id = db.Column(db.Integer , db.ForeignKey('category.id'),nullable = False)
    requested_by = db.Column(db.Integer , db.ForeignKey('user.id') , nullable = False)
    is_deleted  = db.Column(db.Boolean() , default = False)   


class Cart(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False) 
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable = False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable = False)
    product_name = db.Column(db.String, nullable = False)
    product_price = db.Column(db.Float, nullable = False) 
    category_name = db.Column(db.String, nullable = False)
    quantity = db.Column(db.Integer , nullable = False)
    total = db.Column(db.Integer, nullable = False) 
    is_buyed = db.Column(db.Boolean(), default = False) 

default_ist = pytz.timezone('Asia/Kolkata')

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer,db.ForeignKey('user.id') ,nullable=False)
    order_date = db.Column(db.DateTime, default=lambda: datetime.now(default_ist))    
    total_amount = db.Column(db.Float, nullable=False)  
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade = 'all, delete')  


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id' , ondelete='CASCADE'), nullable=False)  
    product_name = db.Column(db.String,nullable=False)   
    quantity = db.Column(db.Integer, nullable=False) 
    product_price = db.Column(db.Float, nullable=False)  















     
 

