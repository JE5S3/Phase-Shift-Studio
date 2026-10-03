# Central website editor connection

This reviewed change connects the standalone Phase Shift website to the hosted central CMS at https://phase-shift-cms.vercel.app. Published text, prices, contact details and approved photos load through its public API. Saving a private draft does not change the public page.

The original page design, assets, styles, page scripts, enquiry form and enquiry delivery code remain in place. The public build adds the approved contact/location/ABN bindings and photo slots. Its initial HTML and local runtime use the backed-up revision 2 content, so the site retains the current copy and both pricing modes during a content-service outage.

The existing `/admin` addresses redirect to the central editor. Original editor source, database tables and integrations remain available for rollback. The retained editor build keeps its separate legacy manifest; it does not publish to the central CMS.

## Verification

Run `pnpm run build` and `pnpm test`. The build and all 9 checks passed. They cover the original renderer and database permissions, unchanged SEO/form/styles/scripts, the central API origin, private preview origin/parent validation, current fallback content and payment options.

The central CMS has separately passed live administrator login, private draft save/reload, price and photo publication on its Phase Shift pilot page, and complete previous-publication recovery. Its automated suite passes 19 checks. The original public domain still requires served-page checks after the reviewed connection is promoted.

## Cutover and rollback

After the connection is deployed, verify https://phaseshiftstudio.com.au and `/admin`, then change this business's CMS preview address from `/pilot/` to `https://phaseshiftstudio.com.au`. Check private draft rendering in the embedded live site without submitting the enquiry form.

To roll back, revert this connection commit and restore the previous Vercel deployment. The original content tables and editor source were retained. No database migration or DNS change is included in this change.

When `edit.phaseshiftstudio.com.au` is configured and verified, update the approved CMS origin in `content/central-cms.mjs`, the redirects and onboarding instructions together. Its script remains bundled with the standalone website so a CMS outage does not remove the page renderer.

