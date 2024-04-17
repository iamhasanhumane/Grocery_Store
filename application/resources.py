from flask_restful import Api , Resource , reqparse , marshal , fields
from .models import  Category , db , User , Role  , Product , Cart
from flask_security import auth_required , roles_required , current_user , roles_accepted
from sqlalchemy import or_ 
from sqlalchemy import and_
from flask import request
from .instances import cache 


api = Api(prefix = '/api') 



category_parser = reqparse.RequestParser() 
product_parser = reqparse.RequestParser()
cart_parser = reqparse.RequestParser() 

category_parser.add_argument('category_name', type = str , help='Name should be required and should be string' , required = True)

product_parser.add_argument('product_name', type=str, help='Name should be required and should be string' , required = True)
product_parser.add_argument('unit', type=str, help='Unit should be required and should be string', required = True)
product_parser.add_argument('price', type=float, help='Price should be required and should be float', required = True)
product_parser.add_argument('quantity', type=int, help='Quantity should be required and should be integer', required = True)
product_parser.add_argument('category_id', type=int,help='Category Id should be required and should be integer',required = True )


cart_parser.add_argument('product_id', type = int , help = 'product id should be required',required = True)  
cart_parser.add_argument('category_id', type = int , help = 'category id should be required',required = True)
cart_parser.add_argument('product_name', type = str , help = 'product name should be required',required = True)
cart_parser.add_argument('product_price', type = float , help = 'product price should be required',required = True)
cart_parser.add_argument('category_name', type = str , help = 'category name should be required',required = True)
cart_parser.add_argument('quantity', type = int , help = 'Quantity should be required',required = True)
cart_parser.add_argument('total', type = int , help = 'Total should be required',required = True) 


class Creator(fields.Raw):
    def format(self,user):
        return user.email 


category_fields = {
    "id" : fields.Integer,
    "category_name" : fields.String , 
    "is_approved" : fields.Boolean,
    'creator': Creator
}   

class Categories(Resource):  
    @auth_required('token')
    @roles_required('store_manager') 
    @cache.cached(timeout = 50)  
    def get(self): 
        user = User.query.get(current_user.id) 
        categories = user.categories 
        approved_categories = Category.query.filter(and_(Category.is_approved == True,Category.creator == current_user)).all()
        if len(categories)>0 and len(approved_categories)==0:
            return {"message": "Your added categories are not yet approved by admin"}, 404
        elif len(categories) == 0:
            return {"message": "You have not added any categories"} , 404
        else:
            return marshal(approved_categories , category_fields)  
   
        
    @auth_required('token')
    @roles_required('store_manager')
    def post(self):
        args = category_parser.parse_args() 
        category = Category(category_name = args.get('category_name'), creator_id = current_user.id) 
        db.session.add(category) 
        db.session.commit() 
        return {'message': "Category Created! You will be able to add products once the category is approved"} 


products_fields = {
    "id": fields.Integer,
    "product_name" : fields.String , 
    "unit": fields.String,
    "price" : fields.Float,
    "quantity": fields.Integer , 
    "category_id": fields.Integer,
    'creator': Creator
}   

class ProductResource(Resource):
    @auth_required('token')  
    @roles_accepted('store_manager','user') 
    @cache.cached(timeout = 50) 
    def get(self , id):  
        products = Product.query.filter_by(category_id = id).all() 
        if len(products)>0 :
            print(products) 
            return marshal(products , products_fields) 
        
        else:
            return {"message": "You have not added any products"} , 404

    @auth_required('token')  
    @roles_required('store_manager')
    def post(self): 
        args = product_parser.parse_args()
        category = Category.query.get(args.get('category_id')) 
        if not category:
            return {"message": "Category Not Found"} , 404
        product = Product(product_name = args.get('product_name'),
                          unit = args.get('unit'),
                          price = args.get('price'),
                          quantity = args.get('quantity'),
                          category_id = args.get('category_id'), 
                          creator_id = current_user.id) 
        db.session.add(product)
        db.session.commit()   
        return {"message": "Product Created Successfully"} , 200

    @auth_required('token')
    @roles_required('store_manager')
    def put(self,product_name,category_id):
        args = product_parser.parse_args()  
        print(product_name) 
        print(category_id) 
        product = Product.query.filter_by(product_name=product_name, category_id=category_id).first()
        if product: 
            product.product_name =  args.get('product_name')
            product.unit = args.get('unit')
            product.price = args.get('price')
            product.quantity = args.get('quantity')
            product.category_id = args.get('category_id')
            db.session.commit() 
            return {"message":"Product update successfully"}, 200
        else:
            return {"message": "Product not found"}, 404  
        
    @auth_required('token')
    @roles_required('store_manager')
    def delete(self, product_name):
        product = Product.query.filter_by(product_name = product_name).first() 
        if product:
            # Delete the product from the database
            db.session.delete(product)
            db.session.commit() 
            return {"message": "Product deleted successfully"}, 200
        else:
            return {"message": "Product not found"}, 404  
        
allcategory_fields = {
    "id" : fields.Integer,
    "category_name" : fields.String ,
    "is_approved" : fields.Boolean,
    'creator': Creator
}  


class CategoryListResource(Resource): 
    @auth_required('token')
    @roles_accepted("admin","user")
    def get(self): 
        if "admin"  in current_user.roles:
            allcategories = Category.query.all()      
        else:
            allcategories = Category.query.filter_by(is_approved=True).all()        
        if len(allcategories)>0: 
           return marshal(allcategories, allcategory_fields) , 200   
        else:
            return {"message": "No Categories  Found"} , 404  
        
cart_fields = {
    "id" : fields.Integer,
    "category_name" : fields.String ,
    "product_id": fields.Integer,
    "product_name": fields.String,
    "product_price": fields.Float,
    "quantity": fields.Integer,
    "total": fields.Integer, 
}        

class CartResource(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        cart = Cart.query.filter(and_(Cart.is_buyed==False,Cart.user_id == current_user.id)).all()
        if not cart:
            return {"message": "No items in the cart"}, 404
        else:
            print(cart) 
            return marshal(cart , cart_fields) , 200  


    @auth_required('token')
    @roles_accepted('admin', 'user')
    def post(self):
        args = cart_parser.parse_args()
        cart = Cart(user_id = current_user.id,
                    product_id = args.get('product_id'),
                    category_id = args.get('category_id'),
                    product_name = args.get('product_name'),
                    product_price = args.get('product_price'),
                    category_name = args.get('category_name'),
                    quantity = args.get('quantity'),
                    total = args.get('total'))
        db.session.add(cart)
        db.session.commit()
        return {"message": "Added to Cart"} , 200 

             

api.add_resource(CartResource , '/cart')         
api.add_resource(CategoryListResource , '/categorielist') 
api.add_resource(Categories , '/categories')   
api.add_resource(ProductResource ,'/products', '/products/<int:id>', '/products/<string:product_name>/<int:category_id>', '/products/<string:product_name>')           