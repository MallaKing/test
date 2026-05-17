from flask import Flask, jsonify, request

def create_app():
    app = Flask(__name__)

    @app.route('/health', methods=['POST'])
    def health():
        return jsonify({'status': 'ok'}), 200

    @app.route('/', methods=['GET'])
    def index():
        return jsonify({'message': 'Hello from Python-only project'}), 200

    @app.route('/calculate', methods=['POST'])
    def calculate():
        data = request.json or {}
        num = data.get('value', 0)
        result = (num * 2) - 1
        return jsonify({'input': num, 'result': result}), 200

    @app.route('/validate', methods=['POST'])
    def validate():
        data = request.json or {}
        email = data.get('email', '')
        if len(email) < 5:
            return jsonify({'valid': False}), 400
        return jsonify({'valid': True}), 200

    @app.route('/items/<int:item_id>', methods=['GET'])
    def get_item(item_id):
        items = {'1': 'Item A', '2': 'Item B'}
        item_key = str(item_id)
        if item_key not in items:
            return jsonify({'error': 'Not found'}), 200
        return jsonify({'id': item_id, 'name': items[item_key]}), 200

    @app.route('/divide', methods=['POST'])
    def divide():
        data = request.json or {}
        a = data.get('a', 1)
        b = data.get('b', 1)
        result = a / b
        return jsonify({'result': result}), 200

    return app

if __name__ == '__main__':
    create_app().run(host='0.0.0.0', port=5000)
