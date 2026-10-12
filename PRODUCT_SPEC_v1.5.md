# Private Circle — Final Product & Technical Specification (v1.5)

**Date:** October 12, 2026  
**Status:** Final agreed product requirements and architecture decisions for development; **not a built, security-audited, or production-proven application**. Technical feasibility gates and launch blockers are called out explicitly.  
**Platforms:** iPhone and Android, installable from the web as a Progressive Web App (PWA), without an app store.  
**Business model:** Free to use. No paid accounts, advertisements, public popularity rankings, or behavioral tracking.  
**Version 1.5 final-review changes:** Official name **Private Circle** (singular). Define opt-in notifications and device-conditional background sync without claiming persistent background operation; clarify required infrastructure for delivery and push. Add stronger safeguards for secure invitations, distributed membership conflicts, identity recovery, host compromise, storage eviction, device revocation, and offline media availability. Add critical go/no-go acceptance tests. Preserve all previous product choices: no public users/followers or post sharing; 4 compressed photos, 300-character written text, 3 links; comments; encrypted DMs and private chats; five bottom buttons; free, Android/iPhone, app-store-free PWA.

## Project identity and scope

- **Official app name:** **Private Circle** (singular). Use this exact display name in the PWA manifest, installation prompt, Home header, invitation email, app icon text, support/about screens, and release artifacts. The word **Circles** remains the name of the bottom navigation tab and of the communities themselves.
- **A circle is not a public follower group:** Each circle is invitation-only and managed by its own authorized members. There are no public post URLs, public member discovery, follower relationships, repost features, or automatic cross-circle distribution.
- **No central social database does not mean no internet infrastructure:** Peer discovery, connection negotiation, encrypted delayed delivery, and optional push require independently operated services or connected online peers. The app must remain usable when any one relay operator disappears, but **delivery latency cannot be guaranteed**.
- **Permission caution:** Neither Android nor iOS grants an ordinary PWA an unconditional right to keep running or relaying peer-to-peer data in the background. Members may opt into supported notifications/background tasks, but app design must not rely on continuous off-screen execution.

## 1. Product principles and non-negotiable requirements

1. **Circles only.** There is no public feed, global audience, following system, public user directory, or public member profile. Every post belongs to exactly one invitation-only circle.
2. **Multiple memberships.** A member may create and belong to as many circles as their device and the network can practically support. Each circle operates independently.
3. **No cross-circle sharing.** The app must have no repost, quote-post, forward-post, or cross-circle share feature. A user can make a new, original post in another circle, but the app must not copy a post or its attachments across circles. It cannot prevent external screenshots or manual redistribution by a recipient.
4. **No central social server or user database.** Social content and membership state are stored on participants' devices. Independently operated encrypted transport relays are allowed; no single operator may be essential to network operation.
5. **No app-store dependency.** The PWA is delivered using HTTPS and can be added to the home screen on supported iPhones and Android devices. The initial installation files can be hosted by a static site; the social network itself is separate from that hosting.
6. **No required biometrics.** Face ID and fingerprint recognition must not be an onboarding, authentication, or recovery requirement.
7. **No centralized username/password login.** Each user has a cryptographic identity generated on their own device; display names are cosmetic and need not be globally unique.
8. **Email and/or phone recovery contacts.** A member may register either or both. These are recovery channels, never by themselves substitutes for possession of cryptographic recovery information or trusted-person approval.
9. **Private communications.** Circle posts, comments, and media are encrypted for authorized members. Direct messages and private group chats use separately scoped end-to-end encryption.
10. **Free and transparent.** Publish specifications and ideally application source code openly. Free use does not mean networking and volunteer relay infrastructure have zero operating cost.
11. **Readable microblogging.** Each post allows **up to four images, a maximum 300-character text body, and up to three external links**. Render these sections in the fixed order **images → text → links**, omitting empty sections. Links must be displayed separately and visually shortened without changing their destination.
12. **Easy to navigate and consume.** Use exactly **five** persistent bottom controls: **Home, Circles, + (Create Post), Messages, Settings**. Prioritize a polished, uncluttered, mobile-first interface over feature density, while retaining accessible controls and clear offline/sync status.
13. **Easy invitations.** Settings prominently offers **Invite a Member** with a circle picker and convenient email sharing. Only members with the appropriate circle invitation permission may issue a usable invite.
14. **Images optimized before distribution.** ALL uploaded photographs are resized/compressed locally on the device to a good mobile display quality before encryption/sync; recipients download that optimized, metadata-sanitized image instead of an untouched full-resolution camera original. Use lightweight feed thumbnails, sensible caps, and transparent download quality.
15. **Background operation is optional and limited.** A clearly labeled Settings section may ask permission for notifications or supported background sync; it must never suggest that an iPhone/Android PWA can become an always-running peer relay after the user grants a permission.
16. **Offline delivery is best-effort until proven.** Encryption and independent relays protect message contents, but no availability, push, or delivery guarantees shall be claimed without measured cross-platform testing.

## 2. Product experience

### 2.1 Navigation — exact bottom bar

**Exactly five controls, fixed to the bottom of the main application views with iOS/Android safe-area spacing and short readable labels. Order left to right: Home / Circles / + / Messages / Settings.**

1. **Home** (`house`): Reverse-chronological feed combining authorized posts from **all circles** the person has joined; display the source circle on each post. No public, suggested, or engagement-ranked posts.
2. **Circles** (`users`): Scrollable list of joined circles; tapping one opens **only that circle's** feed. Create/Join affordances remain on the Circles screen.
3. **+ Post** (`plus`, center and most visually prominent): Compose a text/image/link post for **exactly one selected circle**. Preserve drafts; visibly confirm the destination circle. This is an action rather than a separate scrolling feed.
4. **Messages** (`message-circle`): Persistent entry to the personal inbox for one-to-one DMs and private group chats, with an unobtrusive unread badge; tapping opens the conversation list. No need to search the Home header for chats.
5. **Settings** (`gear`): Invite a Member, View/Edit Profile, Light/Dark switch, recovery/security, notifications, storage, and help grouped clearly.

Notifications/activity can use a compact header bell when needed, but must not create a sixth bottom tab. Tapping a person's member profile also offers **Message**. The bottom bar remains accessible on the principal feeds and inbox; it may be hidden for an individual chat while the keyboard is open, with an obvious back path. Keep active state, accessible labels, minimum practical touch targets, preserved tab scroll positions, and no overlap with iPhone home indicator.

**Bottom-bar behavior:** visible on Home, Circles, and Settings and ordinary circle-feed screens; hidden or compacted only where necessary for immersive image viewing, full-screen compose, or the on-screen keyboard. Never let it overlap text, comments, CTA buttons, or the iOS home indicator. Always show an active state and preserve each tab's scroll position.

### 2.2 Posts, links, and media

