from celery import shared_task
from .models import Product
import flask_excel as excel 
from flask_security import current_user
from .mail_service import send_message 
from .models import User

@shared_task(ignore_result = False)
def create_resource(user_id):
    products = Product.query.filter_by(creator_id=user_id).with_entities(  
            Product.id, Product.product_name, Product.quantity, Product.sold
        ).all()  
    csv_output = excel.make_response_from_query_sets(products , ["id","product_name","quantity","sold"], "csv")
    filename = "product.csv"

    with open(filename , 'wb') as f:
        f.write(csv_output.data)

    return filename  

@shared_task(ignore_result = False)
def daily_reminder(to, subject, ):
    users = User.query.filter(User.products == 0)
    for user in users:
        send_message(user.email , subject, "hello")
    return "OK"         

