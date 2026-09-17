# Phase Shift Studio: private editor setup

## Status / backup

Based on current GitHub main commit **14ca285d5a9a0591872b15b2c0ca1da04217c044** (15 September 2026).

Backup branch: **pre-admin-editor-backup-2026-09-17**.

This is a local implementation/preview. No changes have been committed, pushed, merged or deployed. The actual Supabase setup is still required.

## 1. Files

Modified:

- index.html: numerical website prices now say **starting from:**.
- script.js: same wording in the fallback; payment toggles use the content engine when available. Existing integrations and interactions remain.
- README.txt: updated build/setup instructions.

Created:

- content/definition.mjs: editable targets and numeric pricing defaults.
- content/core.mjs: reusable WebsiteContent store, validation, plain-text rendering, price formatting, drafts/revert.
- content/runtime.mjs: public content loading and failure handling.
- content/manifest.generated.json: generated defaults/field definitions, not manually edited.
- admin/index.html, admin/editor.mjs, admin/editor.css: login gate, actual website in edit mode, EditableText/EditablePrice, save/status/revert.
- scripts/build.mjs, scripts/preview.mjs: build and local preview.
- supabase/schema.sql, supabase/seed.sql: database setup and existing content.
- tests/content.test.mjs, tests/database.test.mjs, tests/browser.mjs.
- package.json, pnpm-lock.yaml, vercel.json, .gitignore, .npmrc, .env.example.

dist/ is generated deployment output. Public styles.css, process-animation.js, assets, legal pages and sitemap remain unchanged.

## 2. Tables

| Table | Purpose |
| --- | --- |
| website_content | section, unique content_key, content_type, JSONB content_value, max_length, updated_at |
| website_admins | Allowlisted Supabase Auth user UUIDs |
| website_content_state | Revision number for safe concurrent saves |

Prices are JSON numbers, not formatted strings: monthly/upfront landing-page and website prices plus the landing-page creation fee. Apps currently have individually quoted wording, not fixed prices. No new add-on cards or invented prices were added.

## 3. SQL to run

In Supabase → SQL Editor, run in order:

1. **supabase/schema.sql**
2. **supabase/seed.sql**

The seed is generated from the current website. Rerunning it only adds missing fields; existing saved values are preserved.

These scripts do not touch the existing enquiry-intake function or quote tables. Use a fresh project or share your existing Auth project. If the same table names already exist for another system, review before running.

## 4. RLS / security

schema.sql installs:

- Public READ ONLY access to marketing content/revision.
- Authenticated users can see only their own admin membership.
- An admin-only UPDATE policy based on the allowlist.
- No browser insert/delete access, membership changes, or direct table UPDATE grants.
- A checked save_website_content function available to authenticated callers; it independently verifies auth.uid() is allowlisted.

All updates go through this function, rather than direct UPDATEs. It validates each field, saves atomically, and rejects stale revisions so another session cannot silently overwrite changes. Any invalid value rolls back the entire save.

Never use a service-role/secret key in the frontend. The publishable/anon key is intentionally browser-visible; database permissions and authentication protect writes.

## 5. Vercel environment variables

Add these to Preview and Production as appropriate:

| Name | Value |
| --- | --- |
| SUPABASE_URL | https://YOUR-PROJECT.supabase.co |
| SUPABASE_PUBLISHABLE_KEY | sb_publishable_... or the legacy anon key |

Find them under the project's Connect / API Keys section. Never use sb_secret_... or service_role. The build rejects those keys.

For local configuration, copy .env.example to .env and enter the two values yourself. Do not commit .env.

## 6. Create the admin user

In Supabase → Authentication → Users → Add user:

1. Create your email/password user yourself.
2. Confirm its email via dashboard controls if necessary.
3. Add it to the allowlist in SQL Editor:

```sql
insert into public.website_admins(user_id)
select id from auth.users
where lower(email) = lower('YOUR-ADMIN-EMAIL')
on conflict (user_id) do nothing;
```

Confirm one row was inserted. An Auth account alone does NOT grant editing permission.

There is no public signup UI. Disable public signups for a content-only project; do not change this blindly if the project also serves other applications.

To revoke an admin:

```sql
delete from public.website_admins
where user_id = 'ADMIN-USER-UUID';
```

Use a strong unique password. Protect the Supabase dashboard account with MFA.

## 7. Build / preview / deployment

