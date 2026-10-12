# Private Circle — Alpha 0.1 (first working PWA prototype)

**Status: experimental proof of concept, not a secure production messenger.** This is a real local-first, installable PWA with a basic **manually signaled** WebRTC synchronization demonstration. No central social database, no server code, no subscriptions, no app stores.

## Features implemented
- Five-tab, light/dark mobile-first UI: Home, Circles, Post, Messages, Settings.
- Local P-256 signing and agreement keypairs per device (Web Crypto). Cryptographically signed posts/comments/reactions and invitations; AES-256-GCM encrypts circle traffic over WebRTC.
- Create multiple circles (30-member interface limit), open circle-only feeds, create invitation codes with 7-day expiry, and join by code or invite URL.
- Write posts with at most **300 grapheme characters**, **four locally compressed/sanitized photos**, and **three clickable external links**. Display order: photos, text, links; comments, likes, image view/download, saved-post metadata.
- Direct encrypted **one-to-one text chats** between **currently manually connected** peers, using an independent ECDH-derived symmetric key; local unsent messages retransmit when paired to that recipient.
- Contact editor with recovery email/phone **metadata only**; password-encrypted JSON backup & restore (PBKDF2 + AES-GCM); light/dark/system theme; opt-in notification permission.
- Offline reading and local posting with IndexedDB. Peer synchronization happens when *both devices are connected while their app is open*.
- No third-party JavaScript libraries, analytics, external image previews, or vendor accounts. Google STUN is configured only for WebRTC candidate discovery.

## Known missing features — blocking production launch
- **No persistent background connection**, discovery service, TURN relay, push-sending service, or encrypted offline mailbox. Notification permission alone does not enable remote push or background peer networking. Opening the app does **not** magically find previously paired devices.
- Manual offer/answer SDP exchange (large codes) is **test-only** and can fail through some carrier networks. The initial release needs decentralized discovery and multiple independent relays, plus automatic reconnect and queue/receipt handling.
- Circle invitation possession currently grants the shared circle secret and is **not** administrator-approved or globally one-time; circle membership maximum is only locally observed, **not** authoritatively coordinated across devices. No real revoke, key rotation, administrator delegation, robust identity-link protection, or MLS implementation. Do not use for confidential conversations.
- Local private signing keys and message contents are stored in IndexedDB in this prototype **without a local unlock secret**; the device's browser profile protection is all that protects them at rest. No audited key storage or recovery-contact verification. Phone/email recovery is **not implemented**; encrypted backup restores identity instead.
- One-to-one messages are encrypted over the manual WebRTC peer channel but are stored unencrypted locally. Group DMs, media in chats, moderation, edit propagation, encrypted backups stored remotely, and automatic deletion synchronization are not yet implemented.
- Invitation email links need the app to be deployed at a stable HTTPS address. The email uses two labeled URLs (plain mailto draft), not embedded HTML buttons. Anyone with an invite code can learn the circle shared secret.
- Because posts are copied across phones, a local deletion cannot remove previously synchronized copies. Account identity and circle security require external audit before real use.
- Download uses the device-compressed optimized image, not the original camera file.

## Run locally
Requires Python 3 or another static HTTP server.
```bash
cd private-circle-alpha
python3 -m http.server 8080
```
Open `http://localhost:8080/` in a current desktop browser. Browser security APIs typically work on `localhost`; for **phones** host files over **HTTPS** using GitHub Pages or another static host.

## How to test with two devices
1. Deploy the folder to one GitHub Pages site, so both devices use the same origin.
2. Open on each device; create a distinct local identity.
3. Phone A creates a circle → Settings → Invite a Member → email/copy the invitation code. Phone B joins that circle by code.
4. With **both apps open**: Settings → Peer connection on A → `Phone A: Create offer`. Copy the generated long code to Phone B.
5. On B: paste A's offer into `Code received` → `Phone B: Answer offer`. Copy B's generated answer back to A.
6. On A: paste B's answer into `Code received` → `Process received code`. When connected, existing signed posts from common circles synchronize.
7. While connected, publish a short post with photos, text, and links, add comments, or open Messages to chat with the connected member.
8. If they don't connect, test on the same Wi-Fi first. Internet and carrier NATs can require a TURN relay.

**Free static hosting:** Put `index.html` and its sibling files at your GitHub Pages site root, or set Pages to serve this project directory. The service worker and manifest use relative URLs and therefore also work under a repository subpath.

## Security / deployment notes
The identity is created locally; no username or password service is involved. A PWA **cannot** maintain a continuous peer connection on a locked iPhone or while suspended. Apple requires a web push gateway for background push delivery. GitHub Pages is a host for the static frontend only; it cannot provide push, signaling, peer storage, or TURN. Test on Safari (installed via Add to Home Screen) and Android Chrome before release.

## Recommended next milestone
Replace manual signaling with decentralized service discovery and signaling, deploy at least two separately administered encrypted store-and-forward relays, add an explicit circle membership/rekey protocol and local key protection, and perform a cross-platform security and reliability test.

## Later specification addendum
`PRODUCT_SPEC_v1.6.md` specifies the **initial 30-member circle limit**, on-open fallback synchronization, notification permissions, and the next engineering acceptance gates. Those capabilities are targets, not all accomplished in alpha 0.1.0.
