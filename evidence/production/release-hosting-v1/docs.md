# here.now agent mode

product: here.now
domain: here.now
base_url: https://here.now
docs_url: https://here.now/docs
skill_url: https://here.now/skill.md
support_email: hello@here.now

## Summary
here.now lets agents publish static Sites to live URLs at {slug}.here.now or custom domains.

## Primary job
1. Publish Sites to live URLs at {slug}.here.now or custom domains.

## When to use
- Use here.now when a user asks an agent to publish, host, deploy, share, or put a file, folder, website, app, report, dashboard, visualization, or document online.
- Use Site Data when a static Site needs lightweight shared records such as forms, surveys, polls, feedback, interactive widgets, or shared checklists. Read the docs before generating the manifest.
- Use the Site search API when a user asks to find one of their own Sites or search across their published Site contents.
- Use the versions API when a user asks to see earlier versions of a Site, compare what changed, undo a publish, or roll back to how a Site looked before.
- Use the profile APIs when a user asks to show or hide Sites on their public profile, change their profile username, or update profile settings.
- Use here.now when a user needs a live URL quickly and does not want to create an account first.
- Use here.now when a user wants a widget or embeddable component for an existing website: publish it as a public Site and give them an iframe tag pointing at its URL.
- Use a here.now workspace when the user wants a Site owned by their team rather than their personal account — publishing into it just means adding the X-HereNow-Account selector.
- Use here.now Drive when a user asks an agent to save private files, store context for later, share a folder with another agent, or keep durable cloud state outside the local workspace.
- Do not use here.now for server-side compute, long-running processes, general-purpose databases, or backend code execution. Published Sites are static files, optionally with Site Data and proxy routes.

## Authentication
- Anonymous publishing: omit Authorization. Sites expire after 24 hours and have lower limits.
- Authenticated API: send Authorization: Bearer <API_KEY>.
- Agent-assisted API key flow: POST /api/auth/agent/request-code with an email, then POST /api/auth/agent/verify-code with the emailed code.
- Recommended agent storage: write the returned API key to ~/.herenow/credentials with 0600 permissions.
- Accounts support up to 50 named API keys (hnk_ prefix), each individually revocable. Manage them via GET/POST /api/v1/me/keys and DELETE /api/v1/me/keys/:id. Use one key per agent or tool. See /docs#api-keys.
- Workspace targeting: API keys are personal; add X-HereNow-Account: <workspace-subdomain-or-uuid> (or the account body field on publish create) to act inside a workspace. No selector always means the personal account. List valid selectors with GET /api/v1/accounts. See /docs#workspaces.
- Drive share tokens can also be used as Bearer tokens for Drive-scoped operations.
- Stripe Projects: `stripe projects add herenow/hosting` provisions a here.now account and syncs an API key to the project environment as HERENOW_API_KEY. See /docs#stripe-projects.

