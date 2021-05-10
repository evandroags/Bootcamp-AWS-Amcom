import os
import os.path
import boto3
import email
import json
import datetime
from botocore.exceptions import ClientError
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

def datetime_handler(x):
    if isinstance(x, datetime.datetime):
        return x.isoformat()
    raise TypeError("Unknown type")

def lambda_handler(event, context):
    
    s3 = boto3.client("s3")
    BUCKET_NAME = "" #NomeBucket
    AWS_REGION = "" #Regiao
    path = event['params']['querystring']['path']
    

    SENDER = "BootCamp Cloud AWS - Amcom <evandroags@hotmail.com>"
    RECIPIENT = event['params']['querystring']['email']
    SUBJECT = "Log de acessos BootCamp AWS"
    
    objects = s3.list_objects(Bucket=BUCKET_NAME, Prefix=path + '/log.txt')["Contents"]
    KEY = str(objects[0]['Key'])
    FILE_NAME = os.path.basename(KEY)
    TMP_FILE_NAME = '/tmp/' + FILE_NAME
    
    s3.download_file(BUCKET_NAME, KEY, TMP_FILE_NAME)
    ATTACHMENT = TMP_FILE_NAME
    BODY_TEXT = "Log de acessos BootCamp AWS AMcom."
    
    client = boto3.client('ses',region_name=AWS_REGION)
    msg = MIMEMultipart()

    msg['Subject'] = SUBJECT 
    msg['From'] = SENDER 
    msg['To'] = RECIPIENT
    textpart = MIMEText(BODY_TEXT)
    msg.attach(textpart)
    att = MIMEApplication(open(ATTACHMENT, 'rb').read())
    att.add_header('Content-Disposition','attachment',filename=ATTACHMENT)
    msg.attach(att)

    try:
        response = client.send_raw_email(
            Source=SENDER,
            Destinations=[RECIPIENT],
            RawMessage={ 'Data':msg.as_string() }
        )
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        print("Email Enviado! Message ID:",response['MessageId'])
    
   
    return {
        'statusCode': 200,
        "headers": {
            "Content-Type": "application/json"
        },
        'body': json.dumps(event, default=datetime_handler)
    }
