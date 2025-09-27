# Updating OpenRouter API Key in Production

## Issue Identified

Based on our investigation, the interview question generation is working in localhost but not in the deployed environment. We've implemented the following fixes:

1. Added extensive console logging in `aiService.js` to debug API calls
2. Implemented a fallback to mock questions in `interviews.js` if the API fails

## Next Step: Update OpenRouter API Key

The most likely issue is that the OpenRouter API key in production needs to be updated or verified. Here's how to update it in your Render deployment:

### Option 1: Using Render Dashboard

1. Log in to your [Render Dashboard](https://dashboard.render.com/)
2. Navigate to your "interview-ai" web service
3. Go to the "Environment" tab
4. Find the `OPENROUTER_API_KEY` environment variable
5. Click "Edit" and update the value with a valid OpenRouter API key
6. Click "Save Changes"
7. Your service will automatically redeploy with the new environment variable

### Option 2: Using Render CLI (if installed)

```bash
render env set OPENROUTER_API_KEY=your_new_api_key -s interview-ai
```

### Verifying Your OpenRouter API Key

To verify that your OpenRouter API key is valid, you can make a test request:

```bash
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "openai/gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello, world!"}]
  }'
```

## After Updating the API Key

1. Monitor the application logs in Render to see if the API calls are successful
2. Test the interview question generation in the deployed application
3. If issues persist, the fallback to mock questions should ensure users can still use the application

## Additional Troubleshooting

If updating the API key doesn't resolve the issue, check:

1. Network restrictions: Ensure Render's servers can access openrouter.ai
2. Rate limits: Check if you've exceeded OpenRouter's rate limits
3. Billing: Verify your OpenRouter account is in good standing

The implemented fallback mechanism will ensure users can still use the application even if there are issues with the OpenRouter API.