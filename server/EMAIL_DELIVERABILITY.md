# SMTP Deliverability (SPF, DKIM, DMARC)

Use a custom sending domain for `MAIL_FROM` and align it with your SMTP server.

## 1) App Configuration

Set these values in `server/.env`:

```env
MAIL_FROM=Lakminda Academy <noreply@mail.yourdomain.com>
MAIL_DOMAIN=mail.yourdomain.com
SMTP_HELO_DOMAIN=mail.yourdomain.com
```

Notes:
- `MAIL_FROM` is the visible From header.
- SMTP envelope sender uses the address inside `MAIL_FROM`.
- `MAIL_DOMAIN` enforces SPF/DKIM/DMARC alignment in app logic.

## 2) SPF DNS Record

Publish SPF at the envelope-sender domain (`mail.yourdomain.com` in this example):

```txt
Type: TXT
Host: mail.yourdomain.com
Value: v=spf1 include:_spf.your-smtp-provider.com -all
```

Replace include with your SMTP provider's official SPF include.

## 3) DKIM DNS Record

Generate DKIM keys in your SMTP server/provider and publish selector record:

```txt
Type: TXT
Host: s1._domainkey.mail.yourdomain.com
Value: v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY
```

Your SMTP server must sign outbound messages with the matching private key.

## 4) DMARC DNS Record

Publish DMARC policy at the organizational domain:

```txt
Type: TXT
Host: _dmarc.yourdomain.com
Value: v=DMARC1; p=quarantine; adkim=s; aspf=s; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc@yourdomain.com; fo=1
```

Start with `p=none` for monitoring if needed, then move to `quarantine` or `reject`.

## 5) Verification

- Use Google Postmaster Tools or your provider dashboard to monitor reputation.
- Send test emails and inspect headers for:
  - `SPF=pass`
  - `DKIM=pass`
  - `DMARC=pass`

This project already sets deliverability-friendly message headers (`Date`, `Message-ID`, `Reply-To`, `Sender`, `List-Unsubscribe`, multipart text+HTML).
