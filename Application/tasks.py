from celery import shared_task
from fpdf import FPDF
from Application.model import *
import requests
import json
from datetime import datetime
from Application.mail import send_message
from flask import render_template
import pyexcel as p

@shared_task(ignore_result=False)
def google_chat():   
    webhook_url="https://chat.googleapis.com/v1/spaces/AAAAPNS7OoM/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=Zyiiva-XCMaqVMoSOP32rFHa1OFLZrvGhd2oaKJwoOw"
    today = datetime.now().strftime("%Y-%m-%d")
    all_users = Users.query.filter(Users.Last_login !=today).all()
    for user in all_users:
        if user.Email!="librarian@readathon.com":
            message={"text": f"{user.Name} please visit Read-a-Thon books"}
            requests.post(webhook_url,data=json.dumps(message),headers={'Content-Type': 'application/json'})
    data = Users.query.all()  
    for user in data:
        books_issued = BookIssueUser.query.filter_by(User_id=user.ID).all()
        if books_issued:
            for issue in books_issued:
                book=Book.query.get(issue.Book_id)  
                return_date = datetime.strptime(str(issue.Return_date), '%Y-%m-%d')             
                if (return_date - datetime.now()).days <= 2:
                    msg = {"text": f"{user.Name} return date for {book.Name} is approaching "}
                    requests.post(webhook_url,data=json.dumps(msg),headers={'Content-Type': 'application/json'})
    return 

@shared_task(ignore_result=False)
def book_pdf(book_id):
    book = Book.query.get(book_id)
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    text=book.Content
    filename=f"{book.Name}.pdf"
    pdf.multi_cell(0, 10, text)
    pdf.output(filename) 
    return  filename          

@shared_task(ignore_result=True)
def mail():
    history = History.query.all()
    feedback =UserFeedback.query.all()
    issued_books=[]
    feedback_books=[]
    for x in history:      
        date = datetime.strptime(str(x.Return_date), '%Y-%m-%d')
        if (date - datetime.now()).days <=30:
            book = Book.query.get(x.Book_id)
            user = Users.query.get(x.User_id)
            issued_books.append([x,book,user])
    for y in feedback:
        date = datetime.strptime(str(y.Date), '%Y-%m-%d')
        if (date - datetime.now()).days <=30:
            book = Book.query.get(y.Book_id)
            user = Users.query.get(y.User_id)
            feedback_books.append([y,book,user])
    body = render_template("report.html",issued_books=issued_books,feedback_books=feedback_books)
    send_message(body)
    return 

@shared_task(ignore_result=False)
def csv():
    history = History.query.all()
    data=[]
    data.append(["ID","Book Name","Book Content","Book Pages","Section Name","Issue Date","Return Date","User Name","User Email","User Wallet Balance"])
    for x in history:
        book = Book.query.get(x.Book_id)
        user = Users.query.get(x.User_id)
        section = Section.query.get(book.Section_id)
        data.append([x.ID,book.Name,book.Content,book.Pages,section.Name,x.Issue_date,x.Return_date,user.Name,user.Email,user.Wallet])

    p.save_as(array=data, dest_file_name="Details.csv")
    return "Details.csv"
