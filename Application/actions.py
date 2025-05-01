from Application.model import *
from flask import current_app as app,render_template,jsonify,request,send_file
from flask_security.utils import hash_password,verify_password
from flask_security import current_user, auth_required,logout_user
from datetime import datetime
from Application.tasks import book_pdf

@app.route("/")
def base():
    return render_template("index.html")

@app.route("/register",methods=["POST","GET"])
def register():
    data=request.get_json()
    if not data or not data.get("Email") or not data.get("Password") or not data.get("Name"):
        return jsonify({"message":"Missing Email or Password or User_name"}),400
    if "@" not in data.get("Email"):
        return jsonify({"message":"Enter a Valid Email"}),400
    Email=data['Email']
    Password=data['Password']
    Name=data['Name']

    if len(Password)<5:
        return jsonify({"message":"Password must have atleast 5 characters"}),400

    if user_datastore.find_user(Email=Email):
        return jsonify({"message":"You are alredy registered"}),400
    
    user_role=user_datastore.find_or_create_role('General')
    user=user_datastore.create_user(Name=Name,Email=Email,Password=hash_password(Password))
    user_datastore.add_role_to_user(user,user_role)
    db.session.commit()

    return jsonify({"message":"User Registered Successfully"}),200

@app.route("/userlogin",methods=["POST","GET"])
def login():
    data=request.get_json()
    if not data or not data.get("Email") or not data.get("Password"):
        return jsonify({"message":"Missing Email or Password"}),400
    if "@" not in data.get("Email"):
        return jsonify({"message":"Enter a Valid Email"}),400
    
    Email=data['Email']
    Password=data['Password']
    user=user_datastore.find_user(Email=Email)
    if len(Password)<5:
        return jsonify({"message":"Password must have atleast 5 characters"}),400
    if not user:
        return jsonify({"message":"User not registered"}),400    
    if verify_password(Password,user.Password):
        user.Last_login=datetime.now().date()
        db.session.commit()
        return jsonify({"token":user.get_auth_token(),"role":user.roles[0].name}),200
    else:
        return jsonify({"message":"Wrong Password"}),401

@app.route("/logout")
@auth_required("token")
def logout():
    logout_user()
    return jsonify({"message":"Logout Successful"}),200
    
@app.route("/current/user")
@auth_required("token")
def currentuser():
    user_info={"ID":current_user.ID,"Email":current_user.Email,"Last_login":current_user.Last_login}
    return user_info,200

@app.route("/book/request/<int:book_id>/<int:user_id>")
@auth_required("token")
def bookrequest(book_id,user_id):
    n=BookRequestUser.query.filter_by(User_id=user_id).count()    
    if n>=5:
        return jsonify({"message":"Cannot request more than five books"}),400
    issue = BookIssueUser.query.filter_by(Book_id=book_id,User_id=user_id).first()
    if issue:
        return jsonify({"message":"Book already issued"}),400
    book = Book.query.get(book_id)
    if book.Copies==0:
        return jsonify({"message":"Currently book is out of stock"}),400
    try:        
        req=BookRequestUser(Book_id=book_id,User_id=user_id)
        db.session.add(req)
        db.session.commit()
    except:
        db.session.rollback()
        return jsonify({"message":"Book already requested"}),400
    return jsonify({"message":"Book Requested Successfully"}),200

@app.route("/book/status/<int:user_id>")
@auth_required("token")
def status(user_id):
    request = BookRequestUser.query.filter_by(User_id=user_id).all()
    issue = BookIssueUser.query.filter_by(User_id=user_id).all()
    req,iss=[],[]
    if request is None:
        return jsonify({"message":"No books issued"}),400
    for x in request:
       req.append(x.Book_id)
    for y in issue:
        iss.append(y.Book_id)
    return {"Request":req,"Issue":iss},200

@app.route("/book/return/<int:book_id>/<int:user_id>")
@auth_required("token")
def bookreturn(book_id,user_id):
    book = Book.query.get(book_id)
    history = History.query.filter_by(User_id=user_id,Book_id=book_id).first()
    history.Return_date = datetime.now().strftime("%Y-%m-%d")
    BookIssueUser.query.filter_by(User_id=user_id,Book_id=book_id).delete()
    book.Copies = int(book.Copies)+1
    db.session.commit()
    return jsonify({"message":"Book Returned Successfully"}),200

@app.route("/book/feedback/<int:book_id>/<int:user_id>",methods=["POST"])
@auth_required("token")
def bookfeedback(book_id,user_id):
    data=request.get_json()
    if not data or not data.get("Rating") or not data.get("Comments"):        
        return jsonify({"message":"Missing Rating or Comments"}),400
    Rating=data['Rating']
    Comments=data['Comments']
    Date = datetime.now().strftime("%Y-%m-%d")
    try:
        rating=UserFeedback(User_id=user_id,Book_id=book_id,Rating=Rating,Comments=Comments,Date=Date)
        db.session.add(rating)
        db.session.commit()
    except:
        db.session.rollback()
        return jsonify({"message":"Feedback already Submitted"}),400
    return jsonify({"message":"User Feedback Submitted successfully"}),200

