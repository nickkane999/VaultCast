#!/bin/bash

echo "=== VaultCast Secrets Setup ==="
echo "This script will help you set up API keys for VaultCast"
echo ""

# Function to encode base64
encode_base64() {
    echo -n "$1" | base64
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

echo "🔑 Setting up API keys..."
echo ""

# OpenAI API Key (required)
read -p "Enter your OpenAI API Key (required): " openai_key
if [ -z "$openai_key" ]; then
    echo "❌ OpenAI API Key is required"
    exit 1
fi

# Google Vision API Key (optional)
read -p "Enter your Google Vision API Key (optional, press Enter to skip): " google_key

# AWS credentials (optional)
read -p "Enter your AWS Access Key ID (optional, press Enter to skip): " aws_access_key
if [ ! -z "$aws_access_key" ]; then
    read -p "Enter your AWS Secret Access Key: " aws_secret_key
    read -p "Enter your AWS Region (default: us-east-1): " aws_region
    aws_region=${aws_region:-us-east-1}
fi

echo ""
echo "🔧 Creating secrets file..."

# Create secrets YAML
cat > ../main/secrets.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: vaultcast-secrets
  namespace: vaultcast
type: Opaque
data:
  openai-api-key: "$(encode_base64 "$openai_key")"
EOF

if [ ! -z "$google_key" ]; then
    echo "  google-vision-api-key: \"$(encode_base64 "$google_key")\"" >> ../main/secrets.yaml
fi

if [ ! -z "$aws_access_key" ]; then
    echo "  aws-access-key-id: \"$(encode_base64 "$aws_access_key")\"" >> ../main/secrets.yaml
    echo "  aws-secret-access-key: \"$(encode_base64 "$aws_secret_key")\"" >> ../main/secrets.yaml
    echo "  AWS_REGION: \"$(encode_base64 "$aws_region")\"" >> ../main/secrets.yaml
fi

echo ""
echo "✅ Secrets file created successfully!"
echo "📁 File location: ../main/secrets.yaml"
echo ""
echo "🚀 You can now deploy VaultCast with:"
echo "  cd ../main && ./deploy.sh" 