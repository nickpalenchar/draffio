#!/bin/bash
set -eou pipefail

# Get user input for stack name
stack_name=${1:-"draffio-infra"}
echo "stack name: $stack_name"

# Get the API Gateway URL from the stack
echo "getting api gateway endpoint..."
api_gateway_endpoint=$(aws cloudformation describe-stacks --stack-name "$stack_name" --query "Stacks[0].Outputs[?OutputKey=='APIGatewayEndpoint'].OutputValue" --output text)

# Get the CloudFront Distribution ID from the stack
echo "getting cloudfront distribution id..."
cloudfront_distribution_id=$(aws cloudformation describe-stacks --stack-name "$stack_name" --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text)

# Get the S3 Bucket Name from the stack
echo "getting s3 bucket..."
s3_bucket_name=$(aws cloudformation describe-stacks --stack-name "$stack_name" --query "Stacks[0].Outputs[?OutputKey=='WebS3BucketName'].OutputValue" --output text)

# Output the results
echo "API Gateway URL: $api_gateway_endpoint"
echo "CloudFront Distribution ID: $cloudfront_distribution_id"
echo "S3 Bucket Name: $s3_bucket_name"

# Move to frontend and install
cd frontend/ && npm install

# Create .env file for building distribtuion with API Gateway Endpoint defined
touch .env

# Add the API Gateway endpoint to the .env file
echo "REACT_APP_API_GW=$api_gateway_endpoint" > .env

# Confirm that the endpoint has been added to the .env file
echo "The API Gateway endpoint has been added to the .env file:"
cat .env

# Create distribution for deployment
npm run build && cd build/
cp index.html 404.html

# Sync distribution with S3
aws s3 sync . s3://$s3_bucket_name/

# Create cloudfront invalidation and capture id for next step
invalidation_output=$(aws cloudfront create-invalidation --distribution-id $cloudfront_distribution_id --output json --paths "/*")

invalidation_id=$(echo "$invalidation_output" | jq '.Invalidation.Id' )

# Get cloudfront domain name and validate
cloudfront_domain_name=$(aws cloudfront list-distributions --query "DistributionList.Items[?Id=='$cloudfront_distribution_id'].DomainName" --output text)

echo "The invalidation is now complete - please visit your cloudfront URL to test: $cloudfront_domain_name"
