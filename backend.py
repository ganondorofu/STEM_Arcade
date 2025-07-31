from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import zipfile
import shutil

app = Flask(__name__)

# アップロード先をNext.jsが配信できる `public` ディレクトリに変更
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# Next.jsのpublicディレクトリを基準にする
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
GAMES_DIR = os.path.join(PUBLIC_DIR, 'games')

# フォルダ作成
os.makedirs(GAMES_DIR, exist_ok=True)

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
    if not os.path.isdir(target_dir):
        return jsonify({"error": "指定されたゲームIDは存在しません"}), 404

    # zip再展開
    if zip_file and zip_file.filename != '':
        try:
            # 古いBuildとTemplateDataを削除するなどのクリーンアップ処理を入れるとより堅牢
            zip_path = os.path.join(target_dir, 'upload.zip')
            zip_file.save(zip_path)
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(target_dir)
            os.remove(zip_path)
        except zipfile.BadZipFile:
             return jsonify({"error": "提供されたファイルは有効なZIPファイルではありません。"}), 400
        except Exception as e:
            return jsonify({"error": f"ZIPファイルの再アップロード処理中にエラーが発生しました: {str(e)}"}), 500

    # 画像再保存
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

    feedback_dir = os.path.join(BASE_DIR, 'feedback')
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
