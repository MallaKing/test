from flask import Flask, jsonify

def create_app():
    app = Flask(__name__)

    @app.route('/health', methods=['GET'])
    def health():
        # Simple health endpoint
        return jsonify({'status': 'ok'}), 200

    @app.route('/', methods=['GET'])
    def index():
        return jsonify({'message': 'Hello from Python-only project'}), 200

    return app

if __name__ == '__main__':
    create_app().run(host='0.0.0.0', port=5000)
