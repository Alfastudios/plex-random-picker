#!/bin/bash

# Railway Automated Deployment Script
# This script deploys the plex-random-picker repository to Railway using the GraphQL API

set -e

# Configuration
RAILWAY_API_URL="https://backboard.railway.com/graphql/v2"
GITHUB_REPO="Alfastudios/plex-random-picker"
PROJECT_NAME="plex-random-picker"

# Environment Variables to configure
declare -A ENV_VARS=(
    ["VITE_PLEX_URL"]="http://192.168.1.88:32400"
    ["VITE_PLEX_TOKEN"]="o-CQNS6jTNt-3uihuSey"
    ["JWT_SECRET"]="tu-super-secreto-cambiar-en-produccion"
)

# Build and start commands
BUILD_COMMAND="npm run build"
START_COMMAND="npm start"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Railway token is set
if [ -z "$RAILWAY_TOKEN" ]; then
    log_error "RAILWAY_TOKEN environment variable is not set!"
    echo ""
    echo "To obtain a Railway API token:"
    echo "1. Go to https://railway.app and sign up/login"
    echo "2. Connect your GitHub account"
    echo "3. Go to Account Settings > Tokens"
    echo "4. Create a new API token"
    echo "5. Export it: export RAILWAY_TOKEN='your-token-here'"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Test authentication
log_info "Testing Railway authentication..."
AUTH_RESPONSE=$(curl -s --request POST \
    --url "$RAILWAY_API_URL" \
    --header "Authorization: Bearer $RAILWAY_TOKEN" \
    --header 'Content-Type: application/json' \
    --data '{"query":"query { me { name email id } }"}')

if echo "$AUTH_RESPONSE" | grep -q '"errors"'; then
    log_error "Authentication failed!"
    echo "Response: $AUTH_RESPONSE"
    exit 1
fi

USER_NAME=$(echo "$AUTH_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('me', {}).get('name', 'Unknown'))" 2>/dev/null || echo "Unknown")
USER_EMAIL=$(echo "$AUTH_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('me', {}).get('email', 'Unknown'))" 2>/dev/null || echo "Unknown")
log_success "Authenticated as: $USER_NAME ($USER_EMAIL)"

# Create project
log_info "Creating Railway project..."
CREATE_PROJECT_QUERY='mutation ProjectCreate($input: ProjectCreateInput!) {
    projectCreate(input: $input) {
        id
        name
        description
    }
}'

CREATE_PROJECT_VARIABLES=$(cat <<EOF
{
    "input": {
        "name": "$PROJECT_NAME",
        "description": "Plex Random Picker - Automated deployment"
    }
}
EOF
)

PROJECT_RESPONSE=$(curl -s --request POST \
    --url "$RAILWAY_API_URL" \
    --header "Authorization: Bearer $RAILWAY_TOKEN" \
    --header 'Content-Type: application/json' \
    --data "{\"query\":$(echo "$CREATE_PROJECT_QUERY" | python3 -c "import sys, json; print(json.dumps(sys.stdin.read()))"),\"variables\":$CREATE_PROJECT_VARIABLES}")

if echo "$PROJECT_RESPONSE" | grep -q '"errors"'; then
    log_error "Failed to create project!"
    echo "Response: $PROJECT_RESPONSE"
    exit 1
fi

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('projectCreate', {}).get('id', ''))" 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    log_error "Failed to extract project ID!"
    echo "Response: $PROJECT_RESPONSE"
    exit 1
fi

log_success "Project created with ID: $PROJECT_ID"

# Get default environment ID
log_info "Fetching environment information..."
ENV_QUERY='query Project($id: String!) {
    project(id: $id) {
        environments {
            edges {
                node {
                    id
                    name
                }
            }
        }
    }
}'

ENV_VARIABLES=$(cat <<EOF
{
    "id": "$PROJECT_ID"
}
EOF
)

ENV_RESPONSE=$(curl -s --request POST \
    --url "$RAILWAY_API_URL" \
    --header "Authorization: Bearer $RAILWAY_TOKEN" \
    --header 'Content-Type: application/json' \
    --data "{\"query\":$(echo "$ENV_QUERY" | python3 -c "import sys, json; print(json.dumps(sys.stdin.read()))"),\"variables\":$ENV_VARIABLES}")

ENVIRONMENT_ID=$(echo "$ENV_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('project', {}).get('environments', {}).get('edges', [{}])[0].get('node', {}).get('id', ''))" 2>/dev/null)

if [ -z "$ENVIRONMENT_ID" ]; then
    log_error "Failed to get environment ID!"
    echo "Response: $ENV_RESPONSE"
    exit 1
