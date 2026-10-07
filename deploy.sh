#!/usr/bin/env bash
# ==============================================================================
# Sankara Eye Foundation - Gift of Vision Automated Deployment Script
# Target: Ubuntu/Debian/CentOS/RHEL Server (e.g., 192.168.1.244 / sankaraeye.in)
# ==============================================================================

set -e

echo "======================================================="
echo "  Sankara Eye Foundation - Gift of Vision Deployment"
echo "======================================================="

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "[!] Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm -f get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "[!] Installing Docker Compose plugin..."
    apt-get update && apt-get install -y docker-compose-plugin || yum install -y docker-compose-plugin || true
fi

echo "[+] Building and starting Docker container..."
if docker compose version &> /dev/null; then
    docker compose down --remove-orphans || true
    docker compose build --no-cache
    docker compose up -d
else
    docker-compose down --remove-orphans || true
    docker-compose build --no-cache
    docker-compose up -d
fi

echo "[+] Verifying container health..."
sleep 5
docker ps -f name=sankara_giftofvision_app

echo ""
echo "======================================================="
echo "  Deployment Complete!"
echo "  Local / Internal Access: http://192.168.1.244:3000"
echo "  Container Internal Port: 127.0.0.1:3000"
echo "======================================================="
