# Security Guidelines for Developers

## 🔐 Quick Security Checklist Before Committing

```bash
# 1. Never commit secrets
git status  # Check .env.local is NOT listed

# 2. Check for credentials in code
grep -r "password\|api_key\|secret" src/
grep -r "mongodb+srv://" src/

# 3. Run security checks
npm audit --audit-level=moderate
npm run security-check

# 4. Use proper validation
# ✅ DO:
const validation = validateEmail(email);
if (!validation.isValid) return error;

# ❌ DON'T:
const email = req.body.email; // No validation!
```

---

## 📋 Development Rules

### 1. **Never Store Secrets in Code**
```typescript
// ❌ BAD
const API_KEY = "sk_live_abc123def456";

// ✅ GOOD
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error('API_KEY not configured');
```

### 2. **Always Validate User Input**
```typescript
// ❌ BAD
const results = await search(userQuery);

// ✅ GOOD
const validation = validateSearchQuery(userQuery);
if (!validation.isValid) return error(validation.error);
const sanitized = validation.sanitized;
```

### 3. **Never Expose Errors to Users**
```typescript
// ❌ BAD
return { error: err.message }; // Exposes internals!

// ✅ GOOD
console.error('Error details:', err);
return { error: 'Operation failed. Please try again.' };
```

### 4. **Use Secure HTTP Headers**
```typescript
// ✅ Already configured in middleware.ts
// Just ensure middleware.ts is loaded!
```

### 5. **Rate Limit Public Endpoints**
```typescript
// ✅ Implemented in search route
// Pattern to follow:
const ip = extractClientIp(req);
const rateLimit = checkRateLimit(`search:${ip}`, 30, 60);
if (!rateLimit.allowed) return tooManyRequests();
```

### 6. **Validate File Uploads**
```typescript
// ✅ DO:
const validation = validateImageFile(file);
if (!validation.isValid) return error(validation.error);

// ❌ DON'T:
const file = req.files.image; // No validation!
```

### 7. **Use HTTPS Only in Production**
```typescript
// ✅ Set in environment
ENFORCE_HTTPS=true (production only)

// ✅ Middleware handles validation
if (NODE_ENV === 'production') {
  setHeader('Strict-Transport-Security', '...');
}
```

### 8. **Implement Strong Authentication**
```typescript
// Current: Email-based (not secure for production)
// TODO: Implement:
1. User sign-up with email verification
2. Password hashing (bcrypt/argon2)
3. JWT token generation
4. Token refresh mechanism
5. Logout/revocation
```

---

## 🛠️ Common Tasks

### Adding a New API Endpoint

```typescript
import { NextResponse } from 'next/server';
import { validateEmail, validateProductId } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    // 1. Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`endpoint:${ip}`, 30, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // 2. Parse request
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    // 3. Validate inputs
    const validation = validateEmail(body.email);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // 4. Business logic
    const result = await doSomething(validation.sanitized);

    // 5. Return safe response
    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );

  } catch (error) {
    // 6. Error handling (don't leak internals)
    const err = error as Error;
    console.error('Error:', err.message);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
```

### Adding Form Handling in Components

```typescript
'use client';
import { useState } from 'react';
import { validateEmail } from '@/lib/validation';

export default function Form() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validate input
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    try {
      // 2. Send with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: validation.sanitized }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed');
      }

      // 3. Handle success
      const result = await response.json();
      console.log('Success:', result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email"
        maxLength={254}
      />
      {error && <div role="alert">{error}</div>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 🔍 Security Testing

### Before Deploying

```bash
# 1. Check for secrets
git diff HEAD~1 | grep -i "password\|key\|secret\|uri"

# 2. Run linter
npm run lint

# 3. Run security audit
npm audit --audit-level=moderate

# 4. Check dependencies
npm outdated

# 5. Test locally
npm run build
npm start

# 6. Test APIs manually
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## 📞 Reporting Security Issues

**DO NOT** create a public GitHub issue for security vulnerabilities!

Instead:
1. Email: security@smartcompare.dev (if available)
2. Use GitHub Security Advisory: Settings → Security → Report vulnerability
3. Follow responsible disclosure: 90-day deadline for public disclosure

---

## 🎓 Learning Resources

- **OWASP Cheat Sheets:** https://cheatsheetseries.owasp.org/
- **Node.js Security:** https://nodejs.org/en/docs/guides/security/
- **NPM Audit:** https://docs.npmjs.com/cli/v8/commands/npm-audit
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8949

---

## ❓ Common Questions

### Q: Why do we validate input if Mongoose is safe?
**A:** Defense in depth! Multiple layers:
1. Input validation (catches issues early)
2. Mongoose parameterization (prevents injection)
3. Error handling (prevents leaks)
4. Rate limiting (prevents abuse)

### Q: Can I use crypto-js instead of Web Crypto API?
**A:** No! Crypto-js has known vulnerabilities. Use:
```typescript
// Browser
const data = new TextEncoder().encode('secret');
const hash = await crypto.subtle.digest('SHA-256', data);

// Node.js
const crypto = require('crypto');
const hash = crypto.createHash('sha256').update('secret').digest();
```

### Q: Why can't I store tokens in localStorage?
**A:** localStorage is vulnerable to XSS. Use:
- HttpOnly cookies (immune to JavaScript access)
- sessionStorage (cleared on browser close)
- In-memory (cleared on page refresh)

### Q: How do I implement user authentication?
**A:** Use a library like NextAuth.js or Passport.js
```typescript
// Example with NextAuth.js (not implemented yet)
import { auth } from '@/lib/auth';

export async function POST(req) {
  const session = await auth();
  if (!session) return Unauthorized();
  // ... rest of logic
}
```

---

## 📝 Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-02-22 | AI Assistant | Initial security hardening |