## Key endpoints
One line per operation. Full request/response schemas, parameters, and error codes: [openapi.json](https://here.now/openapi.json). The HTML docs at https://here.now/docs carry worked examples and section anchors (e.g. /docs#mounts); this text version is a summary and does not include those anchors.

- POST /api/v1/publish - create a new Site and receive presigned upload URLs.
- PUT /api/v1/publish/:slug - update an existing Site.
- POST /api/v1/publish/:slug/finalize - make an uploaded version live.
- POST /api/v1/publish/:slug/uploads/refresh - refresh expired presigned upload URLs so an interrupted upload can resume (API keys and anonymous claim tokens both work).
- PATCH /api/v1/publish/:slug/metadata - patch Site displayName/displayDescription, TTL, viewer metadata, password, and SPA mode.
- GET /api/v1/publish/:slug - get Site details, including the live version's manifest and its attribution (currentVersionSource, currentVersionCreatedAt: what made it live and when).
- GET /api/v1/publish/:slug/files - list the live version's files with a ready-to-GET url per file (owner API key; workspace Sites via X-HereNow-Account).
- GET /api/v1/publish/:slug/files/:path - read one file's bytes from the live version (owner API key). Works for password-protected and restricted Sites without the visitor password; use it to inspect before editing, to reconcile after a version_conflict, or to export a Site. HEAD returns the headers (ETag = sha256, Content-Length) without the body.
- DELETE /api/v1/publish/:slug - delete a Site.
- POST /api/v1/publish/:slug/claim - claim an anonymous Site into the authenticated account using its claim token.
- POST /api/v1/publish/:slug/duplicate - duplicate an owned Site to a new slug (does not copy passwords, restricted allowlists, domain mounts, or TTL).
- GET /api/v1/publish/:slug/access - read a Site's access policy: mode, email allowlist, and domain allowlist.
- PATCH /api/v1/publish/:slug/access - set anyone_with_link or restricted access. Replaces the full allowlists; read, merge, then write to add one entry.
- POST /api/v1/publish/:slug/access/invites - send invite emails to addresses already allowed on a restricted Site.
- GET /api/v1/publishes - list the selected account's Sites. Add scope=all to list everything the caller can see (personal + shared + joined workspaces, cursor-paginated with ownership/workspace annotations); scope=all cannot combine with X-HereNow-Account.
- GET /api/v1/publishes/search - search the authenticated user's active Sites by metadata, path, and indexed content with ?q=<query>. Add includeShared=1 to include accepted/opened Sites shared with the authenticated account.
- GET /api/v1/publishes/:slug/data/:collection - list owner-visible Site Data records for one owned Site collection (collections are declared in the Site's published .herenow/data.json manifest; see /docs#sitedata).
- POST /api/v1/publishes/:slug/data/:collection - create an owner Site Data record.
- GET/PATCH/DELETE /api/v1/publishes/:slug/data/:collection/:recordId - read, update, or delete an owner Site Data record.
- GET /api/v1/publishes/:slug/analytics - get paid-plan analytics for one owned Site with ?range=24h|7d|30d|90d|all.
- GET /api/v1/analytics - get paid-plan analytics rollups across all owned Sites with ?range=24h|7d|30d|90d|all.
- GET /api/v1/publish/:slug/versions - list a Site's recorded version history (paid plans and workspace Sites), including owner-only previewUrl hosts.
- POST /api/v1/publish/:slug/versions/:versionId/restore - instantly restore a past version as the live Site (pointer flip, no re-upload).
- DELETE /api/v1/publish/:slug/versions/:versionId - permanently delete one historical version (the live version cannot be deleted).
- POST /api/v1/publish/from-drive - publish a Drive version as a Site.
- GET /api/v1/domains - list the selected account's custom domains, including each domain's mounts.
- POST /api/v1/domains - connect a custom domain to the selected account (returns DNS instructions and verification status).
- GET /api/v1/domains/:domain - check one custom domain's verification and serving status. Pending domains normally verify within ~20 minutes of DNS records being added; the response's verification.state is "verifying" (on track, keep polling) or "action_required" (fix DNS to match dns_instructions). Never delete and re-add a pending domain: that restarts verification and disconnects mounted Sites.
- DELETE /api/v1/domains/:domain - disconnect a custom domain.
- GET /api/v1/publish/:slug/primary-domain - read the Site's primary-domain state and the eligible domain mounts.
- PUT /api/v1/publish/:slug/primary-domain - make a connected domain mount the Site's primary domain - its here.now addresses then 308-redirect ({"domain": "example.com"}; {"domain": null} turns it off).
- GET /api/v1/mounts - list mounts on the personal subdomain handle, or on a custom domain with ?domain=<hostname>.
- POST /api/v1/mounts - mount a Site at a path on the subdomain handle or a custom domain: {mount_path, slug, domain?}; empty mount_path targets the root. (The older /api/v1/links endpoints are a deprecated alias.)
- GET/PATCH/DELETE /api/v1/mounts/:mount_path - read, re-point ({slug}), or remove one mount. Use __root__ for the root mount and ?domain= (or body domain on PATCH) for a custom domain.
- GET /api/v1/handle - get the personal subdomain handle and its mounts.
- DELETE /api/v1/handle - delete the subdomain handle and its mounts (new handle registration is discontinued).
- GET /api/v1/me/variables - list account variables for proxy routes (names and upstream pinning only; values are never returned).
- PUT /api/v1/me/variables/:name - create or update an account variable ({value, allowedUpstreams?}) injected server-side into proxy-route calls declared in a Site's .herenow/proxy.json manifest (see /docs#proxy-routes).
- DELETE /api/v1/me/variables/:name - delete an account variable.
- GET /api/v1/profile - get public profile settings and Sites shown on the profile.
- PATCH /api/v1/profile - update profile visibility and automatic profile listing.
- PATCH /api/v1/profile/username - change the profile username.
- GET /api/v1/profile/sites - list Sites shown on the profile.
- POST /api/v1/profile/sites - add an owned ungated Site to the profile.
- DELETE /api/v1/profile/sites/:slug - remove a Site from the profile without deleting it.
- POST /api/v1/drives - create a Drive.
- GET /api/v1/drives - list Drives.
- GET /api/v1/drives/default - get or create the default Drive.
- GET /api/v1/drives/:driveId - get Drive details.
- PATCH /api/v1/drives/:driveId - patch Drive metadata (name, description, isDefault).
- DELETE /api/v1/drives/:driveId - delete a Drive.
- GET /api/v1/drives/:driveId/files - list Drive files.
- GET /api/v1/drives/:driveId/files/:path - read a Drive file (HEAD for its headers only).
- POST /api/v1/drives/:driveId/files/uploads - stage a Drive file write.
- POST /api/v1/drives/:driveId/files/finalize - finalize a staged Drive upload.
- DELETE /api/v1/drives/:driveId/files/:path - delete a Drive file or prefix.
- POST /api/v1/drives/:driveId/files/move - move or rename a Drive file.
- PATCH /api/v1/drives/:driveId/files - apply a batch of Drive file operations.
- GET /api/v1/drives/:driveId/tokens - list a Drive's share tokens.
- POST /api/v1/drives/:driveId/tokens - create scoped Drive share tokens.
- DELETE /api/v1/drives/:driveId/tokens/:tokenId - revoke a Drive share token.
- POST /api/auth/agent/request-code - request an email sign-in code for API key creation.
- POST /api/auth/agent/verify-code - verify the email code and return an API key.
- GET /api/v1/me/keys - list API keys, including full key values.
- POST /api/v1/me/keys - create a named API key (name it after the agent or tool, e.g. claude, cursor).
- DELETE /api/v1/me/keys/:id - revoke one API key without affecting others.
- GET /api/v1/accounts - list the caller's personal account and joined workspaces (the valid X-HereNow-Account selectors). Add includeJoinable=1 to also list workspaces the caller could join via email-domain auto-join.
- POST /api/v1/accounts - create a workspace in one call (account, subdomain claim, and serving provisioning).
- GET /api/v1/accounts/subdomain-availability - check whether a workspace subdomain is available with ?subdomain=<name>.
- POST /api/v1/accounts/:accountId/provisioning - retry workspace serving provisioning after a workspace_not_ready error.
- GET/POST /api/v1/accounts/:accountId/invites - list or send workspace email invites.
- DELETE /api/v1/accounts/:accountId/invites/:inviteId - revoke a pending workspace invite.
- GET /api/v1/me/invites - list the caller's own pending workspace invites (each carries its accept/decline endpoints).
- POST /api/v1/accounts/:accountId/invites/:inviteId/accept - accept a workspace invite.
- POST /api/v1/accounts/:accountId/invites/:inviteId/decline - decline a workspace invite.
- GET /api/v1/accounts/:accountId/members - list workspace members (admin-only).
- POST /api/v1/accounts/:accountId/members - add an existing here.now user to the workspace by email without an invite (admin-only; prefer invites for people who may not have an account).
- PATCH/DELETE /api/v1/accounts/:accountId/members/:userId - change a member's role, remove a member, or leave.
- GET/POST /api/v1/accounts/:accountId/domain-rules - list or create email-domain auto-join rules for a workspace.
- DELETE /api/v1/accounts/:accountId/domain-rules/:ruleId - disable an auto-join domain rule.
- POST /api/v1/accounts/:accountId/domain-rules/apply - join a workspace when an active rule matches the caller's email domain.
- GET /api/v1/accounts/:accountId/site-labels - list workspace Site labels (admin-only).
- POST /api/v1/accounts/:accountId/site-labels - assign a label to a workspace-owned Site so it serves at {label}.{workspace}.here.now (admin-only).
- PATCH /api/v1/accounts/:accountId/site-labels/:label - rename a workspace Site's label URL (the old label 307-redirects).
- PATCH /api/v1/accounts/:accountId - rename a workspace display name (admin-only).
- DELETE /api/v1/accounts/:accountId - permanently delete a workspace (admin-only).
- POST /api/v1/support - send an authenticated support request to the here.now team ({subject, message}).

## Install
- npx skills add heredotnow/skill --skill here-now -g
- curl -fsSL https://here.now/install.sh | bash
- hermes skills install well-known:https://here.now/.well-known/skills/here.now
- stripe projects add herenow/hosting

## Reference
- [Docs](https://here.now/docs) - canonical product documentation and API reference.
- [OpenAPI](https://here.now/openapi.json) - OpenAPI 3.1 specification for the stable public API.
- [Pricing](https://here.now/pricing.md) - machine-readable pricing tiers and plan limits.
- [Hosted skill](https://here.now/skill.md) - hosted here.now skill for agents.
- [Skill version](https://here.now/api/skill/version) - current skill/install metadata.
- [Hermes well-known skills](https://here.now/.well-known/skills/index.json) - Hermes well-known skill index.
- [Public skill repo](https://github.com/heredotnow/skill) - public GitHub skill and plugin repository.
- [Public repo AGENTS.md](https://github.com/heredotnow/skill/blob/main/AGENTS.md) - coding-agent instructions for the public skill repo.
- [llms.txt](https://here.now/llms.txt) - concise agent context.
- [llms-full.txt](https://here.now/llms-full.txt) - expanded agent context.
- [docs llms.txt](https://here.now/docs/llms.txt) - docs-scoped agent context.
- [API llms.txt](https://here.now/api/llms.txt) - API-scoped agent context.
- [index.md](https://here.now/index.md) - markdown homepage fallback.
- [docs.md](https://here.now/docs.md) - markdown docs fallback (the agent knowledge pack; /docs serves the same to CLI/markdown requests).
- [agent mode](https://here.now/?mode=agent) - structured agent homepage view.
- [agent.json](https://here.now/.well-known/agent.json) - agent discovery manifest.
- [agent.json alias](https://here.now/agent.json) - root alias for agent discovery.
- [well-known agent alias](https://here.now/.well-known/agent) - extensionless well-known alias for agent discovery.
- [agent-card.json](https://here.now/.well-known/agent-card.json) - agent card describing here.now capabilities.
- [ai-plugin.json](https://here.now/.well-known/ai-plugin.json) - OpenAI-style plugin manifest pointing to OpenAPI.
- [API catalog](https://here.now/.well-known/api-catalog) - RFC 9727 API catalog/linkset.
- [schema map](https://here.now/schema-map.xml) - schema map advertised from robots.txt.
- [agent resources schema feed](https://here.now/schema-feeds/agent-resources.jsonl) - JSONL structured-data feed for agent resources.
