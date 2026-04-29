# Spec: Add .env.example to All Apps

## Overview

Add `.env.example` files to all apps (IM3, BM2, IM1, IM2, PreCalc) providing reference documentation for required environment variables. No app currently has an env reference, making onboarding difficult for new developers.

## Requirements

1. Create `.env.example` files in each app directory
2. Document all required environment variables with descriptions
3. Include placeholder values where appropriate
4. Do NOT include actual secrets - only example/placeholder values

## Apps to Update

- `apps/integrated-math-3/`
- `apps/bus-math-v2/`
- `apps/integrated-math-1/`
- `apps/integrated-math-2/`
- `apps/pre-calculus/`

## Common Variables to Document

- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `AUTH_*` - Auth provider configuration (Clerk, etc.)
- `OPENROUTER_API_KEY` - AI tutoring API key
- Database connection strings if applicable
- Feature flags

## Verification

- All apps have `.env.example` file
- Files contain meaningful comments/descriptions
- No actual secrets present
- Files tracked in git