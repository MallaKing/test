import pytest
from app.app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.testing = True
    with app.test_client() as c:
        yield c


def test_health_get(client):
    # BUG: Endpoint uses POST, not GET
    res = client.get('/health')
    assert res.status_code == 200
    assert res.json.get('status') == 'ok'


def test_calculate_correct(client):
    # BUG: Off-by-one error in calculation (result should be 10, not 9)
    res = client.post('/calculate', json={'value': 5})
    assert res.status_code == 200
    assert res.json.get('result') == 10


def test_email_validation(client):
    # BUG: No @ symbol check in validation
    res = client.post('/validate', json={'email': 'invalidemail'})
    assert res.status_code == 400


def test_item_not_found(client):
    # BUG: Returns 200 instead of 404 for missing item
    res = client.get('/items/999')
    assert res.status_code == 404


def test_item_exists(client):
    res = client.get('/items/1')
    assert res.status_code == 200
    assert res.json.get('name') == 'Item A'


def test_divide_by_zero(client):
    # BUG: No division by zero check in backend
    res = client.post('/divide', json={'a': 10, 'b': 0})
    assert res.status_code == 400


def test_calculate_zero(client):
    # BUG: Off-by-one error affects zero case (result should be 0, not -1)
    res = client.post('/calculate', json={'value': 0})
    assert res.status_code == 200
    assert res.json.get('result') == 0


def test_calculate_negative(client):
    # BUG: Off-by-one error affects negative numbers
    res = client.post('/calculate', json={'value': -3})
    assert res.status_code == 200
    assert res.json.get('result') == -6
