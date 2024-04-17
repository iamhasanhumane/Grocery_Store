from flask import current_app as app , jsonify , request , render_template, send_file
from flask_security import auth_required , roles_required , current_user , roles_accepted
from .security import data_storage
from werkzeug.security import check_password_hash , generate_password_hash
from .models import User , db , Role , Category  , Product , CategoryEditRequest , CategoryDeleteRequest , Cart , Order , OrderItem
from flask_restful import Resource , marshal , fields 
from celery.result import AsyncResult
from .tasks import create_resource 
import flask_excel as excel 

@app.get('/')
def home():
    return render_template('index.html')  


@app.get('/admin')
@auth_required('token')
@roles_required('admin') 
def admin():
    return "Welcome Admin"


 



@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message":"Email not provided"}) , 400
    
    # Finding the user object with email
    user = data_storage.find_user(email = email)

    if not user:
        return jsonify({"message":"User Not Found"}) , 404  
    
    if user.active == False:
        return jsonify({"message":"Your request is not yet approved by admin!"}) , 403
    
    elif check_password_hash(user.password , data.get("password")): 
        return jsonify({"token":user.get_auth_token() , "email":user.email , "role":user.roles[0].name})

    else:
        return jsonify({"message":"Wrong password"}) , 400 

         

@app.post('/user-signup')
def user_signup():
    data = request.get_json()
    username = data.get('username') 
    email = data.get('email')
    password = data.get('password') 
    role = data.get('role')  

    # Checking if the user  already exists.
    user = data_storage.find_user(email = email)
    if user:
        return jsonify({"message":"User already exists.Go to login"}) , 409
    
    # Checking if the username is in use.
    username = data_storage.find_user(username=username)  
    if username:
        return jsonify({"message":"Username in use. Try Different one"}) , 409 
    
    elif role=="user":
        new_user = data_storage.create_user(username= data.get('username'), email=email, 
                                            password=generate_password_hash(password) , 
                                            roles=["user"] , active = True)
        
        db.session.add(new_user)
        db.session.commit() 
        return jsonify({"message":"Registered-Successfully"}) , 200
    else:
        new_store_manager = data_storage.create_user(username=data.get('username') , email=email, 
                                            password=generate_password_hash(password) , 
                                            roles=["store_manager"] , active = False) 
        
        db.session.add(new_store_manager) 
        db.session.commit() 
        return jsonify({"message":"You will be able to login once the admin approves"}), 200 


user_fields = {
    "id": fields.Integer , 
    "email": fields.String , 
    "active":fields.Boolean
}    

     
@app.get('/users') 
@roles_required('admin') 
@auth_required('token') 
def all_users():
    users = User.query.all()
    if len(users) == 0:
        return jsonify({"message": "No User Found"}), 404
    return marshal(users, user_fields) 


class Creator(fields.Raw):
    def format(self,user):
        return user.email 


category_fields = {
    "id" : fields.Integer,
    "category_name" : fields.String , 
    "is_approved" : fields.Boolean,
    'creator': Creator
} 

@app.get('/categories')  
@roles_required('admin')
@auth_required('token')
def all_categories():
    categories = Category.query.all()
    if len(categories) == 0:
        return jsonify({"message":"No Categories Found"}), 404
    return marshal(categories , category_fields ) 


@app.get('/activate/category/<int:id>')
@roles_required('admin')
@auth_required('token') 
def category_activate(id): 
    category = Category.query.get(id) 
    if not category: 
        return jsonify({"message":"Category Not Found"}) , 404 
    
    category.is_approved = True 
    db.session.commit()
    return jsonify({"message":"Category Approved"}) , 200


@app.post('/edit-category/<int:category_id>') 
@roles_required('store_manager')
@auth_required('token')
def edit_category(category_id):
    data = request.get_json()  
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"message": "Category Not Found"}), 404
    
    category_edit = CategoryEditRequest(category_name = data.get('category_name'),
                                        category_id = category_id,
                                        requested_by = current_user.id) 
    db.session.add(category_edit)
    db.session.commit()  
    return jsonify({"message": "Your changes will be reflected when admin approves your edit request"}), 200

category_edit_fields = {
    "id" : fields.Integer,
    "category_name" : fields.String , 
    "is_edited" : fields.Boolean,
    'creator': Creator , 
    'requested_by': fields.Integer,
    "category_id": fields.Integer,
} 