fi

log_success "Environment ID: $ENVIRONMENT_ID"

# Create service and connect GitHub repo
log_info "Creating service and connecting GitHub repository..."

# First, create a service
SERVICE_CREATE_QUERY='mutation ServiceCreate($input: ServiceCreateInput!) {
    serviceCreate(input: $input) {
        id
        name
    }
}'

SERVICE_CREATE_VARIABLES=$(cat <<EOF
{
    "input": {
        "projectId": "$PROJECT_ID",
        "name": "plex-random-picker",
        "source": {
            "repo": "$GITHUB_REPO",
            "branch": "main"
        }
    }
}
EOF
)

SERVICE_RESPONSE=$(curl -s --request POST \
    --url "$RAILWAY_API_URL" \
    --header "Authorization: Bearer $RAILWAY_TOKEN" \
    --header 'Content-Type: application/json' \
    --data "{\"query\":$(echo "$SERVICE_CREATE_QUERY" | python3 -c "import sys, json; print(json.dumps(sys.stdin.read()))"),\"variables\":$SERVICE_CREATE_VARIABLES}")

if echo "$SERVICE_RESPONSE" | grep -q '"errors"'; then
    log_error "Failed to create service!"
    echo "Response: $SERVICE_RESPONSE"

    # Try alternative approach using githubRepoDeploy
    log_info "Trying alternative deployment method..."

    GITHUB_DEPLOY_QUERY='mutation GitHubRepoDeploy($input: GitHubRepoDeployInput!) {
        githubRepoDeploy(input: $input) {
            projectId
            serviceId
        }
    }'

    GITHUB_DEPLOY_VARIABLES=$(cat <<EOF
{
    "input": {
        "projectId": "$PROJECT_ID",
        "repo": "$GITHUB_REPO",
        "branch": "main"
    }
}
EOF
)

    SERVICE_RESPONSE=$(curl -s --request POST \
        --url "$RAILWAY_API_URL" \
        --header "Authorization: Bearer $RAILWAY_TOKEN" \
        --header 'Content-Type: application/json' \
        --data "{\"query\":$(echo "$GITHUB_DEPLOY_QUERY" | python3 -c "import sys, json; print(json.dumps(sys.stdin.read()))"),\"variables\":$GITHUB_DEPLOY_VARIABLES}")

    if echo "$SERVICE_RESPONSE" | grep -q '"errors"'; then
        log_error "Alternative deployment method also failed!"
        echo "Response: $SERVICE_RESPONSE"
        exit 1
    fi

    SERVICE_ID=$(echo "$SERVICE_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('githubRepoDeploy', {}).get('serviceId', ''))" 2>/dev/null)
else
    SERVICE_ID=$(echo "$SERVICE_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('serviceCreate', {}).get('id', ''))" 2>/dev/null)
fi

if [ -z "$SERVICE_ID" ]; then
    log_error "Failed to get service ID!"
    echo "Response: $SERVICE_RESPONSE"
    exit 1
fi

log_success "Service created with ID: $SERVICE_ID"

# Set environment variables
log_info "Configuring environment variables..."

# Build JSON object for variables
VARS_JSON="{"
first=true
for key in "${!ENV_VARS[@]}"; do
    if [ "$first" = true ]; then
        first=false
    else
        VARS_JSON+=","
    fi
    VARS_JSON+="\"$key\":\"${ENV_VARS[$key]}\""
done
VARS_JSON+="}"

VARS_MUTATION='mutation VariableCollectionUpsert($input: VariableCollectionUpsertInput!) {
    variableCollectionUpsert(input: $input)
}'

VARS_VARIABLES=$(cat <<EOF
{
    "input": {
        "projectId": "$PROJECT_ID",
        "environmentId": "$ENVIRONMENT_ID",
        "serviceId": "$SERVICE_ID",
        "variables": $VARS_JSON,
        "skipDeploys": true
    }
}
EOF
)

VARS_RESPONSE=$(curl -s --request POST \
    --url "$RAILWAY_API_URL" \
    --header "Authorization: Bearer $RAILWAY_TOKEN" \
    --header 'Content-Type: application/json' \
    --data "{\"query\":$(echo "$VARS_MUTATION" | python3 -c "import sys, json; print(json.dumps(sys.stdin.read()))"),\"variables\":$VARS_VARIABLES}")

if echo "$VARS_RESPONSE" | grep -q '"errors"'; then
    log_warning "Failed to set all environment variables via API"
    echo "Response: $VARS_RESPONSE"
    log_info "You may need to set them manually in the Railway dashboard"
