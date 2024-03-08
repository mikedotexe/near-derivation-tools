# NEAR Derivation Tools

This repo is growing with functions that'll help derive addresses for different blockchains.

# Basics

Install:

    npm i

Build:

    npm run build

# Public key simple example 

Let's get a Bitcoin address from a public key. I'll spit out the "bottom of the list" of NEAR access keys on `mike.testnet`. This is using [NEAR CLI]():

    near keys mike.testnet | tail

Toward the bottom grab one, like `ed25519:HzRRrBtRpwdjRCGvWvNwm2cLgDaMA86GaQgweR3GW7BZ`

And then we'll head into the NodeJS REPL in the project root:

```sh
node
const nearSiggy = require('./src/index.js')
await nearSiggy.uncompressedHexPointToBtcAddress('ed25519:HzRRrBtRpwdjRCGvWvNwm2cLgDaMA86GaQgweR3GW7BZ')
```

It will spit out something, like:

```sh
Bitcoin address 1yp9X1xtuGFXRp3XuSwDiwAYdcqkVg16W
'1yp9X1xtuGFXRp3XuSwDiwAYdcqkVg16W'
```

You can use an contributor website to verify that it's a valid Bitcoin address:

https://thomas.vanhoutte.be/tools/validate-bitcoin-address.php?address=1yp9X1xtuGFXRp3XuSwDiwAYdcqkVg16W&submit=

# Context 🏃💨

This repo is currently in the form of "go go go!" and not complete, but is a decent place for other people to join in.

The logic in the `src` directory is taken from these GitHub gists:

- https://gist.github.com/esaminu/f8cc37849de754f228c5a67bebce9b0f
- https://gist.github.com/esaminu/4509c6b6c94122d944c72f6ab58ff19c

We currently do not have an NPM package, so the original intent was to take the gists and turn them into a tiny, not-overbuilt Typescript app.

Let's publish this to NPM, please.
