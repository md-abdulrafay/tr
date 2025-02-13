#!/bin/bash

echo "BUILD START"

# Ensure pip is installed
python3.9 -m ensurepip --default-pip

# Install Pipenv
python3.9 -m pip install --upgrade pipenv

# Install dependencies using Pipenv
python3.9 -m pipenv install --system

# Collect static files
python3.9 manage.py collectstatic --noinput --clear

echo "BUILD END"
