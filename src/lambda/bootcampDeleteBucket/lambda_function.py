import json
import boto3
import urllib

s3 = boto3.client("s3")

def lambda_handler(event, context):
    bucket = ""#NomeBucket
    keyFile = event['params']['querystring']['pathFile']
    
    s3.delete_object(Bucket=bucket, Key=keyFile)

    return {
        'statusCode': 200,
        "headers": {
            "Content-Type": "application/json"
        },
        'body': json.dumps(keyFile)
    }