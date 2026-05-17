import pytest
from app.app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.testing = True
    with app.test_client() as c:
        yield c


def test_health_get(client)://
    res = client.get('/health')
    assert res.status_code == 200
    assert res.json.get('status') == 'ok'


def test_calculate_correct(client):
    res = client.post('/calculate', json={'value': 5})
    assert res.status_code == 200
    assert res.json.get('result') == 10


def test_email_validation(client):
    res = client.post('/validate', json={'email': 'invalidemail'})
    assert res.status_code == 400


def test_item_not_found(client):
    res = client.get('/items/999')
    assert res.status_code == 404


def test_item_exists(client):
    res = client.get('/items/1')
    assert res.status_code == 200
    assert res.json.get('name') == 'Item A'


def test_divide_by_zero(client):
    res = client.post('/divide', json={'a': 10, 'b': 0})
    assert res.status_code == 400


def test_calculate_zero(client):
    res = client.post('/calculate', json={'value': 0})
    assert res.status_code == 200
    assert res.json.get('result') == 0


def test_calculate_negative(client):
    res = client.post('/calculate', json={'value': -3})
    assert res.status_code == 200
    assert res.json.get('result') == -6
