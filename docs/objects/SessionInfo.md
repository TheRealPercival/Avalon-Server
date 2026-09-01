# Session Info

| Property | Type | Description |
| -------- | ---- | ----------- |
| `inSession` | `boolean` | The session status of the requesting client |
| `users` | [`UserPayload[]`](./UserPayload.md) | The other users currently in the session |


### Example

```json
{
    "inSession": true,
    "users": [
        {
            "id": "0a76ebff-f3b9-4d2c-8126-be92dbb8cee6",
            "name": "ben.json",
            "avatarURL": "https://cdn.discordapp.com/avatars/318511797642592257/4d8313035ea42d81324db60231a7bce1.png"
        }
    ]
}
```
