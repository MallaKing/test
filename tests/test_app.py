import pytest
from app.app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.testing = True
    with app.test_client() as c:
        yield c


def test_health(client):
    res = client.get('/health')
    assert res.status_code == 200
    assert res.json.get('status') == 'ok'


# Intentional failing test to trigger CI failure
def test_force_failure():
    assert 1 == 2
