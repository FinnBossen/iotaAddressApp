# IOTA Address App

A App developed with Svelte and Typescript.
For the Ionic UI components were used.
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

Start:

To start the application you need to run the websocket and the application

in the package json you can use the scripts that run bot concurrently:

dev-with-websocket or start-with-websocket


Usage of App:

The added addresses can be deleted by swuping left and then clicking on the delete button.
Underneath are several buttons where the value type (IOTA,MIOTA...) can be selected, the display will be changed according to that.

![image](https://user-images.githubusercontent.com/40921409/138539856-01217bba-8938-4c98-abeb-7220bf0a2e5e.png)


