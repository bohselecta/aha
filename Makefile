PYTHON ?= python3
VENV_PYTHON = .venv/bin/python
.PHONY: bootstrap dev verify demo backup restore release pairing
bootstrap:
	$(PYTHON) scripts/manage.py bootstrap
dev:
	$(VENV_PYTHON) scripts/manage.py dev
verify:
	$(VENV_PYTHON) scripts/manage.py verify
demo:
	$(VENV_PYTHON) scripts/manage.py demo
backup:
	$(VENV_PYTHON) scripts/manage.py backup --case "$(CASE)"
restore:
	$(VENV_PYTHON) scripts/manage.py restore --bundle "$(BUNDLE)" --root "$(if $(RESTORE_ROOT),$(RESTORE_ROOT),.local/restored-cases)"
pairing:
	$(VENV_PYTHON) scripts/manage.py pairing
release:
	$(VENV_PYTHON) scripts/manage.py release
