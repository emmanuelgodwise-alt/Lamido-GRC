# Owner Launch Checklist

**Prepared: 21 October 2026 (Stage 8).** Everything the site needs from its
owner before public launch, in one place. Nothing here is fabricated in the
meantime — every open item below is visibly labelled or honestly disabled in
the product until you complete it.

## A. Content placeholders still in the product (all clearly labelled)

| Item | Where it shows today | What to provide |
| --- | --- | --- |
| Official contact email | Contact page shows "Official contact details will be published once confirmed by the company." | The public business email (and phone/address if desired) → then update `src/lib/site.ts` (`contactEmail`) and the Contact page copy |
| Privacy Notice placeholders | Retention periods, governing law, data-controller details marked as drafts | Owner/legal review, then final wording |
| Terms of Use placeholders | Legal-review notes inline | Owner/legal review, then final wording |
| Production domain | Deployment uses the auto-detected Vercel URL | Add the custom domain, then set `NEXT_PUBLIC_SITE_URL` in Vercel and redeploy |
| Real business details (address, registration, socials) | Deliberately absent (never invented) | Provide only what you want published; update About/footer |

## B. Backend go-live (required before accepting real enquiries)

1. Create the free Supabase project and apply the migrations —
   **[supabase-setup.md](supabase-setup.md)** (click-by-click).
2. Create the first administrator (no public sign-up exists, by design).
3. Run the RLS verification checklist (`supabase/verify-rls.sql`).
4. Deploy the `create-enquiry` Edge Function + its secrets —
   **[enquiry-live-test.md](enquiry-live-test.md)**.
5. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
   Vercel → **redeploy** (these values are baked at build time).
6. Run the 10-step live enquiry test end-to-end: submit a real enquiry and
   read it in the admin dashboard. **Only then is the form production-ready.**

## C. Hosting decision (required before commercial launch)

- The Vercel **Hobby** plan is designated for personal, non-commercial use
  (see [deployment.md](deployment.md) — checked 21 Oct 2026). Before the
  company site goes public, either select a Vercel plan whose current terms
  permit commercial use **or** move to the $0 static alternative
  (Cloudflare Pages — same repository, same `out/` build, steps included in
  deployment.md). The code stays fully portable either way.

## D. Device + live-URL verification (after the next deployment)

- Install the PWA on Android Chrome and iOS Safari —
  **[pwa-verification.md](pwa-verification.md)**.
- Confirm the update toast behaves after the next deploy (Refresh/Later,
  never auto-reload).
- Re-run Lighthouse against the live URL and record the numbers.
- Spot-check deep links (e.g. `/services/…`, `/privacy`) and `/admin` on a
  phone and a desktop.

## E. Optional, deliberately not enabled

- **Turnstile** anti-bot on the enquiry form (built, feature-flagged OFF).
- **Email notifications** for new enquiries (explicitly not promised in the
  Privacy Notice; not implemented — administer leads via the dashboard).
- Any analytics/tracking (none is present; enabling any requires a privacy
  review first).

## F. Security hygiene (standing)

- Keep both previously pasted GitHub PATs **revoked** (they exist in chat
  history; a pasted token is compromised by definition).
- Never paste tokens or the Supabase service-role key into any chat, issue,
  or commit. The service-role key belongs only in Edge Function secrets.
