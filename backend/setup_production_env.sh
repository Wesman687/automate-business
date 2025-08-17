#!/bin/bash
# Production Environment Setup Script
# Run this on your production server to set the required environment variables

echo "🔧 Setting up production environment variables..."

# Set production environment
export ENVIRONMENT=production
export HTTPS_ENABLED=true

# Add to your shell profile for persistence
echo "export ENVIRONMENT=production" >> ~/.bashrc
echo "export HTTPS_ENABLED=true" >> ~/.bashrc

echo "✅ Environment variables set:"
echo "   ENVIRONMENT=$ENVIRONMENT"
echo "   HTTPS_ENABLED=$HTTPS_ENABLED"
echo ""
echo "🔄 Please restart your backend service for changes to take effect:"
echo "   sudo systemctl restart your-backend-service"
echo ""
echo "🧪 Test the authentication debug endpoint:"
echo "   curl https://server.stream-lineai.com/auth/debug/auth-status"
echo ""
echo "📋 Expected cookie attributes in production:"
echo "   ✅ Secure: true"
echo "   ✅ SameSite: None"
echo "   ✅ HttpOnly: true"
echo "   ✅ Path: /"
echo "   ✅ Domain: null (no domain restriction)"
