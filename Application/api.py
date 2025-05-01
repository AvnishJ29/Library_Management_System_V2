from flask import current_app as app
from flask_security import auth_required,roles_required
from flask_restful import Resource, Api, reqparse
from Application.model import*
from datetime import datetime
from flask_security.utils import hash_password
from Application.caching import cache

api = Api(app)

class BookApi(Resource):
    @auth_required("token")
    @cache.cached(timeout=300)
    def get(self):
        books={}
        if Book.query.all() is None:
            return {"message":"No Books Found"},400
        sections=Section.query.all()
        for section in sections:
            temp2=[]
            temp=Book.query.filter_by(Section_id=section.ID).all()
            for x in temp:
                dummy=[]
                for y in x.author:
                    dummy.append(y.Name)
                temp2.append({"ID":x.ID,"Name":x.Name,"Content":x.Content,"Pages":x.Pages,"Authors":dummy,"Copies":x.Copies})
            books[section.Name]=temp2
        return books,200
    
    @auth_required("token")
    @roles_required("Librarian")
    def post(self):  
        cache.clear()    
        parser = reqparse.RequestParser()
        parser.add_argument("Name", type=str)
        parser.add_argument("Content", type=str)
        parser.add_argument("Pages", type=str)
        parser.add_argument("Copies", type=str)
        parser.add_argument("Section",type=str)
        parser.add_argument("Authors", type=list,location="json")
        args = parser.parse_args() 
        if args['Name'] is None:
            return {"message":"Book name is required"},400
        if args['Content'] is None:
            return {"message":"Book content is required"},400
        authors_data = args.get("Authors", [])         
        section = Section.query.filter_by(Name=args["Section"]).first()
        if section is None:                  
                return {"message":"Section does not exist"},400          
        book = Book(Name=args['Name'], Content=args['Content'], Pages=args['Pages'], Section_id=section.ID,Copies=args['Copies'])        
        if int(args['Pages'])<0:
            return {"message":"Book Pages cannot be negative"},400
        if int(args['Copies'])<0:
            return {"message":"Book Copies cannot be negative"},400
        try:  
            for x in authors_data:
                author = Authors(book=book, Name=x)
                db.session.add(author)
            db.session.add(book)               
            db.session.commit()    
            return {"message":"Book Added Successfully"},200
        except:
            db.session.rollback()
            return {"message":"Something went wrong"},400
    
    @auth_required("token")
    @roles_required("Librarian")
    def put(self,book_id):        
        book = Book.query.get(book_id)
        parser = reqparse.RequestParser()
        parser.add_argument("Name", type=str)
        parser.add_argument("Content", type=str)
        parser.add_argument("Pages", type=str)
        parser.add_argument("Copies", type=str)
        parser.add_argument("Section",type=str)
        parser.add_argument("Authors", type=list,location="json")
        args = parser.parse_args()
        authors_data = args.get("Authors", []) 
        if book:
            cache.clear()   
            if int(args['Pages'])<0:
                return {"message":"Book Pages cannot be negative"},400
            if int(args['Copies'])<0:
                return {"message":"Book Copies cannot be negative"},400
            if args["Name"]:
                book.Name = args["Name"]
            if args["Content"]:
                book.Content = args["Content"]
            if args["Pages"]:
                book.Pages = args["Pages"]
            if args["Copies"]:
                book.Copies = args["Copies"]
            if args["Section"]:
                section = Section.query.filter_by(Name=args["Section"]).first()
                if section:
                    book.Section_id = section.ID
                else:
                    return {"message":"Section does not exist"},400
            if authors_data:
                Authors.query.filter_by(Book_id=book_id).delete()
                for x in authors_data:
                    author = Authors(Book_id=book_id, Name=x)
                    db.session.add(author) 
            db.session.commit()
            return {"message":"Book Updated Successfully"},200
        else:
            return {"message":"Book does not exist"},400
    
    @auth_required("token")
    @roles_required("Librarian")
    def delete(self,book_id):
        cache.clear()   
        book=Book.query.get(book_id)
        if book:
            Authors.query.filter_by(Book_id=book_id).delete()
            Book.query.filter_by(ID=book_id).delete()
            BookIssueUser.query.filter_by(Book_id=book_id).delete()
            BookRequestUser.query.filter_by(Book_id=book_id).delete()
            UserFeedback.query.filter_by(Book_id=book_id).delete()
            History.query.filter_by(Book_id=book_id).delete()
            db.session.commit()
            return {"message":"Book Deleted Successfully"},200
        else:
            return {"message":"Book does not exist"},400

