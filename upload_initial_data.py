from main import app 
from application.security import data_storage
from application.models import db , Role
from werkzeug.security import generate_password_hash

with app.app_context():
    db.create_all()
    print('Database created successfully') 
    data_storage.find_or_create_role(name="admin",description="user is an admin")
    data_storage.find_or_create_role(name="store_manager",description="user is a store manager") 
    data_storage.find_or_create_role(name="user",description="user is a normal user") 
    db.session.commit()
    if not data_storage.find_user(email="admin@gmail.com"):
        data_storage.create_user(username = "Admin", 
                                 email="admin@gmail.com" , 
                                 password=generate_password_hash("admin") , 
                                 roles=["admin"])    
    db.session.commit()       
    
               

