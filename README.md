# 🔐 Keyvaultify CLI

The official command-line interface for Keyvaultify - a secure secrets management platform for developers and teams.

## 🚀 Features

- 🔑 **Secure Authentication** - API token-based authentication with validation
- 📁 **Project Management** - Link local projects to Keyvaultify projects
- 🌱 **Environment Support** - Manage secrets across multiple environments
- 🔐 **Secrets Management** - Push, pull, and manage individual secrets
- 📊 **Beautiful CLI** - Interactive prompts, progress indicators, and colored output
- 🛡️ **Error Handling** - Comprehensive error messages with helpful suggestions

## 📦 Installation

### Global Installation

```bash
npm install -g @keyvaultify/cli
```

### Local Installation

```bash
npm install @keyvaultify/cli
npx keyvault --help
```

## 🚀 Quick Start

### 1. Login

```bash
keyvault login
```

Paste your API token from [Keyvaultify Settings](https://keyvaultify.com/settings/developer).

### 2. Initialize Project

```bash
keyvault init
```

Select your project and environment from the interactive menu.

### 3. Push Secrets

```bash
keyvault push
```

Upload your `.env` file to Keyvaultify.

### 4. Pull Secrets

```bash
keyvault pull
```

Download secrets to your local `.env` file.

## 📋 Commands

### Authentication

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `keyvault login`  | Authenticate with Keyvaultify |
| `keyvault logout` | Log out and clear credentials |

### Projects

| Command                       | Description                       |
| ----------------------------- | --------------------------------- |
| `keyvault init`               | Link local project to Keyvaultify |
| `keyvault projects`           | List all available projects       |
| `keyvault projects:show <id>` | Show project details              |

### Environments

| Command                           | Description                          |
| --------------------------------- | ------------------------------------ |
| `keyvault environments`           | List environments in current project |
| `keyvault environments:show <id>` | Show environment details             |

### Secrets

| Command                                   | Description                         |
| ----------------------------------------- | ----------------------------------- |
| `keyvault push [--env <file>]`            | Push secrets from .env file         |
| `keyvault pull [--env <file>] [--force]`  | Pull secrets to .env file           |
| `keyvault secrets`                        | List secrets in current environment |
| `keyvault secrets:show <key>`             | Show specific secret                |
| `keyvault secrets:set <key> <value>`      | Set a secret value                  |
| `keyvault secrets:delete <key> [--force]` | Delete a secret                     |

## 🔧 Configuration

### Environment Variables

```bash
# API endpoint (default: http://localhost:3000)
export KEYVAULTIFY_API_URL=https://api.keyvaultify.com

# Debug mode
export KEYVAULTIFY_DEBUG=true

# Log level
export KEYVAULTIFY_LOG_LEVEL=debug
```

### File Locations

- **Config**: `~/.keyvaultify/config.json`
- **Project Config**: `.keyvaultify/project.json`
- **Debug Logs**: `~/.keyvaultify/debug.log`

## 📖 Examples

### Basic Workflow

```bash
# 1. Login
keyvault login

# 2. Initialize project
keyvault init

# 3. Push secrets
keyvault push

# 4. Pull secrets to different file
keyvault pull --env .env.production
```

### Managing Individual Secrets

```bash
# List all secrets
keyvault secrets

# Show specific secret
keyvault secrets:show DATABASE_URL

# Set a new secret
keyvault secrets:set API_KEY "sk_test_123456"

# Delete a secret
keyvault secrets:delete OLD_KEY
```

### Working with Different Environments

```bash
# List environments
keyvault environments

# Show environment details
keyvault environments:show env_123

# List secrets in specific environment
keyvault secrets --env env_123
```

## 🛠️ Development

### Setup

```bash
git clone https://github.com/keyvaultify/cli.git
cd keyvaultify-cli
npm install
```

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## 🔐 Security

- **API Tokens**: Stored securely in `~/.keyvaultify/config.json`
- **Encryption**: All secrets are encrypted server-side using AES-256-GCM
- **Permissions**: Role-based access control (members: read, admins: write)
- **Network**: All communication over HTTPS

## 🐛 Troubleshooting

### Common Issues

**"Not logged in" error**

```bash
keyvault login
```

**"Project not initialized" error**

```bash
keyvault init
```

**"Invalid token" error**

- Check your token at https://keyvaultify.com/settings/developer
- Run `keyvault logout` and `keyvault login` again

**Network errors**

- Check your internet connection
- Verify the API URL: `echo $KEYVAULTIFY_API_URL`

### Debug Mode

Enable debug logging:

```bash
export KEYVAULTIFY_DEBUG=true
keyvault <command>
```

Debug logs are saved to `~/.keyvaultify/debug.log`.

## 📚 API Reference

The CLI communicates with the Keyvaultify API:

- **Base URL**: `https://api.keyvaultify.com` (or `http://localhost:3000` for development)
- **Authentication**: Bearer token in `Authorization` header
- **Content-Type**: `application/json`

### Endpoints

- `GET /api/cli/projects` - List projects
- `GET /api/cli/projects/:id/environments` - List environments
- `GET /api/cli/secrets/:envId` - Get secrets
- `POST /api/cli/secrets/:envId` - Push secrets
- `DELETE /api/cli/secrets/:envId/:key` - Delete secret

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: https://keyvaultify.com/docs/cli
- **Issues**: https://github.com/keyvaultify/cli/issues
- **Email**: support@keyvaultify.com

---

Made with ❤️ by the Keyvaultify team
