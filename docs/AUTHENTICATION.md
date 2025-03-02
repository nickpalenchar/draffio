# Authentication in Draff.io

## Overview
Draff.io uses Auth0 for authentication, implementing a Single Page Application (SPA) authentication flow. This provides secure user authentication without requiring backend session management.

## Auth0 Setup

### Application Configuration
1. Create an Auth0 application of type "Single Page Application"
2. Configure the following URLs in Auth0 dashboard:
   - Allowed Callback URLs: `http://localhost:3000` (development)
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
   - Allowed Origins (CORS): `http://localhost:3000`

### Critical Settings
Under the "Credentials" tab:
- Set "Token Endpoint Authentication Method" to `none` (required for SPAs)
- No client secret is needed as this is a public client

### Environment Variables
Required environment variables in `.env`: 