@app.get('/category-edits')
@roles_required('admin')
@auth_required('token') 
def category_edit_requests():
    requests = CategoryEditRequest.query.filter_by(is_edited = False).all()      
    if len(requests)>0:
        return marshal(requests , category_edit_fields) 
    else:
        return jsonify({"message": "No new requests"}) , 400


@app.get('/apply-edit/<int:cat_id>')
@roles_required('admin')
@auth_required('token')
def apply_edit(cat_id): 
    category_obj = Category.query.get(cat_id)
    print(category_obj) 
    category_edit_obj = CategoryEditRequest.query.filter_by(category_id = cat_id).first()
    print(category_edit_obj) 
    new_name = category_edit_obj.category_name
    category_obj.category_name = new_name  
    category_edit_obj.is_edited = True 
    db.session.delete(category_edit_obj) 
    db.session.commit()  
    print("Success")  
    return jsonify({"message":"Edited Successfully"}) , 200  


@app.get('/delete-category/<int:category_id>')    
@roles_required('store_manager')
@auth_required('token')
def delete_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"message": "Category Not Found"}), 404
    
    category_delete = CategoryDeleteRequest(category_name = category.category_name,
                                        category_id = category_id,
                                        requested_by = current_user.id)  
    db.session.add(category_delete) 
    db.session.commit()   
    return jsonify({"message": "Your changes will be reflected when admin approves your delete request"}), 200

category_delete_fields = {
    "id" : fields.Integer,
    "category_name" : fields.String , 
    "is_deleted" : fields.Boolean,
    'creator': Creator , 
    'requested_by': fields.Integer,
    "category_id": fields.Integer,
} 

@app.get('/category-deletes')
@roles_required('admin')
@auth_required('token') 
def category_delete_requests():
    requests = CategoryDeleteRequest.query.filter_by(is_deleted = False).all()      
    if len(requests)>0:
        return marshal(requests , category_delete_fields)  
    else:
        return jsonify({"message": "No new requests"}) , 400 
    
@app.get('/apply-delete/<int:cat_id>') 
@roles_required('admin')
@auth_required('token')
def apply_delete(cat_id):
    category = Category.query.get(cat_id)
    category_delete_obj = CategoryDeleteRequest.query.filter_by(category_id = cat_id).first()
    if not category:
        return jsonify({"message": "No Such Category. Cant be Deleted!"}), 404
    elif not category_delete_obj:
        return jsonify({"message": "This Category is not requested to delete"}), 404
    elif category_delete_obj.is_deleted == True:
        return jsonify({"message": "Category already Deleted"}), 404
    else:
        category_delete_obj.is_deleted = True
        db.session.delete(category)
        db.session.commit()
        return jsonify({"message": "Category Deleted"}), 200 
    





@app.get('/managers')
@roles_required('admin')
@auth_required('token')
def managers():
    new_managers = User.query.filter_by(active=False).all()  
    if len(new_managers) == 0:
        return jsonify({"message":"No new Managers"}), 404
    return marshal(new_managers , user_fields)  

products_fields = {
    "id": fields.Integer, 
    "product_name" : fields.String ,  
    "unit": fields.String,
    "price" : fields.Float,
    "quantity": fields.Integer , 
    "category_id": fields.Integer,
    'creator': Creator
}  

@app.get('/products/<int:c_id>')
# @roles_required('store_manager')  
@roles_accepted('store_manager','user') 
@auth_required('token')
def products(c_id): 
    products = Product.query.filter_by(category_id = c_id).all() 
    if len(products)>0 :
        print(products) 
        return marshal(products , products_fields) 
        
    else:
        return {"message": "You have not added any products"} , 404
    

@app.get('/category/<int:cat_id>')
@roles_required('user')
@auth_required('token')
def get_category(cat_id):
    category = Category.query.get(cat_id)
    if not category:
        return jsonify({"message": "Category Not Found"}) , 404
    print(category)
    return marshal(category , category_fields)  


@app.get('/product/<int:product_id>')
@roles_required('user')
@auth_required('token')
def get_product(product_id):  
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product Not Found"}) , 404   
    print(product) 
    return  marshal(product , products_fields) 

