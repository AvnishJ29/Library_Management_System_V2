from Application.model import *
from flask import current_app as app,jsonify,send_file
from flask_security import auth_required,roles_required
from datetime import datetime,timedelta
from Application.tasks import csv

@app.route("/book/access_grant/<int:book_id>/<int:user_id>")
@roles_required("Librarian")
@auth_required("token")
def bookissue(book_id,user_id):
    BookRequestUser.query.filter_by(User_id=user_id,Book_id=book_id).delete()
    book = Book.query.get(book_id)
    book.Copies = int(book.Copies)-1
    Issue_date = datetime.now()
    Return_date = Issue_date + timedelta(days=14)
    book_issue = BookIssueUser(User_id=user_id,Book_id=book_id,Issue_date=Issue_date.strftime("%Y-%m-%d"), Return_date =Return_date.strftime("%Y-%m-%d"))
    history = History(User_id=user_id,Book_id=book_id,Issue_date=Issue_date.strftime("%Y-%m-%d"), Return_date =Return_date.strftime("%Y-%m-%d"))
    db.session.add(history)
    db.session.add(book_issue)
    db.session.commit()
    return jsonify({"message":"Book issued successfully"}),200

@app.route("/book/access_deny/<int:book_id>/<int:user_id>")
@roles_required("Librarian")
@auth_required("token")
def access_deny(book_id,user_id):
    BookRequestUser.query.filter_by(User_id=user_id,Book_id=book_id).delete()
    db.session.commit()
    return jsonify({"message":"Book request declined successfully"}),200

@app.route("/book/access_revoke/<int:book_id>/<int:user_id>")
@roles_required("Librarian")
@auth_required("token")
def access_revoke(book_id,user_id):
    book = Book.query.get(book_id)
    book.Copies = int(book.Copies)+1
    history = History.query.filter_by(User_id=user_id,Book_id=book_id).first()
    history.Return_date = datetime.now().strftime("%Y-%m-%d")
    BookIssueUser.query.filter_by(User_id=user_id,Book_id=book_id).delete()
    db.session.commit()
    return jsonify({"message":"Book access revoked successfully"}),200

@app.route("/book/issue_management")
@roles_required("Librarian")
@auth_required("token")
def issue_management():   
    issued_books, nonissued_books, pending_books = [], [], []  
    books = Book.query.all()        
    users = Users.query.all()
    for book in books:
        temp1 = None
        temp2 = None
        for user in users:
            temp1 = BookIssueUser.query.filter_by(Book_id=book.ID, User_id=user.ID).first()
            temp2 = BookRequestUser.query.filter_by(Book_id=book.ID, User_id=user.ID).first()
            if temp1:
                issued_books.append((book, user))
            if temp2:
                pending_books.append((book, user))            
    for book in books:
        if book not in [u[0] for u in issued_books] and book not in [u[0] for u in pending_books]:
            nonissued_books.append(book)    
    issued_books_serialized = [{"book_id": b.ID, "book_name": b.Name,"book_copies":b.Copies,"user_id": u.ID,"user_name": u.Name,"user_email": u.Email,"user_wallet":u.Wallet} for b,u in issued_books]
    pending_books_serialized = [{"book_id": b.ID, "book_name": b.Name,"book_copies":b.Copies, "user_id": u.ID, "user_name": u.Name,"user_wallet":u.Wallet,"user_email": u.Email} for b,u in pending_books]
    nonissued_books_serialized = [{"book_id": b.ID, "book_name": b.Name,"book_copies":b.Copies} for b in nonissued_books]                
    return jsonify({"Issued":issued_books_serialized,"Pending":pending_books_serialized,"Non_Issued":nonissued_books_serialized}),200


@app.route("/book/detail/<int:book_id>")
@auth_required("token")
def book_detail(book_id):
    book=Book.query.get(book_id)
    if book is None:
        return jsonify({"message":"Book not found"}),400
    existing_authors=""
    auth=list(Authors.query.filter_by(Book_id=book_id))
    section=Section.query.get(book.Section_id)
    if len(auth)<=1:
        existing_authors+=auth[0].Name
    else:
        for i in range(len(auth)-1):
            existing_authors+=auth[i].Name+","
        existing_authors+=auth[-1].Name  
    book_serialized={"Name":book.Name,"Content":book.Content,"Pages":book.Pages,"Authors":existing_authors,"Section":section.Name,"Copies":book.Copies}
    return book_serialized,200


@app.route("/section/all")
@auth_required("token")
def all():
    section=Section.query.all()
    section_serialized=[]
    if section is None:
        return jsonify({"message":"No section found"}),400
    for sec in section:
        section_serialized.append({"ID":sec.ID,"Name":sec.Name,"Description":sec.Description})
    return section_serialized,200

@app.route("/users")
@auth_required("token")
@roles_required("Librarian")
def users():
    user_serialized=[]
    user=Users.query.filter(Users.roles.any(Role.name == 'General')).all()
    if user is None:
        return jsonify({"message":"No users registered !"}),400
    for x in user:
        user_serialized.append({"ID":x.ID,"Name":x.Name,"Email":x.Email,"Wallet":x.Wallet,"Last_login":x.Last_login,"Status":x.active})
    return user_serialized,200   

@app.route("/activate/<int:user_id>")
@auth_required("token")
@roles_required("Librarian")
def activate(user_id):
    user = user_datastore.find_user(ID=user_id)
    if user is None:
        return jsonify({"message":"User not found"}),400
    user.active = True
    db.session.commit()
    return jsonify({"message":"User activated successfully"}),200

@app.route("/deactivate/<int:user_id>")
@auth_required("token")
@roles_required("Librarian")
def deactivate(user_id):
    user = user_datastore.find_user(ID=user_id)
    if user is None:
        return jsonify({"message":"User not found"}),400
    user.active = False
    db.session.commit()
    return jsonify({"message":"User deactivated successfully"}),200

@app.route("/statistics")
@auth_required("token")
@roles_required("Librarian")
def statistics():
    req=BookRequestUser.query.count()
    issue=BookIssueUser.query.count()
    book=Book.query.count()
    sec=Section.query.count()
    user=Users.query.filter(Users.roles.any(Role.name == 'General'),Users.active==True).count()
    history = History.query.count()
    lib = user_datastore.find_user(Email='librarian@readathon.com')
    revenue = lib.Wallet
    chart1=[]
    section=Section.query.all()
    for x in section:
        count=Book.query.filter_by(Section_id=x.ID).count()
        chart1.append([x.Name,count])
    
    chart2=[]
    books=Book.query.all()
    for x in books:
        sum,i=0,0
        feedbacks = UserFeedback.query.filter_by(Book_id=x.ID).all()
        for y in feedbacks:
            sum+=y.Rating
            i+=1
        if i!=0:
            avg_rating = sum/i
            chart2.append([x.Name,avg_rating])
    
    return {"Request":req,"Issue":issue,"Book":book,"Section":sec,"Revenue":revenue,"Users":user,"history":history,"Chart1":chart1,"Chart2":chart2},200

@app.route("/csv")
def csv_download():
    task = csv.delay()
    filename = task.get()
    return send_file(filename, as_attachment=True, mimetype='text/csv'),200