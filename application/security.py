from flask_security import  SQLAlchemyUserDatastore 

from .models import db , User , Role 


data_storage = SQLAlchemyUserDatastore(db , User , Role) 




