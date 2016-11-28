.DEFAULT_GOAL := test
NODE_BIN=./node_modules/.bin

.PHONY: clean compile_translations dummy_translations extract_translations fake_translations help html_coverage \
	migrate pull_translations push_translations quality requirements test update_translations validate

help:
	@echo "Please use \`make <target>\` where <target> is one of"
	@echo "  clean                      delete generated byte code and coverage reports"
	@echo "  compile_translations       compile translation files, outputting .po files for each supported language"
	@echo "  dummy_translations         generate dummy translation (.po) files"
	@echo "  extract_translations       extract strings to be translated, outputting .mo files"
	@echo "  fake_translations          generate and compile dummy translation files"
	@echo "  help                       display this help message"
	@echo "  html_coverage              generate and view HTML coverage report"
	@echo "  migrate                    apply database migrations"
	@echo "  pull_translations          pull translations from Transifex"
	@echo "  push_translations          push source translation files (.po) from Transifex"
	@echo "  quality                    run PEP8 and Pylint"
	@echo "  requirements               install requirements for local development"
	@echo "  requirements.js            install JavaScript requirements for local development"
	@echo "  serve                      serve Credentials at 0.0.0.0:8150"
	@echo "  static                     build and compress static assets"
	@echo "  clean_static               delete compiled/compressed static assets"
	@echo "  test                       run tests and generate coverage report"
	@echo "  validate                   run tests and quality checks"
	@echo "  validate_js                run JavaScript unit tests and linting"
	@echo "  start-devstack             run a local development copy of the server"
	@echo "  open-devstack              open a shell on the server started by start-devstack"
	@echo "  pkg-devstack               build the credentials image from the latest configuration and code"
	@echo "  make accept                run acceptance tests"
	@echo "  detect_changed_source_translations       check if translation files are up-to-date"
	@echo "  validate_translations      install fake translations and check if translation files are up-to-date"
	@echo ""

clean:
	find . -name '*.pyc' -delete
	coverage erase
	rm -rf coverage htmlcov test_root/uploads

clean_static:
	rm -rf credentials/assets/ credentials/static/build

requirements.js:
	npm install
	$(NODE_BIN)/bower install

requirements: requirements.js
	pip install -r requirements/local.txt

test: clean
	coverage run ./manage.py test credentials --settings=credentials.settings.test
	coverage report

quality:
	pep8 --config=.pep8 credentials *.py
	pylint --rcfile=pylintrc credentials *.py

static:
	$(NODE_BIN)/r.js -o build.js
	python manage.py collectstatic --noinput
	python manage.py compress

validate_js:
	rm -rf coverage
	$(NODE_BIN)/gulp test
	$(NODE_BIN)/gulp lint
	$(NODE_BIN)/gulp jscs

serve:
	python manage.py runserver 0.0.0.0:8150

validate: test quality validate_js

migrate:
	python manage.py migrate

html_coverage:
	coverage html && open htmlcov/index.html

extract_translations:
	python manage.py makemessages -l en -v1 -d django
	python manage.py makemessages -l en -v1 -d djangojs

dummy_translations:
	cd credentials && i18n_tool dummy

compile_translations:
	python manage.py compilemessages

fake_translations: extract_translations dummy_translations compile_translations

pull_translations:
	tx pull -af

push_translations:
	tx push -s

start-devstack:
	docker-compose up

open-devstack:
	docker-compose up -d
	docker exec -it credentials env TERM=$(TERM) /edx/app/credentials/devstack.sh open

pkg-devstack:
	docker build -t credentials:latest -f docker/build/credentials/Dockerfile git://github.com/edx/configuration

accept:
	nosetests --with-ignore-docstrings -v acceptance_tests

detect_changed_source_translations:
	cd credentials && i18n_tool changed

validate_translations: fake_translations detect_changed_source_translations
