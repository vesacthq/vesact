---
title: Privacy Policy
---

Last updated: 22 September 2026

Vesact is an API platform operated by 西安速准科技有限公司 (the "Operator", "we"). It lets developers connect messaging and social media accounts of their own customers and work with them through one API at `api.vesact.com`, managed from the console at `console.vesact.com`. This policy explains what personal data passes through the service, why, and what you can do about it. Contact: [hello@vesact.com](mailto:hello@vesact.com).

## Who this covers

- **Developers**: people who sign in to the console, create an organization and issue API keys.
- **Connected account holders**: businesses or people who authorize a platform account (a Facebook Page, an Instagram professional account, a WhatsApp Business number) so that a developer's application can use it through Vesact.
- **End users**: people who message or interact with a connected account. We never contact them; their data reaches us only inside the platform events described below.

## What we process

**Console accounts.** Name, email address and the identifier of the Google account you sign in with; the organizations you belong to, their names and member roles; invitations you send or receive; session records (a hashed token, IP address, browser user agent, timestamps).

**API keys and usage.** Keys are stored as hashes with their prefix, name, scopes and expiry. Every request to `/v1` is recorded with its key, route, status, timing and request id for rate limiting, quotas, billing and troubleshooting. Idempotency keys you send are kept with the response they produced for 24 hours.

**Connected accounts.** When an account is authorized through Vesact, the platform gives us the account's identifier and name, the permissions granted and an access token. We store these to act on the account on the developer's behalf and to tell the developer whether the connection is healthy. Account connection is being rolled out platform by platform; until a platform is live, no such data of its users reaches us.

**Platform events and API content.** Messages, comments, delivery receipts and similar events sent to us by Meta and other platforms are stored with their payload so that we can deliver them to the developer's webhook endpoint, retry deliveries and let developers inspect them in the console. Content sent through the API (messages, posts, media references) is processed to perform the request and kept with the request record.

**Operations.** Server logs with request ids, IP addresses and user agents; product analytics on this website (page views), collected through our own domain and without advertising identifiers.

## Why, and on what basis

We process this data to provide the service you or your organization asked for (performing the contract), to keep it secure, to bill for it, to comply with the platforms' terms and with law, and, for analytics, on the basis of our legitimate interest in understanding how the product is used. We do not sell personal data and do not use it for advertising.

## Platform data

Data received from Meta (Facebook, Instagram, WhatsApp), TikTok, Google and other platforms is used only to provide the features the connected account holder authorized, in accordance with each platform's developer terms, including the Meta Platform Terms. Developers who receive platform data through Vesact are responsible for using it within the same limits.

## Who else sees it

We run the service on third-party infrastructure that processes data on our behalf:

- **Cloudflare** (hosting and network)
- **Neon** (database, hosted in Singapore)
- **PostHog** (website analytics)
- **Google** (sign-in to the console; the web fonts this website loads from Google Fonts)

The developer whose organization holds a connected account receives the events and content that concern it. We disclose data to authorities when the law requires it.

## International transfers

The Operator is located in China; the infrastructure above runs in Singapore, the United States and Cloudflare's global network. By using the service you accept that data is processed in these locations.

## Retention

Console accounts, organizations, API keys, usage records and platform events are kept while the organization exists and deleted with it, or earlier on request (see the [data deletion page](/legal/data-deletion)); usage needed for accounting is kept for the period the tax law requires. Session records expire with the session; idempotency records stop being used after 24 hours; access tokens are deleted when the connection is removed. We will publish fixed retention periods for events and request records when automatic clean-up is in place.

## Your rights

You can access, correct, export and delete your data. Developers do this in the console; connected account holders remove the authorization on the platform or ask the developer who connected the account; anyone can write to [hello@vesact.com](mailto:hello@vesact.com). How deletion works is described on the [data deletion page](/legal/data-deletion). Depending on where you live you may also have the right to object to or restrict processing and to complain to a supervisory authority.

## Cookies

The console uses a session cookie and a cookie that remembers your language. This website uses the language cookie and PostHog's first-party analytics cookie, which identifies a browser to us and to nobody else. None of them is used for advertising or for tracking across other sites.

## Changes

We post changes on this page with a new date. Material changes are announced in the console.
