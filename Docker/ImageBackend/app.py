import io
import os
from flask import Flask, make_response, request, jsonify, send_file
from werkzeug.utils import secure_filename
import hashlib
import uuid
import mimetypes

UPLOAD_FOLDER = './upload'
secret_key = os.environ.get('secret_key') if os.environ.get('secret_key') != None else 'abc'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ext_dict = {
    'image/png': '.png',
    'image/jpg': '.jpg',
    'image/jpeg': '.jpeg',
}

@app.route('/', methods=['GET'])
def helloMeow():
    return make_response('OK', 200)

@app.route('/image/<owner_id>', methods=['POST'])
def upload_image(owner_id):
    # request body must have owner_id.
    key = (secret_key + str(owner_id)).encode()
    hash_key = hashlib.md5(key).hexdigest()

    if 'file' not in request.files:
        return make_response('no file found QAQ', 400)
    
    try:
        file = request.files['file']
        if not file.content_type in ext_dict.keys():
            return make_response('invalid file content type', 400)
        
        ext = ext_dict[file.content_type]
        file_uuid = uuid.uuid4().hex
        prefix_path = os.path.join(app.config['UPLOAD_FOLDER'], hash_key)
        try:
            # make sure it is created
            os.mkdir(prefix_path)
        except:
            pass
        path = os.path.join(prefix_path, secure_filename(f'{file_uuid}{ext}'))
        file.save(path)
        result = {
            'path': path,
            'uuid': file_uuid,
            'content_type': file.content_type
        }
        return make_response(jsonify(result), 200)
    except:
        return make_response('something is wrong', 500)

@app.route('/images/<owner_id>', methods=['POST'])
def upload_multiple_image(owner_id):
    # request body must have owner_id.
    key = (secret_key + str(owner_id)).encode()
    hash_key = hashlib.md5(key).hexdigest()

    result = []
    for file_key in request.files:
        file = request.files[file_key]
        if not file.content_type in ext_dict.keys():
            return make_response('invalid file content type', 400)
        ext = ext_dict[file.content_type]
        file_uuid = uuid.uuid4().hex
        prefix_path = os.path.join(app.config['UPLOAD_FOLDER'], hash_key)
        try:
            # make sure it is created
            os.mkdir(prefix_path)
        except:
            pass
        path = os.path.join(prefix_path, secure_filename(f'{file_uuid}{ext}'))
        file.save(path)
        result.append({
            'file_key': file_key,
            'file_name': file.filename,
            'path': path,
            'uuid': file_uuid,
            'content_type': file.content_type,
        })
    return make_response(jsonify(result), 200)
    



@app.route('/image', methods=['GET'])
def get_image_by_path():
    request_json = request.get_json()
    try:
        file_path = request_json['path']
        file_path.replace('../', '')

        if not os.path.isfile(file_path):
            return make_response('File not found', 404)
        
        with open(file_path, 'rb') as content:
            return send_file(
                io.BytesIO(content.read()),
                mimetype=mimetypes.guess_type(content.name)[0]
            )
    except:
        return make_response('bad request', 400)


@app.route('/image/attr', methods=['GET'])
def get_image():
    # request body must have owner_id.
    request_json = request.get_json()
    try:
        owner_id = request_json['owner_id']
        file_uuid = request_json['file_uuid']
        content_type = request_json['content_type']

        if not content_type in ext_dict.keys():
            return make_response('invalid content type', 400)
        
        ext = ext_dict[content_type]
        key = (secret_key + str(owner_id)).encode()
        hash_key = hashlib.md5(key).hexdigest()

        prefix_path = os.path.join(app.config['UPLOAD_FOLDER'], hash_key)
        path = os.path.join(prefix_path, secure_filename(f'{file_uuid}{ext}'))

        if not os.path.isfile(path):
            return make_response('File not found', 404)
        
        with open(path, 'rb') as content:
            return send_file(
                io.BytesIO(content.read()),
                mimetype=content_type
            )
    except:
        return make_response('bad request ya', 400)

@app.route('/delete/image', methods=['POST'])
def delete_image_by_path():
    request_json = request.get_json()
    try:
        file_path = request_json['path']
        file_path.replace('../', '')

        if not os.path.isfile(file_path):
            return make_response('File not found', 404)
        
        os.remove(file_path)

        if not os.path.isfile(file_path):
            return make_response('OK', 200)
        else:
            return make_response('Something is wrong', 500)
    except:
        return make_response('bad request', 400)
    
@app.route('/edit/image/<owner_id>', methods=['POST'])
def edit_image(owner_id):
    # request body must have owner_id.
    key = (secret_key + str(owner_id)).encode()
    hash_key = hashlib.md5(key).hexdigest()

    if 'file' not in request.files:
        return make_response('no file found QAQ', 400)
    
    try:
        file_path = request.form['path']
        file = request.files['file']
        file_path.replace('../', '')

        if not os.path.isfile(file_path):
            return make_response('File not found', 404)
        
        if not file.content_type in ext_dict.keys():
            return make_response('invalid file content type', 400)

        ext = ext_dict[file.content_type]
        file_uuid = uuid.uuid4().hex
        prefix_path = os.path.join(app.config['UPLOAD_FOLDER'], hash_key)
        try:
            # make sure it is created
            os.mkdir(prefix_path)
        except:
            pass

        path = os.path.join(prefix_path, secure_filename(f'{file_uuid}{ext}'))

        os.remove(file_path)
        if os.path.isfile(file_path):
            return make_response('Something is wrong...', 500)

        file.save(path)
        result = {
            'path': path,
            'uuid': file_uuid,
            'content_type': file.content_type
        }
        return make_response(jsonify(result), 200)
    except:
        return make_response('something is wrong', 500)

if __name__ == '__main__':
    app.run('0.0.0.0', 5787)