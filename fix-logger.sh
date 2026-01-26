#!/bin/bash

# Fix logger.error patterns in email-service.ts

# Pattern 1: Fix simple logger.error with context
sed -i '' 's/logger\.error(\([^,]*\), {/logger.error(\1, error instanceof Error ? error : new Error(String(error)), {/' src/lib/email-service.ts

# Remove error: errorMessage lines
sed -i '' '/error: errorMessage,/d' src/lib/email-service.ts

echo "Fixed logger.error patterns in email-service.ts"