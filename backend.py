from flask import Flask, request, jsonify, send_from_directory, Response
from werkzeug.utils import secure_filename
import os
import zipfile
import shutil
import glob

app = Flask(__name__)

# ゲームファイルの保存先を絶対パスで指定
GAMES_DIR = r'C:\Users\56\Downloads\public\games'
PUBLIC_DIR = r'C:\Users\56\Downloads\public'


# フォルダ作成
os.makedirs(GAMES_DIR, exist_ok=True)

@app.route('/games/<path:path>')
def serve_game_files(path):
    """/games/ ディレクトリ以下の静的ファイルを配信するためのエンドポイント"""
    # Check if the path is a directory and serve a dynamic index.html if needed
    game_dir = os.path.join(GAMES_DIR, os.path.dirname(path))
    
    # We are trying to access a directory, likely for the iframe src
    if path.endswith('/'):
        index_path = os.path.join(GAMES_DIR, path, 'index.html')
        game_id_dir = os.path.join(GAMES_DIR, path)

        if not os.path.exists(index_path):
            # Find the loader script to determine the build name
            loader_scripts = glob.glob(os.path.join(game_id_dir, '*.loader.js'))
            if loader_scripts:
                build_name = os.path.basename(loader_scripts[0]).replace('.loader.js', '')
                
                # Dynamically generate the index.html content
                html_content = f"""
<!DOCTYPE html>
<html lang="en-us">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Unity WebGL Player | {build_name}</title>
    <style>
      body {{ padding: 0; margin: 0; overflow: hidden; }}
      #unity-container {{
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
      }}
      #unity-canvas {{
        width: 100%;
        height: 100%;
        background: #231F20;
      }}
    </style>
  </head>
  <body>
    <div id="unity-container">
      <canvas id="unity-canvas" width=auto height=auto></canvas>
    </div>
    <script src="{build_name}.loader.js"></script>
    <script>
      createUnityInstance(document.querySelector("#unity-canvas"), {{
        dataUrl: "{build_name}.data.gz",
        frameworkUrl: "{build_name}.framework.js.gz",
        codeUrl: "{build_name}.wasm.gz",
        streamingAssetsUrl: "StreamingAssets",
        companyName: "DefaultCompany",
        productName: "{build_name}",
        productVersion: "1.0",
      }});
    </script>
  </body>
</html>
"""
                return Response(html_content, mimetype='text/html')

    # Serve static files as before
    return send_from_directory(PUBLIC_DIR, f'games/{path}')

@app.route('/upload', methods=['POST'])
def upload_game():
    game_id = request.form.get('id')
    zip_file = request.files.get('zip')
    image_file = request.files.get('img')
    
    # game_idは必須とする
    if not game_id:
        return jsonify({"error": "id は必須です"}), 400

    # 保存先ディレクトリ
    target_dir = os.path.join(GAMES_DIR, game_id)
    os.makedirs(target_dir, exist_ok=True)

    # zipファイルが提供されている場合のみ展開する
    if zip_file and zip_file.filename != '':
        try:
            zip_path = os.path.join(target_dir, 'upload.zip')
            zip_file.save(zip_path)

            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(target_dir)
            os.remove(zip_path)
        except zipfile.BadZipFile:
            # フロントから空のBlobが送られてきた場合などは無視する
            pass
        except Exception as e:
            return jsonify({"error": f"ZIPファイルの処理中にエラーが発生しました: {str(e)}"}), 500


    # 画像ファイルが提供されている場合のみ保存する
    if image_file and image_file.filename != '':
        try:
            image_path = os.path.join(target_dir, 'img.png')
            image_file.save(image_path)
        except Exception as e:
            return jsonify({"error": f"画像の保存中にエラーが発生しました: {str(e)}"}), 500


    # Firestoreへの書き込み処理はここに実装することを想定
    # 例:
    # from firebase_admin import firestore
    # db = firestore.client()
    # game_ref = db.collection('games').document(game_id)
    # game_ref.set({
    #     'title': request.form.get('title'),
    #     'description': request.form.get('description'),
    #     'markdownText': request.form.get('markdownText'),
    #     'createdAt': firestore.SERVER_TIMESTAMP
    # }, merge=True)

    return jsonify({"message": "アップロード完了"}), 200


@app.route('/reupload', methods=['POST'])
def reupload_game():
    game_id = request.form.get('id')
    zip_file = request.files.get('zip')
    image_file = request.files.get('img')

    if not game_id:
        return jsonify({"error": "id は必須です"}), 400

    target_dir = os.path.join(GAMES_DIR, game_id)
    # 既存のディレクトリがない場合は新規作成する
    os.makedirs(target_dir, exist_ok=True)

    # zip再展開
    if zip_file and zip_file.filename != '':
        try:
            # 再アップロードの前に、既存のゲームファイルをクリーンアップする
            # ただし、img.pngは消さないようにする
            for item in os.listdir(target_dir):
                if item != 'img.png':
                    item_path = os.path.join(target_dir, item)
                    if os.path.isdir(item_path):
                        shutil.rmtree(item_path)
                    else:
                        os.remove(item_path)

            zip_path = os.path.join(target_dir, 'upload.zip')
            zip_file.save(zip_path)
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(target_dir)
            os.remove(zip_path)
        except zipfile.BadZipFile:
             # フロントから空のBlobが送られてきた場合などは無視する
            pass
        except Exception as e:
            return jsonify({"error": f"ZIPファイルの再アップロード処理中にエラーが発生しました: {str(e)}"}), 500

    # 画像再保存 (ディレクトリが存在しない場合も考慮)
    if image_file and image_file.filename != '':
        try:
            image_path = os.path.join(target_dir, 'img.png')
            image_file.save(image_path)
        except Exception as e:
            return jsonify({"error": f"画像の再アップロード処理中にエラーが発生しました: {str(e)}"}), 500

    return jsonify({"message": "再アップロード完了"}), 200


@app.route('/delete', methods=['POST'])
def delete_game():
    game_id = request.form.get('id')
    if not game_id:
        return jsonify({"error": "id は必須です"}), 400

    target_dir = os.path.join(GAMES_DIR, game_id)
    if os.path.isdir(target_dir):
        shutil.rmtree(target_dir)
        # Firestoreからのドキュメント削除もここで行う
        return jsonify({"message": "削除完了"}), 200
    else:
        # ディレクトリが存在しなくてもFirestoreには存在する可能性があるのでエラーにしない
        # Firestoreからのドキュメント削除は試みる
        return jsonify({"message": "ファイルは存在しませんでしたが、削除処理を試みました。"}), 200


@app.route('/feedback', methods=['POST'])
def submit_feedback():
    game_id = request.form.get('id')
    text = request.form.get('text')

    if not game_id or not text:
        return jsonify({"error": "id, text は必須です"}), 400

    # フィードバックはスクリプトからの相対パスに保存する
    feedback_dir = os.path.join(os.path.dirname(__file__), 'feedback')
    os.makedirs(feedback_dir, exist_ok=True)

    feedback_path = os.path.join(feedback_dir, f'{secure_filename(game_id)}.txt')
    with open(feedback_path, 'a', encoding='utf-8') as f:
        f.write(text.strip() + '\n---\n')

    # Firestoreへのフィードバック保存もここで行うと良い
    return jsonify({"message": "感想送信完了"}), 200


if __name__ == '__main__':
    # CORS(Cross-Origin Resource Sharing)を許可するための設定
    from flask_cors import CORS
    CORS(app) 
    app.run(host='0.0.0.0', port=5000)