else
    log_success "Environment variables configured"
fi

# Update service with build and start commands
log_info "Configuring build and start commands..."

SERVICE_UPDATE_QUERY='mutation ServiceUpdate($id: String!, $input: ServiceUpdateInput!) {
    serviceUpdate(id: $id, input: $input) {
        id
    }
}'

SERVICE_UPDATE_VARIABLES=$(cat <<EOF
{
    "id": "$SERVICE_ID",
    "input": {
        "name": "plex-random-picker"
    }
}
EOF
)

UPDATE_RESPONSE=$(curl -s --request POST \
    --url "$RAILWAY_API_URL" \
    --header "Authorization: Bearer $RAILWAY_TOKEN" \
    --header 'Content-Type: application/json' \
    --data "{\"query\":$(echo "$SERVICE_UPDATE_QUERY" | python3 -c "import sys, json; print(json.dumps(sys.stdin.read()))"),\"variables\":$SERVICE_UPDATE_VARIABLES}")

log_info "Build and start commands need to be configured via nixpacks.toml or Railway dashboard"
log_info "Build command: $BUILD_COMMAND"
log_info "Start command: $START_COMMAND"

# Trigger deployment
log_info "Triggering deployment..."

DEPLOY_MUTATION='mutation ServiceInstanceRedeploy($environmentId: String!, $serviceId: String!) {
    serviceInstanceRedeploy(environmentId: $environmentId, serviceId: $serviceId)
}'

DEPLOY_VARIABLES=$(cat <<EOF
{
    "environmentId": "$ENVIRONMENT_ID",
    "serviceId": "$SERVICE_ID"
}
EOF
)

DEPLOY_RESPONSE=$(curl -s --request POST \
    --url "$RAILWAY_API_URL" \
    --header "Authorization: Bearer $RAILWAY_TOKEN" \
    --header 'Content-Type: application/json' \
    --data "{\"query\":$(echo "$DEPLOY_MUTATION" | python3 -c "import sys, json; print(json.dumps(sys.stdin.read()))"),\"variables\":$DEPLOY_VARIABLES}")

if echo "$DEPLOY_RESPONSE" | grep -q '"errors"'; then
    log_warning "Deployment trigger may have failed"
    echo "Response: $DEPLOY_RESPONSE"
else
    log_success "Deployment triggered!"
fi

# Get deployment URL
log_info "Fetching deployment URL..."
sleep 5  # Wait a bit for deployment to start

DOMAIN_QUERY='query Service($id: String!) {
    service(id: $id) {
        domains {
            serviceDomains {
                domain
            }
        }
    }
}'

DOMAIN_VARIABLES=$(cat <<EOF
{
    "id": "$SERVICE_ID"
}
EOF
)

DOMAIN_RESPONSE=$(curl -s --request POST \
    --url "$RAILWAY_API_URL" \
    --header "Authorization: Bearer $RAILWAY_TOKEN" \
    --header 'Content-Type: application/json' \
    --data "{\"query\":$(echo "$DOMAIN_QUERY" | python3 -c "import sys, json; print(json.dumps(sys.stdin.read()))"),\"variables\":$DOMAIN_VARIABLES}")

DEPLOYMENT_URL=$(echo "$DOMAIN_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); domains = data.get('data', {}).get('service', {}).get('domains', {}).get('serviceDomains', []); print(domains[0].get('domain', '') if domains else '')" 2>/dev/null)

echo ""
echo "=========================================="
echo "DEPLOYMENT SUMMARY"
echo "=========================================="
echo ""
log_success "Project ID: $PROJECT_ID"
log_success "Service ID: $SERVICE_ID"
log_success "Environment ID: $ENVIRONMENT_ID"
echo ""
log_info "Railway Dashboard: https://railway.app/project/$PROJECT_ID"

if [ -n "$DEPLOYMENT_URL" ]; then
    log_success "Deployment URL: https://$DEPLOYMENT_URL"
else
    log_warning "Deployment URL not available yet. Check the Railway dashboard:"
    echo "  https://railway.app/project/$PROJECT_ID"
fi

echo ""
log_info "Environment Variables Configured:"
for key in "${!ENV_VARS[@]}"; do
    echo "  - $key"
done

echo ""
log_info "Next Steps:"
echo "1. Verify the deployment in the Railway dashboard"
echo "2. Ensure build and start commands are correct:"
echo "   - Build: $BUILD_COMMAND"
echo "   - Start: $START_COMMAND"
echo "3. Check deployment logs for any issues"
echo "4. Visit the deployment URL once it's available"
echo ""
