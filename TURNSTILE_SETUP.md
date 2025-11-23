# Cloudflare Turnstile Setup Guide

This guide explains how to configure Cloudflare Turnstile for the WhatsApp access protection.

## 🔐 Security Model

**Important:** The Turnstile site key is a **PUBLIC** key that is visible in the browser. Obfuscation does not provide real security. The architecture works as follows:

- **Site Key (Public)**: Embedded in the frontend, used to display the CAPTCHA widget
- **Secret Key (Private)**: Should only be used server-side for token verification (not applicable for this static site)
- **Protection**: Cloudflare Turnstile provides bot protection even without server-side verification

## 📋 Setup Instructions

### 1. Get Your Turnstile Site Key

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** section
3. Create a new site or use an existing one
4. Copy your **Site Key** (public)
5. Note: Keep your **Secret Key** secure (not needed for this static site)

### 2. Configure Environment Variables

#### For Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your site key:
   ```bash
   VITE_TURNSTILE_SITE_KEY=your-actual-site-key-here
   ```

3. For testing, you can use Cloudflare's test keys:
   - Always passes: `1x00000000000000000000AA`
   - Always blocks: `2x00000000000000000000AB`
   - Force interactive: `3x00000000000000000000FF`

#### For GitHub Actions (Production)

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name**: `VITE_TURNSTILE_SITE_KEY`
   - **Value**: Your production Turnstile site key

### 3. Deploy

The GitHub Actions workflow will automatically:
1. Build the application with the secret site key
2. Deploy to GitHub Pages at www.koes.ch

To trigger deployment:
```bash
git push origin main
```

Or manually trigger via GitHub Actions tab.

## 🎭 Optional: Base64 Encoding

While not providing real security, you can encode your site key for minimal obfuscation:

### Encode a site key (Bash):
```bash
echo -n "your-site-key-here" | base64
```

### Then use the encoded value in `.env`:
```bash
VITE_TURNSTILE_SITE_KEY=eW91ci1zaXRlLWtleS1oZXJl
```

The component will automatically decode it at runtime.

**Note:** Anyone can decode base64 in the browser console, so this is purely cosmetic.

## 🧪 Testing

### Test with Cloudflare's test keys:

```bash
# In .env file
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

Then run:
```bash
bun run dev
```

Visit http://localhost:8080/whatsapp and the Turnstile widget should appear.

## 🔍 Verification

After deployment, verify the integration:

1. Visit https://www.koes.ch/whatsapp
2. The Turnstile widget should load
3. Complete the challenge
4. WhatsApp link should appear after successful verification

## 🚨 Troubleshooting

### Widget doesn't load
- Check browser console for errors
- Verify site key is correctly set in environment variables
- Ensure domain matches the one configured in Cloudflare

### Build fails in GitHub Actions
- Verify `VITE_TURNSTILE_SITE_KEY` secret is set in GitHub
- Check GitHub Actions logs for specific errors

### Widget shows "Invalid site key"
- Verify the site key matches your Cloudflare configuration
- Check that the domain is allowed in Cloudflare settings

## 📚 Additional Resources

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [React Turnstile Package](https://github.com/marsidev/react-turnstile)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## ⚠️ Important Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Site key is public** - Obfuscation is cosmetic only
3. **For better security** - Consider adding server-side verification (requires a backend)
4. **Test keys** - Only use in development, not production
