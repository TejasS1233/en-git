# Contributing to en-git

Thank you for your interest in contributing to en-git! We welcome contributions from the community and are grateful for your support.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/en-git.git
   cd en-git
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/TejasS1233/en-git.git
   ```

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- A GitHub account

### Client Setup
```bash
cd client
npm install
npm run dev
```
The client will be available at `http://localhost:3000`

### Server Setup
```bash
cd client
npm install
npm run dev
```
The server will be available at `http://localhost:8000`

### Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=your_api_url
VITE_GITHUB_TOKEN=your_github_token (optional)
```
Create a `.env` file in the `server` directory:

| **Category**               | **Key Variables**                                                                                                                                                       | **Example / Description**                 |
| :------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------- |
| **Server**                 | `PORT=8000`<br>`SERVER_URL=http://localhost:8000`<br>`CLIENT_URL=http://localhost:3000`<br>`CORS_ORIGIN=http://localhost:3000`                                          | Basic server and client setup             |
| **GitHub (optional)**      | `GITHUB_TOKEN=`<br>`GITHUB_CLIENT_ID=`<br>`GITHUB_CLIENT_SECRET=`                                                                                                       | Used to increase API rate limits          |
| **Google / Generative AI** | `GOOGLE_API_KEY=`<br>`GOOGLE_CLIENT_ID=`<br>`GOOGLE_CLIENT_SECRET=`                                                                                                     | For Google OAuth or generative API access |
| **Auth / JWT**             | `ACCESS_TOKEN_SECRET=change_this_to_a_random_secret`<br>`REFRESH_TOKEN_SECRET=change_this_to_a_random_secret`<br>`ACCESS_TOKEN_EXPIRY=15m`<br>`REFRESH_TOKEN_EXPIRY=1d` | Token-based authentication                |
| **Cloudinary (Uploads)**   | `CLOUDINARY_CLOUD_NAME=`<br>`CLOUDINARY_API_KEY=`<br>`CLOUDINARY_API_SECRET=`                                                                                           | For avatar/media uploads                  |
| **Email (optional)**       | `SMTP_HOST=`<br>`SMTP_PORT=587`<br>`SMTP_SECURE=false`<br>`SMTP_USER=`<br>`SMTP_PASS=`<br>`SMTP_FROM_EMAIL="noreply@example.com"`                                       | Nodemailer configuration                  |
| **Payments (Razorpay)**    | `RAZORPAY_KEY_ID=`<br>`RAZORPAY_KEY_SECRET=`                                                                                                                            | Payment integration keys                  |
| **Twilio (optional)**      | `TWILIO_ACCOUNT_SID=`<br>`TWILIO_AUTH_TOKEN=`                                                                                                                           | For SMS / phone verification              |

## Project Structure

```
en-git/
├── client/              # React web application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utility functions
│   │   ├── config/      # Configuration files
│   │   └── context/     # React context providers
│   └── public/          # Static assets
├── server/              # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Mongoose data models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Utility functions
│   │   └── app.js       # Express app setup
├── chrome-extension/    # Chrome extension
│   ├── src/             # Extension source files
│   ├── icons/           # Extension icons
│   └── manifest.json    # Extension manifest
└── docs/                # Github Pages
```

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix issues and improve stability
- **New features**: Add new functionality
- **Documentation**: Improve or add documentation
- **UI/UX improvements**: Enhance user interface and experience
- **Performance optimizations**: Make the app faster
- **Tests**: Add or improve test coverage
- **Translations**: Help translate the app (future)

### Finding Issues to Work On

- Check the [Issues](https://github.com/TejasS1233/en-git/issues) page
- Look for issues labeled `good first issue` for beginner-friendly tasks
- Issues labeled `help wanted` are great for contributors
- Feel free to ask questions on any issue

## Coding Guidelines

| Code Style                                  | React                                                       | CSS/Styling                               | Node/Express                                             |
| :------------------------------------------ | :---------------------------------------------------------- | :---------------------------------------- | :------------------------------------------------------- |
| • Use **ES6+ syntax**                       | • Use **functional components** with hooks                  | • Use **Tailwind CSS** utility classes    | • Use **Express.js** for routing and middleware          |
| • Use **2 spaces** for indentation          | • Keep components **small and focused**                     | • Follow **mobile-first** approach        | • Follow **RESTful API** design                          |
| • Use **semicolons**                        | • Use **meaningful** component and prop names               | • Use **semantic class names**            | • Use **async/await** for asynchronous code              |
| • Use **single quotes** for strings         | • Manage state with **React Hooks / Context API**           | • Maintain **dark mode** compatibility    | • Handle errors using **middleware**                     |
| • Use **camelCase** for variables/functions | • Avoid **prop drilling** (use context or state management) | • Keep styles **consistent and reusable** | • Separate **routes, controllers, and services** clearly |

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format
```
<type>(<scope>): <subject>
<body>
<footer>
```
### Types
| Type | Description |
| --- | --- |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, missing semicolons, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |

## Pull Request Process

1. **Create a new branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** and commit them following the commit guidelines
3. **Keep your branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request** on GitHub:
   - Provide a clear title and description
   - Reference any related issues (e.g., "Fixes #123")
   - Add screenshots for UI changes
   - Ensure all checks pass
6. **Respond to feedback**:
   - Address review comments promptly
   - Make requested changes
   - Push updates to the same branch

When you create your Pull Request, you will be presented with a template. Please fill out the checklist in the template to help reviewers understand your changes and ensure your submission meets our guidelines.
