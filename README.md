# envoy-cli

> Lightweight utility to sync and validate `.env` files across local, staging, and production using an encrypted manifest.

---

## Installation

```bash
npm install -g envoy-cli
```

Or use it directly with npx:

```bash
npx envoy-cli
```

---

## Usage

Initialize a new encrypted manifest in your project:

```bash
envoy init
```

Push your local `.env` to the manifest:

```bash
envoy push --env local
```

Pull and decrypt environment variables for a target environment:

```bash
envoy pull --env staging
```

Validate that all required keys are present across environments:

```bash
envoy validate --all
```

### Example workflow

```bash
# First-time setup
envoy init --key ./envoy.key

# Sync production env to your local machine
envoy pull --env production --out .env.production

# Check for missing or mismatched keys
envoy validate --env local --against production
```

---

## Configuration

`envoy-cli` looks for an `envoy.config.json` file in your project root. You can specify manifest location, key path, and target environments there.

---

## Requirements

- Node.js >= 16
- TypeScript >= 5.0

---

## License

[MIT](./LICENSE)