import boto3
    
def lambda_handler(event, context):
    
    client = boto3.client('ses')

    responseteste = client.verify_email_identity(
      EmailAddress = event['request']['userAttributes']['email']
    )
 
    return event