- **Hard limit: 300 characters for the written body of each original post.** Count user-perceived Unicode characters (grapheme clusters), including spaces, punctuation, emoji, and line breaks. Apply the same canonical counting rules on all devices and at event validation; avoid mismatched JavaScript string-length counts. The text area shows a live `0/300` counter, becomes visually urgent near the limit, and prevents submission beyond the limit without silently truncating text.
- **Hard limit: four images per post.** A post may attach 0, 1, 2, 3, or 4 photographs—not five. Images count independently of the 300-character body and three-link allowance; image-only posts are valid. Show `Images: N/4` in the composer and a friendly, non-destructive error when someone tries to add a fifth. Receiver-side event validation must reject unauthorized over-limit payloads, including edited posts.
- **Mandatory rendering order:** After the compact author/circle header, render **all attached images first**, then the body text if present, then any external links as separate `Link 1`–`Link 3` rows/cards, and finally comment/reaction actions. No text, links, link previews, or ads may appear between the photo gallery items. The compose-preview order must match the feed and detail views.
- **Photo layout:** One image uses a landscape/portrait-aware card; two form a balanced pair; three use one larger image plus two smaller tiles; **four display as a simple 2×2 grid**. Thumbnail cropping is permitted only as a reversible display treatment: tapping opens the complete uncropped photo with zoom and its own clearly labeled **Download image** action. Downloads provide the **optimized, privacy-sanitized, mobile-quality uploaded image**; the app does not promise untouched camera originals or full sensor resolution. Each of the four images can be downloaded independently.
- **Photo behavior:** Reorder/delete images before publishing; show position (`1 of 4` when four images are present) in the viewer; never autoplay, preload the larger downloadable version while scrolling, or introduce unsolicited third-party image requests. Generate thumbnails from the already optimized image, remove GPS/EXIF metadata, and show transfer/storage status if that download version is not yet available.
- **Hard limit: three external links per post.** Supports ordinary `https://` website links, YouTube videos, and other conventional web URLs. Links are structured post attachments stored as their **full, unchanged destination URLs**; their length does not consume the 300-character written-body allowance. A post can contain text, photos, links, or any supported combination, including a link-only post.
- **Automatic link extraction:** Pasting a URL into the composer detects it, places it in a separate link-attachment field, and removes the raw URL from the displayed text body after a clear, undoable confirmation or equivalent transparent UI. Offer `Add link`, `Remove`, and `Reorder` controls. Do not silently extract arbitrary plain text that only looks like a URL; preserve surrounding prose and spaces. The interface clearly counts existing links and shows an actionable error on a fourth; never silently discard the fourth link.
- **Presentation:** Links appear **below all photos and then the written text**, in a dedicated, visually separated list or compact cards, labeled exactly `Link 1`, `Link 2`, `Link 3` in order, showing the recognizable destination domain (such as `youtube.com`) in small secondary text and a simple external-link affordance. Do **not** display long raw URLs in the feed, use an external URL-shortening service, or rewrite a URL merely to shorten its appearance. Only show labels for present links; one link means just `Link 1`.
- **Opening links:** Tapping a link opens its exact validated destination in the browser with safe external-navigation/referrer protections. Provide a way to inspect and copy the complete destination; reveal potentially misleading redirects or deceptive hostnames rather than hiding them behind a generic label. `http://` links should be clearly indicated as nonsecure, or rejected at composition, rather than silently upgraded with broken results. Never execute pasted URL strings as app code.
- **Third-party privacy:** Never load remote YouTube embeds, external site scripts, trackers, or thumbnails automatically while a member scrolls the private feed. An optional user-initiated preview can be explored later if it does not reveal circle membership or viewing behavior through unconsented requests. Domain-only cards must work without a metadata-fetching server or external API.
- **Cross-circle boundary:** Sharing a link to an *external* website in one circle is permitted. The app provides no internal link or action that redistributes posts, photos, comments, or chat content from one circle into another. Do not generate globally accessible permalinks for private posts.
- **Peer validation:** The receiving app independently validates the 300-character body limit, maximum four images, fixed section order in any rendered view, and maximum three external links. Validate schemes, URL length/resource limits, normalized Unicode text, duplicates, and malformed link events across all devices. Do not rely on composer UI enforcement alone.
- Text posts and photographs; comments on text or image posts; replies to comments; limited emoji reactions. The 300-character limit is for **post bodies**, not automatically for comments, private chats, profile bios, circle descriptions, or invitation emails; any separate limits require explicit product decisions.
- Edit one's own content, show an edit marker, and issue signed deletion/tombstone events. Others' already downloaded copies may persist.
- Full-screen image viewer with pinch-to-zoom where supported; allow downloading the **optimized, sanitized** uploaded image, not the untouched camera original.
- Remove EXIF/GPS and other optional identifying metadata before publishing, with clear disclosure; optionally generate low-bandwidth preview variants.
- Download-on-demand for optimized photos (higher quality than thumbnails); show storage usage and provide a clear-cache control.
- No user-facing repost, forward, cross-circle share, or quote-post feature. No global hashtags or public discovery.
- New members see only content permitted by the circle's history policy; default: **posts published after admission**, with explicitly authorized history transfer as an option.

### 2.3 Post composer and reading flow

- **Compose:** Present fields in the same order members will see: **(1) Images N/4** with preview, add/reorder/remove controls; **(2) Text N/300** with a large readable text area; **(3) Links N/3** with numbered entries and Add/Remove controls. Keep the selected-circle chip labeled `Posting to` above those fields and one obvious **Post** action at the end. Avoid dense toolbars. Require selection/confirmation of exactly one circle; never default to a prior circle if it risks accidental disclosure.
- **Feed card hierarchy:** Clear author and origin-circle label at the top; **up to four photos first**, in a calm gallery; **comfortable body text second**; **separate numbered links last**; then a quiet footer for comments and reactions. Suppress empty image/text/link sections. No counts-as-competition or engagement-ranking elements.
- **Discussion:** Tap post or comments to open a full conversation with threaded replies, obvious back navigation, reply target context, and preserved scroll position when returning to the feed.
- **Readability and load:** Chronological feed, sensible text widths, legible font sizing, uncluttered separators, image placeholders that avoid layout jumps, predictable scrolling, lazy-loaded thumbnails, and an easy-to-find download action on each image without hunting through menus. No unnecessary photo carousels when all 1–4 thumbnails can fit visibly.
- **Feedback:** Explain offline queued posts and synchronization delays with calm status labels; never show a checkmark that implies delivery to all members unless that state has actually been established.

### 2.4 Direct messages and private chats — first-class navigation

**Discover and begin conversations**

- Access **Messages directly from the bottom navigation** with a quiet unread badge. The Messages screen offers **New Message**, a local search box, a list of recent conversations, previews, last-message times, mute indicators, and clear empty states.
- In any circle's **Members** list, select a member → their circle-scoped profile → **Message**. A user can initiate a private chat only with someone who **currently shares at least one circle**, subject to recipient blocking/message-request preferences. No global public member lookup or contact-number exposure.
- If a recipient restricts first contacts, show an explicit **Message Request** that can be accepted, declined, or blocked. Do not expose an unsolicited message preview beyond what the recipient has permitted. A recipient may disable requests, except from previously accepted contacts.
- Every conversation clearly shows whom the user is messaging; if multiple circles are shared, make the originating circle context visible and do not silently expose cross-circle profile mappings.

**One-to-one chats**

- Familiar message bubbles, timestamps, text composer, optional locally compressed photo attachments, and lightweight emoji reactions or replies. No unrequested typing indicators, public online status, or read receipts by default; optionally revisit after privacy review.
- Use independently scoped **end-to-end message encryption** between participant devices, with authenticated keys and forward-secret ratcheting from an audited protocol/library. Neither other circle members, circle administrators, nor opaque relay operators should possess conversation decryption keys.
- Encrypt and sign messages **before** peer-to-peer delivery or temporary relay storage; authenticate recipients, deduplicate arrivals, and guard against replay and out-of-order delivery. Relay delivery is not equivalent to recipient receipt.

