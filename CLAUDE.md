# Cloudflare Turnstile Integration

## Tasks

- [x] Create CLAUDE.md file to track tasks
- [x] Install react-turnstile package
- [x] Create CaptchaDialog component
- [x] Create WhatsAppProvider component with context
- [x] Replace WhatsApp links in Hero.tsx with buttons
- [x] Replace WhatsApp links in Navbar.tsx with buttons
- [x] Replace WhatsApp links in Footer.tsx with buttons
- [x] Integrate WhatsAppProvider into App.tsx
- [x] Commit and push changes

## Implementation Notes

### CaptchaDialog Component
- Props: `open`, `onOpenChange`, `onVerify`, `title`, `description`
- Uses existing Dialog component from Shadcn UI
- Integrates Cloudflare Turnstile via react-turnstile

### WhatsAppProvider Component
- Manages URL state (initially undefined)
- Provides action to open WhatsApp URL
- If URL is undefined, shows CaptchaDialog first
- Contains stub onVerify callback returning static example URL
- After verification, stores URL and redirects

## Files Changed
- `src/components/CaptchaDialog.tsx` - New reusable captcha dialog component
- `src/components/WhatsAppProvider.tsx` - New context provider for WhatsApp functionality
- `src/components/Hero.tsx` - Replaced WhatsApp links with buttons
- `src/components/Navbar.tsx` - Replaced WhatsApp links with buttons
- `src/components/Footer.tsx` - Replaced WhatsApp links with buttons
- `src/App.tsx` - Added WhatsAppProvider wrapper
- `package.json` - Added react-turnstile dependency
