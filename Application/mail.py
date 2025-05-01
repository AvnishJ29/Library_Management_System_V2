import smtplib 
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER_HOST = "localhost"
SMTP_SERVER_PORT = 1025
SENDER_ADDRESS = "no-reply@readathon.com"
SENDER_PASSWORD = ""

def send_message(message):
    msg = MIMEMultipart()
    msg["From"] = SENDER_ADDRESS
    msg["To"] = "librarian@readathon.com"
    msg["Subject"] = "Monthly Activity Report"

    msg.attach(MIMEText(message,'html'))

    send = smtplib.SMTP(host=SMTP_SERVER_HOST,port=SMTP_SERVER_PORT)
    send.login(SENDER_ADDRESS,SENDER_PASSWORD)
    send.send_message(msg)
    send.quit()
    return 