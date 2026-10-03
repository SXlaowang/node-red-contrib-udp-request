# @laowang_shanxi/node-red-contrib-udp-request

Node-RED UDP-Request node.
Send UDP datagram and wait for reply, single output port.

## Features
- Send UDP packets, wait for remote response
- Auto‑convert `string / number / boolean` to UTF‑8 bytes
- Pass‑through raw binary Buffer without modification
- Single output with unified status field
- Status codes: `ok`, `timeout`, `param_error`, `socket_error`, `send_error`

## Install

### Via Node-RED Palette Manager
Search: `@laowang_shanxi/node-red-contrib-udp-request`

### Via command line
```bash
cd ~/.node-red
npm install @laowang_shanxi/node-red-contrib-udp-request
```

## Input Message Properties

| Property | Type | Description |
| --- | --- | --- |
| `msg.ip` | string | Target host IP, overrides node Host setting |
| `msg.port` | number | Target UDP port, overrides node Port setting |
| `msg.payload` | `string \| number \| boolean \| Buffer` | Data to send. Buffer will be sent as raw binary. |
| `msg.timeout` | number | Timeout in milliseconds, overrides node timeout |

## Output Message Properties

| Property | Type | Description |
| --- | --- | --- |
| `payload` | `Buffer \| null` | Raw reply Buffer on success; `null` when timeout or error |
| `udp_status` | string | `ok` / `timeout` / `param_error` / `socket_error` / `send_error` |
| `response` | `string \| null` | UTF‑8 decoded reply. If decode fails: `decode_fail:hex_string`. `null` for errors. |
| `rinfo` | object | Remote peer address info, only present when `udp_status === "ok"` |
| `error` | string | Human‑readable error text, only present on error conditions |

## Important Notes

- Plain JavaScript array `[0x01,0x02]` **is NOT a Buffer**.
For binary frames use: `Buffer.from([0x01, 0x02])`.
- Node only uses Node.js built‑in `dgram`, no extra dependencies.

## Compatibility

- Node.js >=14
- Node-RED >=2.0

## License

MIT
