#!/bin/bash

# SaharaSprout Development Environment Startup Script
# This script starts all microservices in development mode with hot reloading

echo "🚀 Starting SaharaSprout Development Environment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 0
    else
        return 1
    fi
}

# Function to start a service
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo -e "${BLUE}🔧 Starting $service_name (Port $port)...${NC}"
    
    if check_port $port; then
        echo -e "${YELLOW}   Service may already be running${NC}"
    fi
    
    cd "$service_path"
    npm run dev &
    
    echo -e "${GREEN}✅ $service_name started${NC}"
    sleep 2
}

# Base directory
BASE_DIR="/Users/henrique/SaharaSprout/microservices"

echo -e "${BLUE}📋 Service Configuration:${NC}"
echo "   • Auth Service     → Port 3010"
echo "   • Product Service  → Port 3011" 
echo "   • Order Service    → Port 3012"
echo "   • AI Service       → Port 3016"
echo "   • API Gateway      → Port 3009"
echo ""

# Start services in order
start_service "Auth Service" "$BASE_DIR/auth-service" 3010
start_service "Product Service" "$BASE_DIR/product-service" 3011
start_service "Order Service" "$BASE_DIR/order-service" 3012
start_service "AI Service" "$BASE_DIR/ai-service" 3016
start_service "API Gateway" "$BASE_DIR/api-gateway" 3009

echo ""
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Service Health Checks:${NC}"
echo "   • Auth Service:    http://localhost:3010/health"
echo "   • Product Service: http://localhost:3011/health"
echo "   • Order Service:   http://localhost:3012/health"  
echo "   • AI Service:      http://localhost:3016/health"
echo "   • API Gateway:     http://localhost:3009/health"
echo ""
echo -e "${BLUE}🌐 API Gateway Endpoints:${NC}"
echo "   • Products:   http://localhost:3009/api/products"
echo "   • Orders:     http://localhost:3009/api/orders"
echo "   • Cart:       http://localhost:3009/api/cart"
echo "   • AI:         http://localhost:3009/api/ai"
echo "   • Auth:       http://localhost:3009/api/auth"
echo ""
echo -e "${YELLOW}💡 Development Tips:${NC}"
echo "   • All services have hot reloading enabled"
echo "   • Check logs in individual terminal tabs"
echo "   • Use Ctrl+C to stop services"
echo ""
echo -e "${GREEN}🔥 Development environment ready!${NC}"

# Keep script running to show status
echo -e "${BLUE}📈 Monitoring services... (Press Ctrl+C to stop all)${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    jobs -p | xargs kill 2>/dev/null
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for all background jobs
wait
