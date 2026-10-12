# Private Circle — Implementation Addendum v1.6

**Date:** October 12, 2026  
**Status:** Version 1.5 requirements + initial implementation decisions. See `PRODUCT_SPEC_v1.5.md` for the complete requirements.

## Decisions agreed for first build

1. **Circle maximum: 30 total members**, including creator and administrators, for the first production target. Members may join multiple circles. This is a design cap to simplify invitation administration, encryption rekeying, and distribution load. Reconsider a 50-member limit only after collecting cross-platform bandwidth, completion, latency, and reliability measurements. **Critical:** A decentralized membership ledger must authoritatively enforce the cap; the alpha local counter alone does not.
2. **On-open synchronization is the primary fallback:** Once a member opens Private Circle, the app should automatically discover reachable authorized peers, authenticate each, request missing signed events since known checkpoints, synchronize comments and media, and show a truthful progress/delivery state. Requires a discovery/signaling solution not in alpha.
3. **Send while online and active:** When a member posts, their open app should encrypt and send to reachable authorized peers; peers with available bandwidth can relay signed, ciphertext-only events to other circle members. Set bounded fanout, retries, replay prevention, and storage limits. No device can be compelled to run after suspension.
4. **When phones sleep or close:** The receiving app cannot depend on background peer connections, even if the user enabled notifications. Optional background sync can help on supported browsers; *push is not a transport*. Resilient encrypted store-and-forward needs separately operated, compatible relays and a push-sending service if alerts are desired.
5. **Notifications require explicit permission:** Request once after a user action, explain benefits, respect denial. iOS supports Web Push for eligible installed Home Screen apps but requires real sending infrastructure. No claim that permission enables always-on peer relaying.
6. **Simple sync messages:** User-facing statuses must distinguish `Saved locally`, `Connecting`, `Peer synced`, `Waiting for delivery`, and `Delivered` only after genuine recipient acknowledgments. Avoid pretending offline members have received posts.
7. **Keep no central company-controlled social database.** Static HTTPS hosting distributes the frontend; one authoritative hosted database is prohibited. Future relays must be independently deployable and unable to decrypt user content, though they may see some metadata.

## Working alpha in this folder

- Version: **0.1.0**, first frontend + direct peer protocol proof of concept.
- Includes installable mobile PWA, five-tab interface, local identity, encrypted-backup export and restore, circle creation, signed invitation token exchange, feeds, images optimized on device, text posts, links, comments, likes, one-to-one DM between connected peers, and experimental direct synchronization with manual WebRTC offer/answer pairing.
- **Not included / not yet proven:** automated peer discovery, background message delivery, real remote push, independently deployed relays, full membership approval and key rotation, distributed authoritative 30-member cap, encrypted-on-disk identity unlock, verified email/phone recovery, multi-party group chats, all-device deletion, and cross-platform security audit.
- Do not release this alpha as a private or secure messaging product; see `README.md` for limitations and test steps.

## Engineering acceptance gate for next milestone

1. On two devices of different operating systems, install the PWA over HTTPS; generate identities; join the same circle with no user-account database.
2. Exchange encrypted signed post/comment events; verify that altered signatures and different circle keys fail; test up to four optimized images and large links.
3. Disconnect/reconnect; sync missed events without duplicates, with honest acknowledgement statuses.
4. Implement signed invitations needing approval, invitation revocation, member removal, circle-key rotation, and a globally consistent cap of 30 members.
5. Prove relay-assisted encrypted delivery with one or both phones suspended. If not possible under constraints, explicitly communicate best-effort delivery and require the app to be opened.
6. Security review for identity keys and backups before any sensitive real-world use.
