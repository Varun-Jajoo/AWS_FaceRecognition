import boto3

s3 = boto3.resource('s3')

# Get list of objects for indexing
images=[
        ('varun.jpg','Varun Jajoo')


      ]

# Iterate through list to upload objects to S3
for image in images:
    file = open(image[0],'rb')
    object = s3.Object('famouspersonsvarun','index/'+ image[0])
    ret = object.put(Body=file,
                    Metadata={'FullName':image[1]})