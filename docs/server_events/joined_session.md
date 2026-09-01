# Joined Session

This event gets emitted when an authorized socket joins the current session. It is broadcasted to every authorized socket other than the one that joined.

| Event name | Argument | Ack |
| ---------- | -------- | ---- |
| `joined_session` | [`UserPayload`](../objects/UserPayload.md) | None |
