#!/bin/bash

echo "BUILD START"

# Install Pipenv if not installed
pip install pipenv

# Install dependencies using Pipenv
pipenv install --system

# Collect static files
python3.9 manage.py collectstatic --noinput --clear

echo "BUILD END"
