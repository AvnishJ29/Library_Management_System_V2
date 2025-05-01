from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin,RoleMixin,SQLAlchemyUserDatastore

db = SQLAlchemy()

class Book(db.Model):   
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Name = db.Column(db.String, nullable=False)
    Content = db.Column(db.String, nullable=False)   
    Pages = db.Column(db.Integer,nullable=False) 
    Copies = db.Column(db.Integer,nullable=False)
    Section_id= db.Column(db.Integer, db.ForeignKey("section.ID"), nullable=False)  
    author=db.relationship('Authors',backref='book')    

class Section(db.Model):
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Name = db.Column(db.String, nullable=False)
    Date_Created = db.Column(db.String, nullable=False)
    Description = db.Column(db.String,nullable=False)     

class Authors(db.Model):
    Book_id = db.Column(db.Integer, db.ForeignKey("book.ID"), nullable=False, primary_key=True)
    Name = db.Column(db.String, nullable=False, primary_key=True)

class Users(db.Model,UserMixin):    
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)  
    Name=db.Column(db.String,nullable=False)  
    Email = db.Column(db.String,nullable=False)
    Password = db.Column(db.String, nullable=False)
    active=db.Column(db.Boolean,default=True,nullable=False)
    fs_uniquifier=db.Column(db.String,nullable=False,unique=True)    
    Last_login=db.Column(db.String)  
    Wallet=db.Column(db.Integer,nullable=False,default=0)
    roles = db.relationship('Role', secondary='role_users', backref=db.backref('users', lazy='dynamic'))

class Role(db.Model, RoleMixin):
    id=db.Column(db.Integer,primary_key=True,autoincrement=True)
    name=db.Column(db.String,nullable=False)

class RoleUsers(db.Model):    
    id=db.Column(db.Integer,primary_key=True,autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.ID'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class BookIssueUser(db.Model):
    User_id = db.Column(db.Integer, db.ForeignKey("users.ID"), primary_key=True,nullable=False)
    Book_id = db.Column(db.Integer, db.ForeignKey("book.ID"),  primary_key=True,nullable=False)
    Issue_date = db.Column(db.String,nullable=False)
    Return_date = db.Column(db.String,nullable=False)

class BookRequestUser(db.Model):
    User_id = db.Column(db.Integer, db.ForeignKey("users.ID"), nullable=False, primary_key=True)
    Book_id = db.Column(db.Integer, db.ForeignKey("book.ID"), nullable=False, primary_key=True)

class UserFeedback(db.Model):
    User_id = db.Column(db.Integer, db.ForeignKey("users.ID"), primary_key=True,nullable=False)
    Book_id = db.Column(db.Integer, db.ForeignKey("book.ID"), primary_key=True,nullable=False)
    Date = db.Column(db.String)
    Rating = db.Column(db.Integer, nullable=False)
    Comments=db.Column(db.String,nullable=False)

class History(db.Model):
    ID = db.Column(db.Integer,primary_key=True,autoincrement=True)
    User_id = db.Column(db.Integer, db.ForeignKey("users.ID"),nullable=False)
    Book_id = db.Column(db.Integer, db.ForeignKey("book.ID"),nullable=False)
    Status_download = db.Column(db.Boolean,default=False,nullable=False)
    Issue_date = db.Column(db.String)
    Return_date = db.Column(db.String)

user_datastore = SQLAlchemyUserDatastore(db, Users, Role)