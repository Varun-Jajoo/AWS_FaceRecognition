# import boto3
# import io
# from PIL import Image
#
# rekognition = boto3.client('rekognition', region_name='ap-south-1')
# dynamodb = boto3.client('dynamodb', region_name='ap-south-1')
#
# image_path = input("Enter path of the image to check: ")
#
# image = Image.open(image_path)
# stream = io.BytesIO()
# image.save(stream, format="JPEG")
# image_binary = stream.getvalue()
#
# response = rekognition.search_faces_by_image(
#     CollectionId='famouspersons',
#     Image={'Bytes': image_binary}
# )
#
# found = False
# for match in response['FaceMatches']:
#     print(match['Face']['FaceId'], match['Face']['Confidence'])
#
#     face = dynamodb.get_item(
#         TableName='face_recognition',
#         Key={'RekognitionId': {'S': match['Face']['FaceId']}}
#     )
#
#     if 'Item' in face:
#         print("Found Person: ", face['Item']['FullName']['S'])
#         found = True
#
# if not found:
#     print("Person cannot be recognized")

from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
import io
from PIL import Image

app = Flask(__name__)
CORS(app)  # Add CORS to your Flask app

rekognition = boto3.client('rekognition', region_name='ap-south-1')
dynamodb = boto3.client('dynamodb', region_name='ap-south-1')


@app.route('/upload_photo', methods=['POST'])
def upload_photo():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    try:
        image = Image.open(file)
        stream = io.BytesIO()
        image.save(stream, format="JPEG")
        image_binary = stream.getvalue()

        response = rekognition.search_faces_by_image(
            CollectionId='famouspersons',
            Image={'Bytes': image_binary}
        )

        found = False
        response_data = {'matches': []}
        for match in response['FaceMatches']:
            face = dynamodb.get_item(
                TableName='face_recognition',
                Key={'RekognitionId': {'S': match['Face']['FaceId']}}
            )

            if 'Item' in face:
                response_data['matches'].append({
                    'faceId': match['Face']['FaceId'],
                    'confidence': match['Face']['Confidence'],
                    'fullName': face['Item']['FullName']['S']
                })
                found = True

        if found:
            return jsonify(response_data)
        else:
            return jsonify({'error': 'Person cannot be recognized'})

    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run(debug=True)
