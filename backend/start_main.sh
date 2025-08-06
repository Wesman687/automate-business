#!/bin/bash
cd /home/ubuntu/streamlineai/backend
source .venv/bin/activate
exec uvicorn main:app --host 0.0.0.0 --port 8001 --log-config logging_config.yaml --access-log