@app.route("/book/issued/<int:user_id>")
@auth_required("token")
def book_issued(user_id):
    loans = BookIssueUser.query.filter_by(User_id=user_id).all()
    books = []
    for loan in loans: 
        return_date = datetime.strptime(loan.Return_date,'%Y-%m-%d')           
        if return_date >= datetime.now():
            book = Book.query.get(loan.Book_id)
            books.append((book,loan))
        else:
            db.session.delete(loan)                
            db.session.commit()   
    if books==[]:
        return jsonify({"message":"No books Found"}),400
    books_serialized = [{"book_id": b.ID, "book_name": b.Name,"book_pages":b.Pages,"authors":[auth.Name for auth in b.author],"return_date": u.Return_date} for b,u in books]
    return books_serialized,200


@app.route("/book/read/<int:book_id>/<int:user_id>")
@auth_required("token")
def read(book_id,user_id):
    issue=BookIssueUser.query.filter_by(Book_id=book_id,User_id=user_id).first()
    if issue is None:
        return jsonify({"message": "You are not authorized to read this book !!"}),400
    book=Book.query.get(book_id)
    if book is None:
        return jsonify({"message": "Book Not Found"}),400
    json_book={"book_name":book.Name,"book_content":book.Content,"book_id":book.ID}
    return json_book,200

@app.route("/pay/<int:user_id>",methods=["POST"])
@auth_required("token")
def pay(user_id):
    data=request.get_json()
    user=user_datastore.find_user(ID=user_id)
    if data.get("Value") is None:
        return jsonify({"message":"No value found"}),400
    user.Wallet = int(user.Wallet) + int(data.get("Value"))
    db.session.commit()
    return jsonify({"message":"Recharge successful"}),200



@app.route("/search",methods=["POST"])
@auth_required("token")
def search():
    data=request.get_json()
    query=data.get("Query").lower()   
    books = Book.query.join(Authors).filter((Book.Name.ilike(f'%{query}%')) |(Book.Pages.ilike(f'%{query}%')) | (Authors.Name.ilike(f'%{query}%'))).all()
    if books is None:
        return jsonify({"message":"No books found"}),400
    book_serailized=[]
    for book in books:
        auth=[]
        for x in book.author:
            auth.append(x.Name)
        book_serailized.append({"ID":book.ID,"Name":book.Name,"Pages":book.Pages,"Authors":auth,"Copies":book.Copies})   
    return book_serailized,200
    
@app.route("/search/section/<int:section_id>/")
@auth_required("token")
def search_section(section_id):
    books=Book.query.filter_by(Section_id=section_id).all()
    section=Section.query.get(section_id)
    if books is None:
        return jsonify({"message":"No books added to this section!"}),400
    book_serailized=[]
    for book in books:
        auth=[]
        for x in book.author:
            auth.append(x.Name)
        book_serailized.append({"ID":book.ID,"Name":book.Name,"Pages":book.Pages,"Authors":auth,"Copies":book.Copies,"Section":section.Name})   
    return book_serailized,200

@app.route("/book/download/<int:book_id>/<int:user_id>")
def book_download(book_id,user_id):
    history = History.query.filter_by(User_id=user_id,Book_id=book_id).first()
    task = book_pdf.delay(book_id)
    filename = task.get()
    user=user_datastore.find_user(ID=user_id)
    if history.Status_download:
        return send_file(filename, as_attachment=True,mimetype="application/pdf"),200
    else:
        user.Wallet = int(user.Wallet)-100
        lib = user_datastore.find_user(Email='librarian@readathon.com')
        lib.Wallet = int(lib.Wallet)+100     
        db.session.commit()
        return send_file(filename, as_attachment=True,mimetype="application/pdf"),200    

@app.route("/book/payment/status/<int:book_id>/<int:user_id>")
@auth_required("token")
def check(book_id,user_id):
    history = History.query.filter_by(User_id=user_id,Book_id=book_id).first()
    if history.Status_download==False:
        history.Status_download=True
        db.session.commit()
        return jsonify({"message":"RS.100 deducted from wallet"}),200        
    else:
        return jsonify({"message":"Payment already done !"}),200

@app.route("/book/rating/<int:book_id>")
@auth_required("token")
def all_feedback(book_id):
    book = UserFeedback.query.filter_by(Book_id=book_id).all()
    if book==[]:
        return jsonify({"message":"No feedbacks yet for this book"}),400
    count,sum=0,0
    for x in book:
        count+=1
        sum+=x.Rating        
    avg = sum/count
    return {"ID":book_id,"Rating":avg},200

@app.route("/downloads/<int:user_id>")
@auth_required("token")
def download_history(user_id):
    result = []
    downloads = History.query.filter_by(User_id=user_id,Status_download=True).all()    
    if not downloads:
        return jsonify({"message":"No books downloaded yet !"}),400
    for x in downloads:
        book = Book.query.get(x.Book_id)
        if book:
            result.append({"ID":book.ID,"Name":book.Name,"Pages":book.Pages,"Authors":[y.Name for y in book.author],"Issue_date":x.Issue_date,"Return_date":x.Return_date})        
    return result,200