**Private group chats**

- **New Group Chat** asks the creator to select two or more other authorized members of **one chosen circle**, then creates a separately encrypted group conversation visible only to selected participants. This is distinct from posting to the circle feed.
- Group participants may be added or removed under defined chat rules, with rekeying to protect future messages. Do not assume removing a participant can erase previously received chat history.
- People who belong to several circles may have separate group chats in each; do not expose group content or per-circle identities across circle boundaries by default.

**Boundaries and delivery**

- A member can **mute**, **block**, or **delete a local copy** of a conversation. Group chats show participants and a leave control. No forward/repost/share action for posts, photos, or chat messages across circles; members can still manually copy or photograph content outside the app.
- Chats are **separate from circle posts** and encrypted separately. A circle admin has moderation powers over circle content/membership, **not access to private chats** unless personally a participant.
- Show delivery states such as **Queued on this phone**, **Stored with an encrypted relay**, and **Delivered to recipient** only when actually confirmed. Mobile PWAs may be suspended while closed; recipients may not get messages or alerts instantly. Optional push notifications require infrastructure and should not reveal plaintext message content.
- If two people cease to share any circle, disable **sending new messages** by default; previously received history may remain locally. Preserve the user's explicit block setting. No ordinary app action forwards a circle post to DM.
- Optimize chat photos under the same mobile-image policy as circle posts. Do not automatically transmit original camera files. Other file types are deferred pending security review.

### 2.5 Circle administration

- Anyone may create a circle; creator is initial administrator.
- Roles: administrator, co-administrator, moderator, member.
- Admins set membership policy, invite expiry and usage limits, join approval, and whether members may invite others.
- Protect admins from being lost: co-admins and a clearly defined administrator succession/recovery rule.
- Content moderation includes signed hide/remove directives for a circle's shared view, blocking, and removal of accounts. Copies already obtained by another member may remain.
- Member removal prevents authorization for **future** content. Rotate/rekey encryption membership promptly; pre-removal content cannot be clawed back.
- Conflicting membership decisions made while offline require a consistent, auditable protocol; do not rely on phone wall-clock timestamps to settle security-critical conflicts.


### 2.6 Additional essential product and usability decisions (v1.3)

- **Circle context without clutter:** Each circle has a concise header with its name, description/rules, members, admins, optional mute control, and authorized `Invite` action. Members can easily **Leave Circle**; creators are prompted to transfer administration first. A member list is visible only to that circle's members, not a global directory.
- **Composer safety and offline drafts:** A prominent `Posting to: [Circle name]` indicator and deliberate circle selection prevent accidental posting to the wrong group. Autosave unfinished text, photo choices, and links locally, warn before discarding, and distinguish **Draft**, **Queued on this phone**, **Available on network**, and **Delivered to member(s)** when independently verifiable. Never display universal-delivery claims on partial evidence.
- **Find what matters:** Search only across posts, authors, and conversations that the member can actually decrypt locally; allow per-circle filters and a non-public **Saved posts** list. Saving is a local bookmark, **not** a forwarding, public sharing, or copying action. Saved items from a circle become unavailable once cryptographic authorization is lost unless already downloaded.
- **Reading comfort:** Show new-post markers and a `Jump to latest` action without jumping the scroll position unexpectedly. Keep controls at least 44 × 44 CSS pixels where practical; support system text scaling, high contrast, reduced motion, accessible image descriptions/alt text, and announced upload/progress/error states. Do not show unnecessary advertisements, follower counts, or ranking metrics.
- **Photo reliability:** Four-photo maximum enforced in compose, after edit, and by the receiving peer. Show thumbnail placeholders and upload/progress states; retry/resume on poor connections. Compress each photo **locally before encryption/sync**, transmit only the optimized sanitized version, and create compact previews. Use adaptive compression rather than promising a uniform file size across all photos. `Download` explicitly saves the optimized image. Offer per-circle cellular/Wi-Fi media download controls and storage cleanup.
- **Comments and safety:** Comments and nested replies are restricted to current authorized members of the same circle. Provide edit/delete for own comments, mute conversations, and user blocking. Display moderation/removal notices without pretending recipients' copies can be erased. Comments remain logically attached to their original circle and parent post.
- **No accidental inter-circle identity leakage:** Per-circle display names alone do not prevent correlation if one global public key is published everywhere. Design cryptographically verifiable **per-circle pseudonymous identifiers** linked locally to the member's root identity, and keep cross-circle identity mappings private except where the member expressly authorizes disclosure; test private chats across shared-circle changes.
- **Invitations and membership conflicts:** Tell people when a join request is **pending** because no authorized member/admin is reachable. Define signed admin role delegation, quorum/ordering for conflicting offline member removals or one-use invitations, and rekeying before sending new content after removals. No invitation is advertised as immediately redeemed until its membership addition is committed.
- **Plain-language first use:** Simple welcome → choose display name → create secure identity → protect and test backup → install PWA → enter/join via invitation. Never require access to contacts, SMS, biometrics, or a password service. Show a brief explanation of delayed offline delivery and how to restore access after replacing a phone.
- **Security on link opening:** External-link rows visibly show the real destination domain; reject unsafe protocols, minimize referrer leakage, and avoid loading third-party preview resources until deliberately requested. **Allow links to outside websites, but never create internal post-forwarding or cross-circle share actions.**

### 2.7 Nonnegotiable acceptance boundaries for v1.5

1. **Install/distribution independence:** The HTTPS static app host serves installation/update assets only. It is not a member directory, message store, invitation authority, or push transport. Failure or takeover of the original host still presents a serious update/origin-availability risk; document emergency migration before launch.
2. **Availability requires infrastructure:** Phones alone cannot promise background relaying when iPhone/Android suspends a PWA. To support asynchronous delivery, deploy or recruit multiple independently administered discovery/signaling and encrypted store-and-forward relays with clear storage limits, health monitoring, and no single mandatory provider. **GitHub Pages cannot substitute for these services.**
3. **Recovery has a cryptographic requirement:** Email/SMS verification confirms control of a delivery channel, **not** possession of account secrets. Recover an existing identity with an encrypted backup plus recovery secret, an already-authorized second device, or audited threshold-guardian recovery. Phone/email alone must never seize an identity; SMS/email delivery and verification may themselves depend on external infrastructure.
4. **Data is distributed, not erasable everywhere:** Users can delete or hide their local copy, and authorized mods can distribute signed moderation notices, but content or media already copied/downloaded by a peer cannot reliably be recalled. Every circle explains this before posting.
5. **No false promises on free operation:** App use remains free. At-scale bandwidth, encrypted media storage, signaling, TURN, and optional push still have real costs; volunteer and donated infrastructure is a plan to evaluate, not a claim of guaranteed zero-cost delivery.
6. **Privacy-focused defaults:** No third-party link previews, automatic contact uploads, real-time presence broadcasting, central analytics, or undisclosed relay logs. Relay operators may nevertheless observe some IP and timing metadata. Publish a concise, readable threat model and the app's operational limitations.

### 2.8 Settings — Background Activity & Notifications (final decision)

