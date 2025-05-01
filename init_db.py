from Application.model import *
from flask_security.utils import hash_password
from main import app

with app.app_context():
    db.create_all()
    if not user_datastore.find_role('Librarian'):
        user_datastore.create_role(name='Librarian')
    if not user_datastore.find_user(Email='librarian@readathon.com'):
        user_datastore.create_user(Name="John",Email='librarian@readathon.com', Password=hash_password('password'))
    db.session.commit()

    user = user_datastore.find_user(Email='librarian@readathon.com')
    librarian_role = user_datastore.find_role('Librarian')
    user_datastore.add_role_to_user(user, librarian_role)
    db.session.commit()
    
   

