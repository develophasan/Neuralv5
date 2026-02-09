# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the `apps/web` directory with the following variables:

```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Google Gemini API Key
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

## Security Notes

⚠️ **IMPORTANT**: Never commit your `.env` file to Git!

- The `.env` file is already in `.gitignore`
- Never hardcode API keys in source code
- Use environment variables for all sensitive data
- Rotate API keys if they are accidentally exposed

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

## API Key Restrictions (Recommended)

For better security, add restrictions to your API key in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your API key and click "Edit"
4. Add restrictions:
   - **Application restrictions**: HTTP referrers (for web apps)
   - **API restrictions**: Restrict to "Generative Language API" only