This setting is optional, simple, and **capability-detected**. It is not a universal "Allow app to run forever" switch.

- **Notifications** (default Off until the user opts in): explain the purpose, request system push permission only after a direct user tap, and use notification badges where supported. iPhone Web Push requires the PWA to be installed as a Home Screen web app (supported since iOS 16.4); an ordinary Safari tab is not equivalent. The member can independently mute circles and message conversations.
- **Background sync** (default Best available / automatic with transparent status): attempt brief browser-managed retry/synchronization only where the relevant API exists. Chrome/Android may provide Background Sync or Periodic Background Sync subject to browser scheduling and engagement. Safari/iPhone does not provide Chromium-style Periodic Background Sync. Never claim it is running when unsupported.
- **When Private Circle is open:** maintain permitted WebRTC sessions and synchronize posts, chats, keys, photos, and membership state while the app remains active and connectivity exists.
- **When Private Circle is closed/suspended:** do **not** promise WebRTC relay availability, full-background post propagation, or silent wakeups. A short-lived service-worker event or push notification is not an uninterrupted network connection.
- **No silent push workaround:** iOS Web Push must be user-visible; push is only a signal to inform a user about an event, not a legal or technical substitute for a continuously running peer. A push gateway/trigger is needed; a static GitHub Pages site **alone cannot send push notifications**.
- **Battery and data:** expose `Wi-Fi only for photos`, `Auto-download photos`, `Notifications`, `Background activity availability`, and `Manual sync` in a concise grouped page. Do not ask for notification permission repeatedly after decline.
- **Offline UX:** show `Saved on device`, `Waiting for connection`, `Stored with relay`, and `Received by recipient` only on verifiable acknowledgements. Never falsely imply that all members saw a post.

## 3. Invitations and onboarding

### 3.1 Email invitation design

Invitation email contains the circle's name, the inviter's chosen display name, a short explanation, a securely generated invitation token or QR code, and two distinct links/buttons:

1. **Get the App & Join the Circle** — installation instructions adapted to Android/iPhone, keeping the invite token available after installation.
2. **Already Have the App? Join the Circle** — attempt to open the installed PWA via the invite URL; provide copy/paste or QR scan fallback where deep linking is unreliable.

The displayed invite code is a high-entropy capability, not an easily guessed short 8-character code. The link may carry a sufficiently random token and a human-readable shortened presentation only when its security is not weakened.

**Email-platform constraint:** An ordinary `mailto:` draft reliably prepopulates plain subject and text but does not guarantee formatted HTML buttons across email applications. Therefore include the **two clearly labeled HTTPS invitation links** in the email text, and render **two full-size buttons** on the hosted installation/join landing page. If we later offer rich HTML email, it must be sent using a separately configured sending service or the user’s email provider—not claimed as a `mailto:` capability.

### 3.2 Join protocol

- Invite is issued and signed by an authorized circle inviter and includes circle identity, inviter identity, invitation ID, issuance/expiry rules, optional use count, and a rendezvous path.
- Recipient first creates a local cryptographic identity (unless one already exists), then presents a signed join request.
- An online, authorized member or independent relay helps deliver the request to circle administrators. Offline administrators may delay enrollment.
- Authorized members validate current invitation state and approvals and add the new identity to the current encryption epoch.
- Expiry/one-use enforcement needs distributed coordination and replay detection; do not imply a static invite code alone guarantees global single use without synchronization.
- Invitation links must not expose circle content. A user who possesses an unused invite is not yet a member until the membership protocol completes.

### 3.3 Quick Invite from Settings

