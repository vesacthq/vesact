---
title: Data Deletion
---

Last updated: 22 September 2026

This page describes how data held by Vesact is deleted. What we hold and for how long is in the [privacy policy](/legal/privacy-policy).

## If you connected an account through a developer's application

Your Facebook Page, Instagram account or WhatsApp number was connected to Vesact by an application built on our API. Three ways to remove it:

1. **On the platform.** In Facebook, open _Settings & privacy → Settings → Apps and Websites_, find the developer's app and remove it; Instagram and WhatsApp have the same control under their app permissions. The access token stops working at once; we delete the connection and its token when the platform notifies us of the revocation or when we next find the token revoked, and in any case within 30 days.
2. **Through the developer.** Ask the developer who connected the account to remove it from their Vesact organization. The effect is the same.
3. **By email.** Write to [hello@vesact.com](mailto:hello@vesact.com) with the account's name or identifier. We confirm the request, delete the connection and the platform events that concern the account, and reply when it is done, within 30 days.

Platform events that mention the account (messages, comments, receipts) are deleted with the connection unless a legal obligation requires keeping a record of a specific transaction.

## If you are a developer

- **An API key**: revoke it in the console (_Settings → API keys_). The key stops working at once and its hash is removed; usage records keep the key's prefix for accounting.
- **A connected account**: remove it from your organization; the token is deleted with the connection and the account's events follow. Until the console has this control, write to us.
- **Your organization or your account**: write to [hello@vesact.com](mailto:hello@vesact.com) from the address you signed in with. We delete the organization with its connected accounts, keys, events, invitations and members, or your account with its sessions and the link to your Google account, within 30 days and confirm by email. Usage needed for accounting is kept for the period the tax law requires and holds no personal data beyond the organization's name.

Deleted data disappears from database backups as they are rotated, within 30 days.

## Confirmation

Requests by email receive a reply confirming receipt and another when the deletion is complete. Deletions in the console take effect immediately.
