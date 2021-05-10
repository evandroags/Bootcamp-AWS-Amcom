import json
import boto3
import datetime

s3 = boto3.client("s3")

def datetime_handler(x):
    if isinstance(x, datetime.datetime):
        return x.isoformat()
    raise TypeError("Unknown type")

def lambda_handler(event, context):
    bucket = "" #bucket
    path = event['params']['querystring']['user']
    
    objects=s3.list_objects(Bucket=bucket, Prefix=path)["Contents"]
    
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps(objects, default=datetime_handler)
        
    }
    