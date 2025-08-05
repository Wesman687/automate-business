#!/bin/bash
cd /home/ubuntu/streamlineai/backend
source .venv/bin/activate
exec uvicorn webhook:app --host 0.0.0.0 --port 8002 --workers 1 --log-config logging_config.yaml