api.add_resource(BookApi,"/book","/book/<int:book_id>")


class SectionApi(Resource):
    @auth_required("token")
    def get(self,section_name):
        section=Section.query.filter_by(Name=section_name).first()
        if section is None:
            return {"message":"Section not found"},400
        section_serialized={"section_id":section.ID,"section_name":section.Name,"section_description":section.Description,"section_date":section.Date_Created}
        return section_serialized,200
    
    @auth_required("token")
    @roles_required("Librarian")
    def post(self):
        cache.clear()   
        parser = reqparse.RequestParser()
        parser.add_argument("Name", type=str)        
        parser.add_argument("Description", type=str)
        args = parser.parse_args()
        if args['Name'] is None:
            return {"message":"Section name is required"},400
        if args['Description'] is None:
            return {"message":"Section Description is required"},400     
        all_section = Section.query.all()
        if args['Name'] in [x.Name for x in all_section]:
            return {"message":"Section already exixts"},400    
        section=Section(Name=args["Name"],Date_Created=datetime.now().date(),Description=args["Description"])
        db.session.add(section)
        db.session.commit()
        return {"message":"Section added Successfully"},200
    
    @auth_required("token")
    @roles_required("Librarian")
    def put(self,section_name):          
        section=Section.query.filter_by(Name=section_name).first()
        if section is None:
            return {"message":"Section does not exist"},400
        cache.clear() 
        parser = reqparse.RequestParser()
        parser.add_argument("Name", type=str)        
        parser.add_argument("Description", type=str)
        args = parser.parse_args()
        if args["Name"]:
            section.Name=args["Name"]        
        if args["Description"]:
            section.Description=args["Description"]
        db.session.commit()
        return {"message":"Section Updated Successfully"},200
    
    @auth_required("token")
    @roles_required("Librarian")
    def delete(self,section_name):        
        section=Section.query.filter_by(Name=section_name).first()
        if section is None:
            return {"message":"Section does not exist"},400
                
        cache.clear()  
        books=Book.query.filter_by(Section_id=section.ID).all()
        for book in books:
            BookIssueUser.query.filter_by(Book_id=book.ID).delete()
            BookRequestUser.query.filter_by(Book_id=book.ID).delete()
            History.query.filter_by(Book_id=book.ID).delete()
            Authors.query.filter_by(Book_id=book.ID).delete() 
            UserFeedback.query.filter_by(Book_id=book.ID).delete()           
            db.session.delete(book)
        db.session.delete(section)
        db.session.commit()
        return {"message":"Section Deleted Successfully"},200

api.add_resource(SectionApi,"/section","/section/<string:section_name>")  



class ProfileApi(Resource):    
    @auth_required("token")
    def get(self,user_id):
        fav_book=[]
        user=user_datastore.find_user(ID=user_id)
        req=BookRequestUser.query.filter_by(User_id=user_id).count()
        issue=BookIssueUser.query.filter_by(User_id=user_id).count()
        fav_feedback = list(UserFeedback.query.filter(UserFeedback.User_id == user_id, UserFeedback.Rating >= 4).all())
        if fav_feedback !=[]:
            for x in fav_feedback:
                temp=Book.query.filter_by(ID=x.Book_id).first()
                if temp:
                    fav_book.append(temp.Name)
        return {"Name":user.Name,"Email":user.Email,"Wallet":user.Wallet,"Request":req,"Issue":issue,"Fav_book":fav_book},200
    
    @auth_required("token")
    def put(self,user_id):        
        user=user_datastore.find_user(ID=user_id)
        parser = reqparse.RequestParser()
        parser.add_argument("Email", type=str)        
        parser.add_argument("Password", type=str)
        parser.add_argument("Name", type=str)
        args = parser.parse_args()
        if args["Name"]:
            user.Name=args["Name"]
        if args["Email"]:
            user.Email=args["Email"]        
        if args["Password"]:
            if len(args["Password"]) <5:
                return {"message":"Password must have atleast 5 characters"},400
            else:
                user.Password=hash_password(args["Password"])
        db.session.commit()
        return {"message":"Profile updated successfully"},200        

api.add_resource(ProfileApi,"/profile/<int:user_id>")
