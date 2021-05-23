import json, boto3, datetime
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    
    s3 = boto3.client("s3")
    bucket = "bootcampcloudamcomstorage"
    
    dthr = datetime.datetime.today() - datetime.timedelta(hours=3)
    data_hora = str(dthr.strftime("%d/%m/%Y %H:%M:%S"))

    path = event['params']['querystring']['path']
    namefile = '[Arquivo: ' + event['params']['querystring']['namefile'] + ']' if event['params']['querystring']['namefile'] != 'null' else ''

    if event['params']['querystring']['tipo'] == "LI":
        tipo = "Login"
    elif event['params']['querystring']['tipo'] == "LO":
        tipo = "Logout"
    elif event['params']['querystring']['tipo'] == "IN":
        tipo = "Inclusão de arquivo"
    elif event['params']['querystring']['tipo'] == "DT":
        tipo = "Exclusão de arquivo"
    elif event['params']['querystring']['tipo'] == "DW":
        tipo = "Download de arquivo"    
    else:
        tipo = "Indefinido"
        
    filename = '/log.txt'
    pathFile = path + filename
    lamba_tmp = '/tmp' + filename    
    
    try:
       s3.download_file(bucket, pathFile, lamba_tmp) 
    except ClientError as e:
       with open(lamba_tmp, 'a') as fd:
           fd.write('LOG Bootcamp AWS AMcom\n')
           fd.write(' \n')
       s3.upload_file(lamba_tmp, bucket, pathFile)
       s3.download_file(bucket, pathFile, lamba_tmp)

    with open(lamba_tmp, 'a') as fd:
        fd.write('[Data/Hora: ' + data_hora + '][Operação: ' + tipo + ']' + namefile + '\n')
    
    s3.upload_file(lamba_tmp, bucket, pathFile)
    
    
    return {
        'statusCode': 200,
        "headers": {
            "Content-Type": "application/json"
        },
        'body': json.dumps(data_hora)
    }
