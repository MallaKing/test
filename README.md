# Python-only Project

This repository has been converted to a minimal Python project.

Files added:
- `app/app.py`: Flask application
- `tests/test_app.py`: pytest test suite (contains an intentional failing test to trigger CI)
- `requirements.txt`: Python dependencies
- `.github/workflows/python-ci.yml`: GitHub Actions workflow to run tests

Run locally:11111

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
pytest
```
