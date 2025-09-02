#!/bin/bash

# Production deployment script
echo "Starting production deployment..."

# Set NODE_ENV to production
export NODE_ENV=production

# Build the application
echo "Building application..."
npm run build

# Start the production server
echo "Starting production server..."
npm run start