With Node.js 22 or newer, run from the project folder:

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm run preview
```

Open http://127.0.0.1:4173/ and http://127.0.0.1:4173/admin.

Without Supabase configuration, the public fallback still works; admin login is disabled with a setup message.

Vercel:

- Framework preset: Other.
- Build: npm run build.
- Output directory: dist.
- Repository root: this project root.
- Install dependencies from the lockfile.

vercel.json supplies the build settings and /admin route. Publish the generated dist output, not the raw source directory. A no-build deployment will not generate the runtime/configuration.

If the domain still uses GitHub Pages, adding Vercel configuration does not automatically move it. Do not merge/deploy production until approved. First create a preview deployment and test the real Supabase connection.

Use a separate Supabase test project if preview edits must be isolated from production.

## 8. Log into /admin

Manually visit https://phaseshiftstudio.com.au/admin after deployment. No public login/admin link is added.

Log in with your allowlisted Supabase user. The editor verifies the Auth user and membership before loading the editing interface.

You see the actual website:

- Click text/a price or focus it and press Enter.
- Edit plain text or a numeric AUD value in the small inline editor.
- Done previews the draft; it does not save to Supabase yet.
- Switch MONTHLY / ONE-TIME to edit each option's prices, inclusions and wording.
- FAQs expand normally; use their pencil button to edit a question.
- Save Changes validates and publishes the draft.
- Cancel / Revert discards unsaved changes.
- Load latest reloads saved content.

Status shows Unsaved changes, Saving… or Saved ✓. Escape undoes the current small inline edit. Reloading loses unsaved work, with a browser warning.

The enquiry form is intentionally preview-only on /admin to prevent accidental messages/draft quotes. The public form stays unchanged.

## 9. Public content retrieval / fallback

The build retains existing HTML as the first paint/fallback, adding field attributes and a small public content loader. No editor/auth UI or admin stylesheet loads on /.

The loader calls read_website_content using the public key. Values replace existing text nodes, preserving coloured spans, line breaks and component structure. Saved HTML is never executed. Numeric values are formatted as AUD.

Normal saves require no GitHub edits or redeploys. New visits fetch saved content immediately. Already-open public pages update on focus and every 15 seconds while visible; other tabs in the same browser receive an immediate save notification.

If Supabase is unavailable or invalid, original/default or last successfully fetched content remains visible, not blank pricing. With JavaScript disabled, the original fallback remains.

SEO tags, canonical URL, structured data, icons, legal pages and sitemap remain. Admin has noindex/nofollow and is excluded in generated robots.txt. SEO metadata is not editable through this marketing-copy editor.

## 10. Add another field

A one-time developer step:

1. Add/select the existing text element in source HTML.
2. Add a stable target entry in content/definition.mjs:

```js
{id: 'hero.extra_caption', selector: '.hero-extra-caption'}
```

3. Build to regenerate the manifest and seed.
4. Run updated seed.sql to add the field.
5. Deploy updated code once.

Afterward, change it through /admin without deploying. Keep IDs/selectors stable. Text segments get text_N keys so existing spans/line breaks are preserved; duplicate promotions share their content.

For client reuse, replace the site-specific definition/template/styles; reuse the store, loader, editor and database pattern. Use a separate Supabase project per client to isolate access/content.

## Verification

Run the core/database checks with `pnpm test`. Browser checks use Playwright;
install it locally with `pnpm add -D playwright` and `pnpm exec playwright install chromium`,
then run `pnpm run test:browser`. The optional BASELINE_ROOT environment variable
points to an untouched source copy for comparing the known 320px overflow.
Without that baseline, the 320px check intentionally flags the existing overflow.

Passed locally:

- Six automated content/database tests, executing actual SQL in an isolated PostgreSQL-compatible test engine.
- Anonymous reads; denied public writes/save-function execution.
- Denied logged-in non-admin saves and self-promotion.
- Valid numeric/text saves, rollback on invalid input, stale-revision rejection and revoked-admin denial.
- Desktop 1440px and mobile 390px pricing, navigation, FAQs and layout.
- No public editing controls; Supabase outage fallback.
- Authorised inline editing, creation fee editing, save/revert/conflict, public refresh and logout.
- Existing enquiry-intake and Web3Forms requests, mocked so no real messages were sent.
- Process highlight movement/pause; no browser JavaScript errors.
- Unchanged public CSS/process animation, retained SEO and form structure.

Existing issue: at 320px, the hero overflows in the fallback-font test (357px document width). The untouched baseline does the same. No unrelated styling fix was made.

Existing price mismatch: initial HTML showed $179/month for Custom Website, while old toggle JS changed it to $199. The content engine preserves the visible $179 consistently. One-time prices remain $499 and $1,450.

Still required: run SQL, create/allowlist the real user, set environment variables, then test real login/save/public retrieval and denied non-admin saves on a configured preview. Local tests do not mean live Supabase policies have already been installed. A real enquiry submission needs your permission.

Sources: [Supabase keys](https://supabase.com/docs/guides/getting-started/api-keys), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Database functions](https://supabase.com/docs/guides/database/functions), [Vercel build settings](https://vercel.com/docs/builds/configure-a-build).
