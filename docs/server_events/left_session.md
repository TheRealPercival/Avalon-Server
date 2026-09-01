# Joined Session

This event gets emitted when an authorized socket leaves the current session. It is broadcasted to every authorized socket other than the one that left.

| Event name | Argument | Ack |
| ---------- | -------- | ---- |
| `left_session` | [`UserPayload`](../objects/UserPayload.md) | None |
