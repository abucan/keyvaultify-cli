# 🔐 KeyVaultify Backend

KeyVaultify is a developer-first CLI tool and Node.js API that securely manages secrets across environments and projects. It enables solo developers and small teams to push, pull, and manage encrypted `.env` files with ease — without needing to expose secrets via Git or chat.

---

## 🚀 Features

- 🔑 CLI commands to push/pull `.env` secrets
- 🔒 AES-256-GCM encryption (client-side)
- 🌱 Project/environment-specific secret storage
- 📁 File-based local config for CLI usage
- 🧪 Local Node.js backend API for prototyping/testing

---

## 📦 Tech Stack

- **Node.js CLI (CommonJS)**
- **Axios** for HTTP requests
- **dotenv** for parsing `.env` files
- **Crypto** (AES-256-GCM for local encryption)
- **Local JSON/config storage** (no DB yet)
- **Pluggable project structure** for backend API

---

## 🛠️ Setup & Installation

### 1. Clone this project

```bash
git clone https://github.com/yourname/keyvaultify-cli.git
cd keyvaultify-cli
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run CLI locally (dev mode)

```bash
npm run dev -- login
```

---

## 🧱 CLI Commands

```bash
keyvault login          # Store your API token
keyvault init           # Link your local project and environment
keyvault push           # Encrypt and push secrets to the API
keyvault pull           # Fetch and decrypt secrets from the API
```

You can pass options like:

```bash
keyvault push --env .env.staging
keyvault pull --env .env.local --force
```

---

## 🌍 Environment Variables (for Backend/API)

While the backend is currently designed to run locally without a full DB, these variables are relevant for future expansion:

```env
PORT=3000
```

No `.env` required yet, but you can define one if the server is expanded.

---

## 🔐 API Endpoints

The CLI communicates with a local or hosted backend via the following routes:

### `POST /api/vault`

Push encrypted secrets to a specific project + environment.

**Request Body:**

```json
{
  "projectId": "abc123",
  "environment": "dev",
  "encryptedSecrets": {
    "iv": "...",
    "salt": "...",
    "tag": "...",
    "data": "..."
  }
}
```

### `GET /api/vault?projectId=abc123&environment=dev`

Returns the encrypted secrets blob.

**Response:**

```json
{
  "iv": "...",
  "salt": "...",
  "tag": "...",
  "data": "..."
}
```

---

## 🔐 Encryption Logic

Secrets are encrypted on the client using **AES-256-GCM**:

- Encryption key is derived from the API token
- Encrypted secrets are sent to the backend
- Decryption happens locally when pulling

See `src/utils/encrypt.js` for full implementation.

---

## 🧾 File-based Config System

### CLI Token Storage

Stored at:

```
~/.keyvaultify/config.json
```

### Project Linkage

Stored in project root:

```
.keyvaultify/project.json
```

Example:

```json
{
  "projectId": "abc123",
  "environment": "dev"
}
```

---

## 📂 Project Structure

```
src/
├── commands/           # CLI commands: login, init, push, pull
├── utils/              # Auth, encryption, project config
bin/
└── dev.js              # Entry point for CLI execution
```

---

## 🧠 Next Steps (Planned)

- Replace in-memory backend with persistent DB (PostgreSQL + Prisma)
- Add project/user linkage with auth tokens
- Implement audit logs
- Add web dashboard UI

---

## 🤝 Contributing

WIP — more coming once repo is public and backend evolves.

---