cart_fields = { 
    "id": fields.Integer, 
    "product_name" : fields.String ,  
    "product_price" : fields.Float,
    "quantity": fields.Integer , 
    "total": fields.Integer
}


@app.get('/cart/<int:cart_id>')
@roles_required('user')
@auth_required('token')
def get_cart(cart_id):  
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({"message": "Cart Object Not Found"}) , 404    
    return  marshal(cart , cart_fields) , 200  

@app.put('/edit-cart/<int:cart_id>') 
@roles_required('user')
@auth_required('token')
def edit_cart(cart_id):
    data = request.get_json() 
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({"message": "Something went wrong"}), 404
    cart.quantity = data.get('quantity')
    cart.total = data.get('total') 
    db.session.commit()
    return jsonify({"message": "Changes applied"}), 200

@app.get('/delete-cart/<int:cart_id>') 
@roles_required('user') 
@auth_required('token')
def delete_cart(cart_id):
    cart = Cart.query.get(cart_id) 
    if not cart:
        return jsonify({"message": "Something went wrong"}), 404
    db.session.delete(cart)
    db.session.commit()
    return jsonify({"message": "Removed From Cart"}) , 200

@app.post('/place-order') 
@roles_required('user')
@auth_required('token')
def place_order():
    data = request.get_json()
    cart = data.get('cart')


    total_amount = 0
    for item in cart:
        total_amount += item['total']  
    
    # Creating an order
    order = Order(user_id = current_user.id , total_amount = total_amount)
    db.session.add(order)
    db.session.commit()

    for item in cart:
        product = Product.query.get(item['product_id'])
        product.quantity = product.quantity - item['quantity'] 
        product.sold = item['quantity']   
        cart = Cart.query.get(item['id'])  
        cart.is_buyed = True
        order_item = OrderItem(order_id = order.id,
                               product_name = item['product_name'], 
                               quantity = item['quantity'], 
                               product_price = item['product_price']) 
        db.session.add(order_item)
    db.session.commit() 
    print("success") 
    return jsonify({'message': 'Order placed successfully'}), 200     

order_fields = {
    "id": fields.Integer,
    "user_id" : fields.Integer,
    "order_date": fields.DateTime,
    "total_amount": fields.Float,
}

@app.get('/orders') 
@auth_required('token')
@roles_required('user')
def get_orders():
    orders = Order.query.filter_by(user_id=current_user.id).all()
    orders_data = []
    for order in orders:
        order_data = {
            'order_id': order.id,
            'order_date': order.order_date,
            'total_amount': order.total_amount,
            'order_items': [{
                'product_name': item.product_name,
                'quantity': item.quantity,
                'price': item.product_price, 
            } for item in order.items]
        }
        orders_data.append(order_data)
    print(orders_data) 
    return jsonify(orders_data) 

allcategory_fields = {
    "id" : fields.Integer,
    "category_name" : fields.String ,
    "is_approved" : fields.Boolean,
    'creator': Creator
} 

@app.post('/search-products')
@auth_required('token')
@roles_required('user') 
def search_products():
    search_keyword = request.json.get('keyword', '')
    if not search_keyword:
        return jsonify({"message": "Please provide a search keyword"}), 400
    filtered_categories = Category.query.filter(Category.category_name.ilike(f"%{search_keyword}%")).all()
    if len(filtered_categories)>0:
        return marshal(filtered_categories, allcategory_fields) , 200 
    else:
        return {"message": "No Categories  Found"} , 404  

        



@app.get('/activate/manager/<int:manager_id>') 
@auth_required('token')
@roles_required('admin') 
def approve(manager_id):  
    manager = User.query.get(manager_id)  
    if not manager or "store_manager" not in manager.roles:
        return jsonify({"message":"Manager not found"}), 404 
    
    manager.active = True 
    db.session.commit() 
    return jsonify({"message":"User Activated"}) , 200 

@auth_required('token')
@roles_required('store manager')
@app.get('/download-csv')
def download_csv(): 
    task = create_resource.apply_async(args=[current_user.id])  
    return jsonify({"task_id":task.id})     


@app.get('/get-csv/<task_id>') 
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename , as_attachment=True), 200 
    else:
        return jsonify({"message": "Task Pending"}) , 404