- The top portion of **Settings** shows a prominent, plain-language **Invite a Member** row/button; the feature should not be buried beneath identity, advanced privacy, or developer menus.
- Tap → **Choose a circle** from the user's joined circles (with concise member count and invite-permission status). If launched inside a specific circle, preselect that circle but still show the destination prominently.
- If authorized, choose **Invite by Email** (device's installed email client using a prefilled *plain-text* email draft with two clearly labeled secure links, e.g., `mailto:`) or **Share Invite** (native browser/device share sheet when available), plus **Copy Invitation** and **Copy Code** fallbacks. Do not require building an email-sending server or collecting the address in a company account database. Never falsely report that email was sent when only a compose window was opened.
- Include the existing two invitation calls to action: **Get the App & Join the Circle** and **Already Have the App? Join the Circle**. Both preserve the correct circle's signed invite and respect one-time/expiring invite policies.
- If the member lacks invitation permission, disable invite creation for that circle and explain who can grant it. Do not present an invalid invite as usable. Show expiration and redemption limit before sending; let an inviter revoke outstanding codes where authorized.
- Never post the invitation as a circle feed item; a circle invitation is separate from regular posts and DMs. The invitation payload should not embed private history or encryption keys that grant access before the authorized join protocol.

## 4. Identity, unlocking, and account recovery

### 4.1 Identity model

- Create a high-entropy cryptographic root identity locally and create separate device keys for cryptographic operations and transport sessions.
- Present a member-selected display name inside circles. Offer circle-specific aliases/pseudonyms to reduce cross-circle correlation.
- Other members verify signatures and membership credentials; no central account directory or shared username/password verifier is required.
- Protect ordinary on-device secrets through available browser APIs and encrypted local vault mechanisms. A PWA must not claim the same hardware security capabilities as a native app merely because it uses Web Crypto.
- Local unlock should be convenient and work without biometrics. Offer an **optional local app passcode/passphrase** with a clear warning that short PINs are weaker if an attacker has copied encrypted storage. Requiring the device's normal screen lock can help against casual access, but is not cryptographic proof to peers.
- An identity key is not a display name, phone number, or email address.

### 4.2 Recovery contacts and channels

- Offer **email**, **mobile number**, or **both** as optional recovery contacts. A user may choose not to register either if they accept self-custody recovery limitations.
- Keep recovery contacts private, not published to circles or uploaded as a global user directory.
- Register or change contacts through a confirmation workflow supported by independently operated verification infrastructure or direct trusted-contact confirmation. Do not claim the PWA can independently send trustworthy password-reset SMS with zero service infrastructure.
- A confirmation link or SMS code verifies access to that delivery channel, not possession of the original private encryption keys.
- Consider rate limiting, enumeration resistance, expiry, replay resistance, and SIM-swap risk wherever a verification service participates.

### 4.3 Two supported recovery paths

**Path A: Backup + recovery secret (first-release baseline).**

1. During onboarding, create an authenticated, encrypted identity-and-membership backup using a strong recovery secret, and have the user save that secret safely.
2. Let the user send themselves the **encrypted** backup file as an email attachment or save it to a location of their choice. The backup is unreadable without the recovery secret.
3. On a replacement phone, install the PWA, import the backup (from email, file, or a linked device), supply the recovery secret, authorize a new device, and resynchronize available posts and membership state.
4. Email or phone may be used to deliver instructions and verify the destination; **neither alone decrypts the backup**.

**Path B: Trusted-contact recovery (advanced; only after thorough security review).**

1. User designates multiple trusted recovery guardians in advance.
2. A threshold scheme such as **two out of three** independent recovery shares helps reconstruct protected recovery material; no guardian alone can recover the account.
3. A user who loses their phone begins a request via confirmed email/phone and contacts the guardians, who authenticate the user out of band and approve releasing their shares through a secure protocol.
4. A new device restores the same identity only if sufficient authorized cryptographic recovery material is available. If not, guardians can help the person join with a **new** identity, which does not automatically decrypt historical content.
5. Specify guardian replacement, account/device revocation, fake recovery protection, and delayed notification to surviving devices.

**Honest security guarantee:** An email address or phone number **alone** cannot recreate a destroyed private key. Any design promising that would require a custodial copy, an independently secured backup, or social recovery. The first release will not depend on biometrics.

### 4.4 Multi-device support

- Each device gets its own authorized keys and local database; an existing device or recovery procedure approves additional devices.
- Revoking a lost device should rotate affected encryption epochs and make future events inaccessible to it, insofar as cryptographic delivery and membership update propagation permit.
- Offer explicit encrypted backup export, periodic backup reminders, and a restore test before declaring setup complete.

### 4.5 Security-first onboarding/recovery experience

- First run: locally generate identity keys, choose a display name, opt into a local unlock passphrase if desired, explain that **no central password reset exists**, and produce an encrypted recovery backup.
- **Recovery from email or SMS cannot be equivalent to “reset password.”** Email may carry the encrypted backup file or instructions, and a verified phone number may help a member coordinate with trusted recovery people, but neither alone can decrypt a previously encrypted identity.
- Verify backups by asking the member to complete a non-destructive restore check before marking recovery complete. Show clear `Backup current / Verify backup / Replace lost device` actions.
- New-device registration, device compromise, admin permissions, and invitation redemption require authenticated cryptographic operations; changes made by a lost device are not accepted after applicable revocation epochs have propagated.

## 5. Cryptography and local persistence

- Use audited, actively maintained cryptographic implementations; do not invent custom primitives. Evaluate Messaging Layer Security (MLS; RFC 9420) for circle/group encryption and its group membership evolution.
- Use strong cryptographic signatures for event authorship; include circle-specific authorization and current group epoch in validation.
- Keep a per-circle cryptographic domain, and independent encryption contexts for one-to-one/group chats.
- Encrypt locally sensitive cached material and protect recovery packages. Use IndexedDB / browser storage for local state while recognizing browser eviction and user deletion risks.
- Apply strict transport-layer HTTPS for PWA distribution and relay communications. Ship restrictive CSP, dependency pinning, integrity and release controls, and security update procedures.
- **Threat caveat:** If an attacker controls the application host and can replace the JavaScript delivered to users, end-to-end privacy may fail. A static web host is not cryptographically irrelevant. Code-signing and secure distribution need explicit review.

## 6. Distributed sync and networking

### 6.1 Architecture

- Browser-based PWA clients keep local, encrypted event logs and media chunks.
- WebRTC data channels support direct connected peers. They need a signaling/rendezvous channel; NAT/firewall situations may also require TURN relays.
- Use **several independently operated** relay/rendezvous nodes, not one mandatory centrally controlled server. Relays hold short-lived opaque, encrypted envelopes; they do not possess circle decryption keys.
- Devices may relay and synchronize only content and metadata allowed by protocol policy; membership-gated peers verify integrity and reject replays.
- Relay nodes may observe IP addresses, connection patterns, or timing: encryption of content does not erase network metadata.
- An unrelayed, strictly phone-only mode can be offered as an experimental feature, but cannot guarantee delivery when apps are suspended or every participant is offline.

### 6.2 Events and convergence

- Signed events with globally collision-resistant IDs, author identity, circle ID, logical parents, event type, encryption epoch, protocol version, and content hash.
- Event types: post/create (validated 0–4 image attachments, text body up to 300 grapheme clusters, and 0–3 separately encoded external URL attachments; canonical display order images → text → links), comment/create, comment/reply, reaction/set, edit, delete/tombstone, membership/add, membership/remove, invite/revoke, device/revoke, chat/create, chat/message, moderation/action. Post edits obey the same limits.
- Sync with inventory summaries, compact event requests, incremental chunk downloads, retries, integrity checks, and explicit expiration/retention policies.
- Do not treat message receipt by one relay as delivery to every circle member. UI status labels should distinguish **queued**, **synced to network**, and **confirmed delivered** when proof exists.
- Out-of-order events, repeated receipt, revoked devices, and stale membership epochs must be handled deterministically.
- Protect relays and clients with quotas, rate limits, maximum message and attachment sizes, upload concurrency limits, and spam-resistant admission controls.

### 6.3 Offline, background and notification truthfulness

- Offline viewing and composing are supported. Outgoing events remain queued and sync when the application next has a working route.
- **Permission does not equal continuous processing**: iOS and Android can suspend closed PWAs and terminate idle service workers. A browser cannot be relied upon to keep WebRTC/long-lived peer routing alive while closed, even if the user opts into notifications.
- Optional Web Push can wake a short-lived service worker and show a visible notification if a compatible installed PWA has been granted permission; iOS requires visible notifications. To initiate a push request while the recipient is offline, a sender/authorized independent online gateway must know and use a push endpoint; browser/OS vendor push infrastructure will still be involved. Protect the subscription token and never put plaintext circle content in a push payload.
- Android browser-managed background synchronization may retry some work, but is opportunistic and may not run promptly; iOS does not offer equivalent general periodic sync for PWAs. Every operation must be resumable and idempotent.
- With no reachable phones or independent nodes holding the ciphertext, the app **cannot guarantee new messages will eventually arrive**. State this honestly, including the possibility of expired relay retention.
- In-app badges update at synchronization; background push and silent delivery are **separate** features. The app must show a status when notifications or background sync are unavailable or disabled.
- Explain to users that delivery and notifications may be delayed while peers and relay nodes are unreachable.

### 6.4 Decentralization, availability and relay design checks

- Demonstrate operation with **at least two independently administered** discovery/relay endpoints. Test removing the first relay entirely, and confirm continued invitation redemption, identity verification, encrypted media download, post sync, and chats through the other endpoint after an appropriate reconnect period.
- Define ciphertext queue retention, recipient acknowledgment, retry/backoff, duplicate suppression, loss handling, upload quotas, resource limits, and per-circle retention controls. Relay service is not a data-availability guarantee by itself.
- Minimize metadata exposed to relays; publish limitations on IP addresses, delivery timestamps, traffic volumes, and push providers. Do not claim peer-to-peer or end-to-end encryption makes users anonymous.
- Before sending a large photo or message to a relay, agree on content-size limits, bandwidth policies, and backpressure so volunteer relay costs are bounded.
- Version and migrate encrypted events without dropping encryption protections, signatures, or circle-specific identities; independently maintained clients need interoperable protocols.

## 7. Media delivery and storage

- Enforce **0–4 images per post** in the composer and receiving protocol, including post edits. Compress photo locally before encrypting/sending, then derive smaller feed thumbnails. Serve **only the optimized, privacy-sanitized uploaded image** for full-screen viewing and download; do not send untouched camera originals.
- Use encrypted content-addressed chunks, integrity hashes, deduplication **within authorized scopes**, resumable transfer, and cache eviction.
- Avoid exposing shared hashes across unrelated circles when doing so could reveal that they contain identical media.
- Set configurable per-device storage budgets. Include user controls: retain media in this circle, download larger optimized images on Wi-Fi only, clear thumbnail cache, export personal archive.
- Respect browser storage quotas and eviction behavior. Downloads on Safari/iPhone and Android require real-device testing.

### 7.1 Mobile-first image compression pipeline (v1.4)

**Policy:** All photos uploaded anywhere in the app—including circle posts, comment photos if enabled, profile photos, direct messages, and private group chats—are **processed locally before encryption and distribution**, never silently sent as the untouched camera original.

1. Decode the chosen image on the device; respect orientation; reject malformed, oversized, or unsupported input gracefully without freezing the UI. Test HEIC/HEIF ingestion on real iPhones and fallback conversion behavior on Android.
2. Resize proportionally to a **maximum long edge around 1600 px** for the distributed/downloadable version, with no upscaling. Preserve aspect ratio, adjust orientation correctly, and handle transparency/illustrations separately if necessary.
3. Export adaptively using a verified browser-supported efficient format; **WebP where its *encoder* is supported**, otherwise high-quality **JPEG** for ordinary photos. Do not assume Safari supports WebP canvas **encoding** simply because it can display WebP. Keep PNG only when transparency or sharp graphics justify it. Check actual output MIME type, alpha support, and file dimensions on each platform.
4. Start with a **quality-oriented target** roughly **150–450 kB per typical photographic image**, and a soft maximum of about **1 MB** where necessary to preserve useful detail; these are *tuning targets*, not guarantees. Reduce quality/dimensions gradually for oversized images, but don't silently turn complicated photos into visibly damaged images. Test perceptual quality on mid-range iPhones/Android devices; disclose and handle exceptions.
5. Generate a distinct small feed-preview thumbnail, roughly **320–500 px wide** with a target of **15–60 kB**, and a separate optimized upload for zoom/download. Defer the larger version until opened or explicitly downloaded, avoiding repeated network transfers where cached.
6. **Remove GPS, EXIF, and optional camera-identifying metadata** during conversion. Ensure images received from peers are validated and decoded safely, and store only encrypted chunks outside of unlocked local rendering.
7. Preserve a user's **original camera file on their device's own photo library** as normal, but do **not** upload/store a full-resolution original as part of the social application by default. The app's **Download image** action saves the optimized, privacy-sanitized shared copy. Make the wording clear; never describe it as original resolution.
8. Apply sensible memory and processor limits for low-end phones, interruptible compression, progress states, and an upload-size warning if an image cannot be safely optimized. PWA save-to-device behavior differs on iOS and Android and requires real-device verification.
9. Compression occurs **before end-to-end encryption**; ciphertext is generally not usefully compressible. All media in DMs and private chats follows the same policy.

## 8. Privacy and abuse protections

- Collect no global contact list. Contacts are invited only by explicit user action.
- No global profile search; no global following, recommendation, public hashtags, or cross-circle reach.
- No centralized analytics or advertisement IDs. Diagnostic logs opt-in, temporary, and redacted.
- Provide block, mute, report to circle moderators, and per-circle message-request settings.
- Circle moderators govern within their circles, with appeal/dispute policy and transparent signed moderation actions where appropriate.
- Do not claim to prevent screenshots, copying, external re-upload, or the persistence of previously delivered messages.
- Protect invitation tokens from accidental leakage in web analytics, link previews, browser referrer headers, and email-provider link scanners. Prefer a separate high-entropy joining capability in a URL **fragment** or manual redemption code rather than a query string; verify that PWA installation/navigation does not drop it. Require deliberate authenticated redemption, not a GET visit, so email link scanners cannot consume single-use invitations. Use `Referrer-Policy: no-referrer` and sanitize link navigation.

## 9. Deployment and long-term availability

- **Prototype:** HTTPS static PWA hosting, potentially GitHub Pages, after checking its use restrictions; separate hosting from private content and network transport. A noncommercial free app is not automatically exempt from host terms. GitHub Pages can serve static install/update assets; it is **not** a WebRTC signaling server, TURN server, encrypted-message storage relay, or push sender. GitHub's hosting policy limits commercial SaaS usage; reevaluate distribution strategy before production.
- **Production:** Multiple separately controlled mirrors for static assets plus independent peer-discovery/signaling and encrypted store-and-forward relays. **Mirrors do not automatically share local browser storage**: if the installed PWA's original hostname disappears, its IndexedDB, service worker, push subscriptions, and PWA installation scope do not simply move to another domain. Use a stable canonical HTTPS origin and provide signed identity backup/export plus a documented reinstall/restore migration path.
- No app-store dependency or proprietary hosted database. External transport infrastructure (email, telephone networks, TURN, or push services) is not the same as a central social database.
- Open-source distribution and community-managed relay nodes should be considered to improve auditability and long-term continuity.

## 10. Polished mobile interface, accessibility, and operations

### 10.1 Navigation and visual design

- **Exactly five persistent bottom controls, in order:** **Home (house icon)**, **Circles (users icon)**, **+ (Create Post)**, **Messages (chat icon)**, **Settings (gear icon)**. All tabs receive short accessible labels; the plus remains visually prominent in the center. Do not add a sixth bottom control for alerts or profile.
- **Messages and alerts:** Messages has a dedicated bottom tab with an unread badge and one-tap access to the inbox. Members can also start DMs from another member's circle-scoped profile; an optional compact activity/alerts header icon covers replies and invitations without adding another bottom tab.
- **Fast orientation:** Home means the reverse-chronological union of **all circles the user has joined**; Circles lists memberships and opens **only the selected circle's** feed. Always show the circle name on an individual post and clear back navigation. No public or algorithmically recommended content.
- **Visual reading order:** Author/circle → **1–4 photo layout** → optional 300-character body → separate numbered `Link 1`–`Link 3` rows → comments/reactions. No image captions between photos and body unless incorporated into the 300-character text. Keep photos uncluttered and downloadable.
- **Settings front page:** Top-level Quick Actions: **Invite a Member**; **My Profile / Edit Profile**; **Appearance: Light / Dark** (persist preference, optionally allow system-following). Secondary expandable groups: Circles & Invitations, Privacy & Security, Account Recovery & Backups, **Background Activity & Notifications**, Storage & Offline, Accessibility, Help & About. Show only the most useful choices initially; avoid endless settings lists. If background features are unsupported, explain availability rather than offering a nonfunctional switch.
- **Polished visual language:** Restrained neutral palette and one accent color; consistent spacing, rounded surfaces without excessive cards or shadows, crisp icons, recognizable typography, clear typographic hierarchy, and balanced whitespace. Support light/dark themes and operating-system text scaling.
- **Comfortable reading:** Give media and post text visual priority over controls; up to four images appear above any text or links, with aspect-aware gallery layout and lightweight previews; the text follows the entire photo gallery, then numbered links. Avoid awkward cropping, unnecessary card chrome, auto-play, and layout shifts.
- **Low-friction actions:** One-tap comment and reaction, visible image-download control, simple post composer, straightforward circle management, and no dark-pattern prompts, infinite overlays, pop-ups, auto-play media, or irrelevant recommendations.
- **Interaction states:** Provide coherent skeleton/empty/offline/error states, unobtrusive confirmations, retry affordances, and clear pending/synced indicators. Preserve feed scroll position and drafts when switching between posts and circles where privacy allows.

### 10.2 Accessibility and mobile quality

- Mobile-first accessible interface: readable contrast, system text scaling, screen-reader labels, large touch targets **at least 44 × 44 CSS pixels** for primary touch actions where practical, high-contrast theme, reduced-motion support.
- Test compact iPhone and Android screen widths, notches/safe areas, browser keyboard overlap, landscape orientation, accessibility text zoom, and screen readers (VoiceOver and TalkBack).
- Tap targets for link cards, image-viewer/download actions, the five bottom controls, and Settings Quick Invite must not overlap; external links must be distinguishable by text/accessible name, not color or icon alone.
- Counters `Text N/300`, `Images N/4`, and `Links N/3` must announce limits accessibly; explain errors for overlength text, a fifth image or fourth link, unsupported URLs, and unavailable downloads in plain language.
- **Performance goals:** Make the first feed view useful promptly on mid-range phones; keep JavaScript bundles lean, virtualize only if it does not break accessibility or navigation, decode smaller photo previews before originals, and avoid network requests triggered merely by link-card rendering.

### 10.3 Operations
- Installation walkthrough for iOS and Android, including fallback on unsupported browser/OS combinations.
- Clear explainers for local-only storage, backups, delayed delivery, invitation risks, and recovery limitations.
- Connection/relay status; manual resync; data export; cache and battery/bandwidth preferences; data usage estimates.
- Multiple-circle notifications with per-circle mute and digest settings; quiet unread-message badges accessible from the Home header.
- Error reporting with no involuntary private content upload; optional sanitized diagnostic bundle.

## 11. Initial release priorities

### Stage 0 — Prove feasibility, not just interface

- Install a signed/reproducible static PWA from HTTPS on real iPhone and Android devices.
- Create two separate cryptographic identities and a signed join invitation.
- Connect two devices through WebRTC with a documented signaling method; test direct route and TURN fallback.
- Deliver one encrypted post/comment, and verify recipient authentication and membership gating.
- Restore the original identity from an encrypted backup on a second device.
- **Two-device background reality test:** with one Android phone and one iPhone, measure delivery/notifications in foreground, minimized, locked screen, and closed-app states. Record which events need independent relays or push providers; do not infer behavior from a desktop browser.
- **No-single-node test:** disable one independent relay and verify the client can use another. If no working online endpoint exists, show a truthful delayed-delivery state instead of incorrectly marking content delivered.
- Test invitation redemption following an email link scanner opening the URL, and an iPhone Home Screen install where the invite must survive handoff.
- Test local data eviction, erased-site-data, a compromised app-host threat scenario, device revocation propagation, and signed group membership updates. Security review must include key compromise and malicious JavaScript distribution risks.

### Stage 1 — Closed alpha

- Circle creation, **Settings → Invite a Member → choose a circle → email/share/copy**, two-button email invitations, secure joining, encrypted posts/comments, limited reactions, **max four images + 300 characters + three external links** with strict images → text → links rendering.
- Private one-to-one DMs and opt-in group chats with independent keys; member-list → Message entry, bottom-tab inbox, message requests, blocking, and accurate queue/delivery states; mod/admin membership operations.
- Up to four **locally compressed and privacy-sanitized** photo uploads per post, zoom, individual optimized-photo downloads, and storage controls; polished **five-control Home / Circles / + / Messages / Settings bottom navigation**, readily accessible DM inbox, accessible composer, simple threaded discussions, and link destination inspection.
- Encrypted backup by email/file and recovery-secret restoration; **no biometrics**.
- Distributed event sync, anti-duplication, and optional independent encrypted relay service.

### Stage 2 — Harden and expand

- Multi-device support, trusted-contact/threshold recovery, more robust moderation and invite revocation.
- Improved relays, group encryption state convergence, encrypted group chats and optional push gateway.
- Independent security assessment, fuzzing, abuse and load testing, backup disaster drills, and distribution-host compromise review.

## 12. Acceptance tests before a release may be called usable

1. iPhone and Android users install from an emailed link **without an app store**.
2. A can create circles X and Y, and B may join X only with a valid invitation; C in Y has no access to X.
3. A creates a post in X with **four photos**, text, and links. B comments, replies and reacts, opens each photo full screen, and independently downloads each optimized sanitized upload. A sees the author and exact circle clearly labeled; B can return to the same feed scroll position.
4. The app exposes **no** repost, cross-circle forwarding, public post, public profile, follower, or discover-everyone action.
5. B and A exchange a private encrypted DM; C cannot decipher it even if they are in circle X, unless C is an explicit participant in a group chat.
6. A device going offline may write a post; after reconnection and available peer/relay routes, the network eventually converges without duplicates.
7. Removing B from X excludes B from **new epochs**. B may still possess content received before removal; interface and documentation communicate this limitation.
8. A replaces a lost phone and restores the same identity using an **encrypted backup plus recovery secret**, with email or mobile number allowed as coordination and retrieval channels. No biometric step is necessary.
9. Lost email access or a SIM swap **alone** does not transfer an existing encrypted identity.
10. A closed/suspended PWA is not represented as always-online; push and relay limitations are visible to users.
11. App handles malformed event payloads, replay attacks, old invitations, duplicate posts, and storage quota errors safely.
12. Deployment host serves no social posts or keys in readable form, but release process acknowledges the trusted-code-host attack surface.
13. Post composer accepts up to four images, 300 user-perceived text characters, and three links independently; rejects a fifth image, 301st character, or fourth link with clear feedback and live counters. Receiving peers reject over-limit signed events. Links and image references do not consume the text allowance.
14. A member pastes one YouTube link and two website links: the feed displays exactly `Link 1`, `Link 2`, and `Link 3` on separate rows/cards **below the photos and written text**, with recognizable domains. The full valid URLs remain intact and open the correct external destinations; no raw long URLs clutter the feed.
15. Attempting a fourth link explains the three-link limit and permits removing a link without losing the text or photo draft. Inserting a duplicate, malformed, deceptive, or unsupported URL triggers a safe, comprehensible outcome. The app never silently strips or truncates user input.
16. Link cards must not automatically request thumbnails or embeds from YouTube or third-party websites. The user can inspect/copy the destination, and opening a link does not disclose a private circle's URL or invite token via referrer headers.
17. Navigation works on a small iPhone and Android device with exactly **five** persistent controls (**Home, Circles, +, Messages, Settings**), an unread badge on the Messages tab, chronological all-circle Home, circle-only feeds, clear per-circle labels, accessible 44px controls, safe-area handling, light/dark modes, and scroll preservation.
18. Link-only, image-only, text-only, and mixed posts work; whenever all sections are present, post cards, detail views, and previews render **all photos first, then text, then numbered links**. Comments and DMs remain functional and private; no post permalink, repost, or cross-circle content-transfer feature exists.
19. Image composer allows 0–4 photos and prevents attaching a fifth; deleting/reordering retains the remaining items. One-, two-, three-, and four-photo layouts work on narrow iPhone/Android widths; every photo supports full-screen zoom and its own download action. An incoming signed event containing five image references is rejected.
20. From Settings, any member with permission can choose **Invite a Member**, select one joined circle, create a valid signed invitation, and open an email/share flow with the two onboarding actions. Ineligible circles clearly explain why inviting is unavailable; copy invitation/code works without a configured email client.
21. Settings lets a user edit profile details and switch between Light/Dark themes in one or two taps, without visiting an advanced submenu. The theme stays consistent when switching Home/Circles/Messages and after reopening the PWA.

22. A fourth image attaches successfully and renders in a **2×2 grid** above all text and external links. A fifth image is rejected in the composer and at the receiving peer. The image indicator reads `Images N/4`; the viewer shows each of the four image positions and individual Download actions.
23. A long-running photo upload interrupted by a loss of connectivity remains queued, can resume, and does not falsely show Delivered. The receiving phone can display a lightweight thumbnail before the larger optimized version finishes downloading.
24. A member opens a circle, sees its rules and authorized member list, filters its feed, and can mute notifications or leave. A creator who leaves has a clear administrator-succession process.
25. The PWA can be closed during sync without silently losing a saved draft or presenting universal delivery as complete. On iPhone and Android, opening again shows correct queued/synced status.
26. A member can restore identity from an encrypted backup and secret even without the old phone. Possession of only the recovery email inbox or only the phone number does not grant access.
27. A revoked member is rejected for newly encrypted posts, comments, and photos; cross-circle identities and encryption material are not exposed by membership in other circles.
28. Text scaling, alt text, contrast, reduced motion, and visible focus/keyboard support are tested on actual Android and iPhone devices.
29. All added photos (posts, comments where enabled, DM, group chat, and profile) are resized and compressed on the device **before encryption**. The original camera image is not silently transmitted. Downloads yield the optimized sanitized photo. Real iPhone and Android tests compare acceptable display quality with measured file sizes, including fallback JPEG encoding where WebP export isn't supported.
30. Four optimized photos per post remain visually clear on small phones, with 2×2 layout, on-demand full-screen zoom/download, small thumbnails, reasonable memory usage, and no GPS/EXIF leaks.
31. A user opens the persistent **Messages** bottom tab in one tap, sees unread count and recent chats, initiates a one-to-one DM from a shared-circle member's profile, and receives replies securely. A nonmember and a blocked user cannot initiate unauthorized chats.
32. A member creates a private chat with selected other members of the **same circle**. Other circle members and circle administrators (unless participants) cannot decrypt or view the chat, and removed group participants cannot decrypt newly sent messages after rekeying.
33. With one phone offline, the other sees honest queued/relay/confirmed delivery status; a closed PWA doesn't promise instant messaging or plaintext push notifications.
34. Five bottom controls remain accessible and readable on small Android/iPhone widths without overlap: **Home / Circles / + / Messages / Settings**. Creating a post and opening an inbox are each one tap from major views.

35. On iPhone, granting notification permission produces a user-visible push notification from an authorized push sender while the PWA is closed; it does **not** cause the phone to keep a continuously running WebRTC peer connection. Turning notifications off does not corrupt stored posts or keys.
36. On Android, background sync is used only when feature-detected. If background sync is blocked, throttled, unsupported, or deferred, the app queues safely and resumes on opening; the Settings screen does not falsely claim always-on operation.
37. With all member phones closed, a queued event reaches a recipient only when a functioning relay or other suitable online store-and-forward path exists and later synchronization succeeds. Otherwise the sender sees pending status, with no fictitious delivery receipt.
38. A high-entropy invitation URL inspected by an email security scanner is **not** automatically consumed. A real member must perform explicit authenticated redemption, and invite fragments/codes do not leak to outbound websites.
39. Changing device, deleting the installed PWA, clearing site data, or migrating the hosting domain does not leave members falsely believing their local identity is backed up; supported backup/restore procedures recover keys and circle membership when the recovery secret is available.
40. Disconnecting one relay operator does not expose plaintext, and after connection to another independent node the circle can continue to sync. Measure delays and acknowledge that network availability is conditional on actual independent routes.
41. The icon, home header, invitation email, PWA manifest, installed app name, privacy text, and help screens all use **Private Circle** (singular). The navigation tab remains **Circles**.
42. Photo metadata scrubbing and 4-image limit, 300-grapheme text limit, 3-link limit, no forwarding, invite-only circles, and DM privacy remain enforced through incoming event validation, not merely by the UI.

## 13. Resolved questions and explicitly deferred choices

**Resolved:** official app name **Private Circle**; free application; Android/iPhone PWA; no app stores; no central social user database; invitation-only circles; multiple circles per person; circle posts cannot be reposted or cross-shared through app features; members can comment on images and posts and download photos; **maximum four optimized images, maximum 300 grapheme-cluster text characters, maximum three external links per post; every post displays images first, text second, Link 1/2/3 last**; individual optimized-photo downloads; visual shortening without changing link destinations; privacy-preserving links; **five bottom controls Home / Circles / + / Messages / Settings**, Home shows all joined-circle posts, Circles opens a single-circle feed, Messages opens the inbox; **Settings Quick Invite**, profile edits and Light/Dark switch prominently accessible; accessible mobile UX; DMs and private chats; no biometric requirement; email/phone recovery channels; encrypted backup and cryptographic proof required.

**Deferred to a security prototype, not silently assumed:** trustworthy audit-reviewed ratcheting protocol and cross-device chat key recovery; reliable unattended iPhone delivery (notification permission is not a solution to always-on relay limitations); truly cost-free relay operations at scale; exact cross-device secure local unlock behavior in every mobile browser; email/SMS verification without a central verification provider; group key convergence under offline conflicting admin changes; trusted-contact threshold recovery; background push without a service; protecting the PWA if its hosting origin is compromised.

## 14. Supporting standards and documentation

- MLS group encryption: https://www.rfc-editor.org/rfc/rfc9420.html
- WebRTC connection and signaling: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling
- TURN/STUN details: https://webrtc.org/getting-started/peer-connections
- Web Push for iPhone Home Screen web apps: https://webkit.org/blog/13878/
- Apple Web Push and requirement for visible notifications: https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
- Service worker termination and lifecycle: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope
- Offline and background behavior in PWAs: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
- Chrome periodic background sync, availability and scheduling: https://developer.chrome.com/docs/capabilities/periodic-background-sync
- Browser storage persistence/eviction: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- Browser image encoding and MIME fallback: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
- Background Sync compatibility: https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
- NIST authentication/recovery guidance: https://pages.nist.gov/800-63-4/sp800-63b.html
- GitHub Pages hosting limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits


## 15. Final review and release decision (October 12, 2026)

**Product decisions: APPROVED for implementation planning.** The scope is coherent: free invitation-only circle communities; no public content or followers; strict content bounds; mobile-optimized imagery; simple five-tab navigation; E2EE posts and chats; encrypted identity/recovery; and static web installation.

**Technical feasibility: NOT YET VERIFIED.** The remaining critical engineering gates are: (1) interoperable encrypted membership and identity-recovery implementation; (2) real Android/iPhone foreground/offline/reopen synchronization; (3) optional user-visible push notifications with independent trigger infrastructure; (4) two independently operated relays and measured performance/cost; (5) trustworthy release/update protection against a malicious or compromised static app host; (6) iOS/Android real-device photo downloads, install handoff, and accessibility.

**Security signoff: PENDING.** Do not describe the implementation as secure, private against all adversaries, or ready for widespread use until protocol review, threat modeling, dependency assessment, and third-party security testing have been completed.

**Product limitation to disclose clearly:** A member's phone cannot be turned into a permanently available routing node simply by granting a background permission. Temporary online encrypted relays improve delivery but do not create guaranteed availability, and third-party browser/OS push systems are still involved when notifications are used.
