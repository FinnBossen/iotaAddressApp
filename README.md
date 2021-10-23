# IOTA Address App

A App developed with Svelte.
You can add IOTA addresses from the devnet and they will be update through a mqtt connection that is maintained inside a websocket.

Example Addresses from the devnet.
[
  'atoi1qz6dr6dtl0856tf0pczz7gesrf7j8a4vr00q58ld2zx7ttlv3p96snpym9z',
  'atoi1qpp7sz28a0ghvd6knwnljr7j2s04qquduuc5vlz94fwf94zznj2yv5ew2c4',
  'atoi1qzje6zhg5vu456eg3z84ekcfn3laxqyczche5eeqhcdh3w9yr5sqvr4z4td',
  'atoi1qqwhxjmcvmatpedeedapgx0vwyupfwx9k5n4w0lnc5l6vmz78aavwhs55v0',
  'atoi1qzg63t9880jtfysvpq7rrynz0rqt3kd2fw8r4934ezraz9dpwvzxkw2dtmh'
]

To give the addresses some iota you can use the faucet https://faucet.chrysalis-devnet.iota.cafe/

To start the application you need to run the websocket and the application

in the package json you can use the scripts that run bot concurrently:

dev-with-websocket or start-with-websocket

