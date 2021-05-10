import boto3
import json
from botocore.exceptions import ClientError



def lambda_handler(event, context):
    
    client = boto3.client('ses')
    SENDER = "BootCamp Cloud AWS - Amcom <example@email.com>" #emailSender
    RECIPIENT = event['params']['querystring']['email']
    AWS_REGION = "" #regiao
    SUBJECT = "BootCamp Cloud AWS - Amcom"
    BODY_TEXT = ("BootCamp Cloud AWS - Amcom\r\n"
                 "Um novo arquivo foi adicionado a sua pasta."
                )
    BODY_HTML = """<html>
    <head></head>
    <body>
      <h1>BootCamp Cloud AWS - Amcom</h1>
      <p>Um novo arquivo foi adicionado a sua pasta.</p>
    </body>
    </html>
                """
    CHARSET = "UTF-8"

    try:
        response = client.send_email(
            Destination={
                'ToAddresses': [
                    RECIPIENT,
                ],
            },
            Message={
                'Body': {
                    'Html': {
                        'Charset': CHARSET,
                        'Data': BODY_HTML,
                    },
                    'Text': {
                        'Charset': CHARSET,
                        'Data': BODY_TEXT,
                    },
                },
                'Subject': {
                    'Charset': CHARSET,
                    'Data': SUBJECT,
                },
            },
            Source=SENDER,
        )

    except ClientError as e:
        print("Houve um erro"),
        print(e.response['Error']['Message'])
    else:
        print("Email Enviado! Message ID:"),
        print(response['MessageId'])


    return {
        'statusCode': 200,
        'body': json.dumps('Sucesso!')
    }