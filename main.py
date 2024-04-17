from flask import Flask
from application.models import db , User , Role
from config import DevelopmentConfig
from flask_security import Security , SQLAlchemyUserDatastore 
from application.resources import api
from application.security import data_storage 
from application.worker import celery_init_app
import flask_excel as excel 
from application.instances import cache 
from celery.schedules import crontab
from application.tasks import daily_reminder

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)    
    db.init_app(app)  
    api.init_app(app) 
    excel.init_excel(app) 
    cache.init_app(app) 
    app.security = Security(app , data_storage) 
    with app.app_context():
        import application.views
    return app 

app = create_app()
celery_app = celery_init_app(app)

@celery_app.on_after_configure.connect 
def send_email(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=20, minute=7),   
        daily_reminder.s('Visit and buy from the store!'),    
    )  

if __name__ == "__main__": 
    app.run(debug = True)    
