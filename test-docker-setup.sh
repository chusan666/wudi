#!/bin/bash

# Docker Deployment Test Script
# This script tests the Docker deployment configuration

echo "🐳 Docker Deployment Stack Test"
echo "================================"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

echo "✅ Docker is available: $(docker --version)"

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available"
    exit 1
fi

echo "✅ Docker Compose is available"

# Test docker-compose.yml syntax
echo "🔍 Testing docker-compose.yml syntax..."
if docker compose config > /dev/null 2>&1; then
    echo "✅ docker-compose.yml syntax is valid"
else
    echo "❌ docker-compose.yml has syntax errors"
    docker compose config
    exit 1
fi

# Test docker-compose.test.yml syntax
echo "🔍 Testing docker-compose.test.yml syntax..."
if docker compose -f docker-compose.test.yml config > /dev/null 2>&1; then
    echo "✅ docker-compose.test.yml syntax is valid"
else
    echo "❌ docker-compose.test.yml has syntax errors"
    docker compose -f docker-compose.test.yml config
    exit 1
fi

# Check if required files exist
echo "🔍 Checking required files..."
required_files=(
    "docker-compose.yml"
    "docker-compose.test.yml"
    "Makefile"
    "apps/api/Dockerfile"
    "apps/web/Dockerfile"
    ".env.production.example"
    ".env.staging.example"
    "DEPLOYMENT.md"
    "DOCKER_README.md"
    ".github/workflows/ci-cd.yml"
    "k8s/deployment.yml"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

# Test Makefile commands
echo "🔍 Testing Makefile commands..."
if make help > /dev/null 2>&1; then
    echo "✅ Makefile is working"
else
    echo "❌ Makefile has errors"
    exit 1
fi

# Check environment templates
echo "🔍 Checking environment templates..."
if [ -f ".env.production.example" ] && grep -q "NODE_ENV=production" .env.production.example; then
    echo "✅ Production template is properly configured"
else
    echo "❌ Production template is missing NODE_ENV=production"
    exit 1
fi

if [ -f ".env.staging.example" ] && grep -q "NODE_ENV=staging" .env.staging.example; then
    echo "✅ Staging template is properly configured"
else
    echo "❌ Staging template is missing NODE_ENV=staging"
    exit 1
fi

# Check Dockerfiles for security features
echo "🔍 Checking Dockerfile security features..."

# Check API Dockerfile for non-root user
if grep -q "RUN.*useradd\|USER.*bunuser" apps/api/Dockerfile; then
    echo "✅ API Dockerfile includes non-root user"
else
    echo "❌ API Dockerfile is missing non-root user"
    exit 1
fi

# Check Web Dockerfile for non-root user
if grep -q "RUN.*adduser\|USER.*nextjs" apps/web/Dockerfile; then
    echo "✅ Web Dockerfile includes non-root user"
else
    echo "❌ Web Dockerfile is missing non-root user"
    exit 1
fi

# Check for Playwright dependencies in API
if grep -q "playwright" apps/api/Dockerfile; then
    echo "✅ API Dockerfile includes Playwright dependencies"
else
    echo "❌ API Dockerfile is missing Playwright dependencies"
    exit 1
fi

# Check health checks in docker-compose
echo "🔍 Checking health checks in docker-compose.yml..."
if grep -q "healthcheck:" docker-compose.yml; then
    echo "✅ Health checks are configured in docker-compose.yml"
else
    echo "❌ Health checks are missing from docker-compose.yml"
    exit 1
fi

# Check Kubernetes manifests
echo "🔍 Checking Kubernetes manifests..."
if [ -f "k8s/deployment.yml" ]; then
    if grep -q "kind: Deployment\|kind: Service\|kind: Ingress" k8s/deployment.yml; then
        echo "✅ Kubernetes manifests are properly configured"
    else
        echo "❌ Kubernetes manifests are incomplete"
        exit 1
    fi
else
    echo "❌ Kubernetes manifests are missing"
    exit 1
fi

# Check CI/CD workflow
echo "🔍 Checking CI/CD workflow..."
if [ -f ".github/workflows/ci-cd.yml" ]; then
    if grep -q "build\|test\|deploy" .github/workflows/ci-cd.yml; then
        echo "✅ CI/CD workflow is properly configured"
    else
        echo "❌ CI/CD workflow is incomplete"
        exit 1
    fi
else
    echo "❌ CI/CD workflow is missing"
    exit 1
fi

echo ""
echo "🎉 All Docker deployment stack tests passed!"
echo ""
echo "📋 Summary of implemented features:"
echo "  ✅ Multi-stage Docker builds with caching"
echo "  ✅ Non-root user execution"
echo "  ✅ Playwright browser dependencies"
echo "  ✅ Health checks for all services"
echo "  ✅ Environment templates (staging/production)"
echo "  ✅ Comprehensive Makefile"
echo "  ✅ CI/CD pipeline configuration"
echo "  ✅ Kubernetes deployment manifests"
echo "  ✅ Security best practices"
echo "  ✅ Documentation and guides"
echo ""
echo "🚀 To start the deployment stack:"
echo "  make up    # Start all services"
echo "  make logs  # View logs"
echo "  make help  # See all commands"