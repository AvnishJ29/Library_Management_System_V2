from flask import Flask
from flask_security import Security
from Application.model import *
from Application.worker import celery_init_app
from Application.caching import cache
from celery.schedules import crontab
from Application.tasks import google_chat,mail

app=Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///Library.db"

app.config['SECRET_KEY'] = "53736y47rijN^%RW^&#*(DMeo,f[r0.gr])"
app.config['SECURITY_PASSWORD_SALT'] = "nref05i755"
app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
app.config['WTF_CSRF_ENABLED']=False

app.config['CACHE_TYPE']="RedisCache"
app.config['CACHE_REDIS_HOST']="localhost"
app.config['CACHE_REDIS_PORT']=6379
app.config['CACHE_REDIS_DB']=1

db.init_app(app)
cache.init_app(app)
app.security=Security(app,user_datastore)
app.app_context().push()

celery_app = celery_init_app(app)

from Application.actions import *
from Application.actions_lib import *
from Application.api import *


@celery_app.on_after_configure.connect
def tasks(sender, **kwargs):
  sender.add_periodic_task(crontab(minute="*/4"),google_chat.s(),name='Google_Chat')
  sender.add_periodic_task(crontab(minute='*/2'),mail.s(),name='Monthly_Report')


if __name__=='__main__':  
    app.run()
