#!/bin/bash

# This script will create an user pool and user pool client using Cognito Local (https://github.com/jagregory/cognito-local).
# You MUST have the emulator running before running this script.

# ANSI color codes
BLUE='\x1b[38;5;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo -e "${BLUE}.env file not found. Make sure it exists before running.${NC}"
  exit 1
fi

COGNITO_PORT=${COGNITO_PORT:-9229} # Default to 9229 if COGNITO_PORT is not set

echo -e "${BLUE}The Cognito port is:${NC} ${GREEN}${COGNITO_PORT}${NC}"

# Function to extract value from JSON response using grep and awk
extract_value() {
  grep -o "\"$2\": *\"[^\"]*\"" <<< "$1" | awk -F'"' '{print $4}'
}

echo -e "${BLUE}Creating your User Pool...${NC}"

# Create User Pool
user_pool_response=$(aws --endpoint http://localhost:${COGNITO_PORT} cognito-idp create-user-pool --pool-name UserPoolLocal --query 'UserPool.{Id:Id}' --output json)
user_pool_id=$(extract_value "$user_pool_response" "Id")

echo -e "${BLUE}Creating your User Pool Client...${NC}"

# Create User Pool Client
user_pool_client_response=$(aws --endpoint http://localhost:${COGNITO_PORT} cognito-idp create-user-pool-client --user-pool-id $user_pool_id --client-name UserPoolClientLocal --query 'UserPoolClient.{Id:ClientId}' --output json)
user_pool_client_id=$(extract_value "$user_pool_client_response" "Id")

# Print results
echo -e ""
echo -e "${BLUE}User Pool created with ID:${NC} ${GREEN}$user_pool_id${NC}"
echo -e "${BLUE}User Pool Client created with ID:${NC} ${GREEN}$user_pool_client_id${NC}"
echo -e ""
echo -e "${BLUE}Adding environment variables to your .env file..."
echo -e ""
echo -e "\n# AWS Cognito Local" >> .env
echo -e "COGNITO_USER_POOL_ID=$user_pool_id" >> .env
echo -e "COGNITO_CLIENT_ID=$user_pool_client_id" >> .env
echo -e "COGNITO_ENDPOINT=http://localhost:${COGNITO_PORT}" >> .env
echo -e "COGNITO_ISSUER="http://localhost:${COGNITO_PORT}/$user_pool_id >> .env
echo -e "${BLUE}You can configure your user pool and user pool client manually by going to ${NC}${GREEN}data/docker/volumes/cognito${NC}${BLUE}.${NC}"
echo -e "${BLUE}Remember to restart the cognito-local server if doing so! :).${NC}"

