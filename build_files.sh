#!/bin/bash

echo "BUILD START"

# Ensure pip is installed
python3.11 -m ensurepip --default-pip

# Upgrade pip
python3.11 -m pip install --upgrade pip

# Install dependencies from requirements.txt
python3.11 -m pip install -r requirements.txt

# Collect static files
python3.11 manage.py collectstatic --noinput --clear

echo "BUILD END"
