#!/bin/bash
set -e

echo "=== Creating systemd service ==="
cat << 'EOF' > /etc/systemd/system/portfolio.service
[Unit]
Description=FastAPI Portfolio Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/portfolio/backend
ExecStart=/home/ubuntu/portfolio/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now portfolio

echo "=== Configuring Nginx ==="
cat << 'EOF' > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

nginx -t
systemctl restart nginx

echo "=== Setup Completed Successfully ==="
