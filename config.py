class Config(object):
    DEBUG = False
    TESTING = False
    CACHE_TYPE = "RedisCache"
    CACHE_DEFAULT_TIMEOUT = 300

class DevelopmentConfig(Config):
    DEBUG = True 
    SQLALCHEMY_DATABASE_URI = 'sqlite:///grocery.db' 
    SQLALCHEMY_TRACK_MODIFICATIONS = False   
    SECRET_KEY = 'thisissector'
    SECURITY_PASSWORD_SALT = 'thisissalt' 
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-token'
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_DB = 3 
    SMTP_SERVER = "localhost"
    SMTP_PORT = 1025
    SENDER_EMAIL = 'hasan@iitm.ac.in'
    SENDER_PASSWORD = '' 

