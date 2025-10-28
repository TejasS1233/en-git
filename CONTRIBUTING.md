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

The client will be available at `http://localhost:5173`

### Chrome Extension Setup

```bash
cd chrome-extension
npm install
```

To load the extension in Chrome:

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` directory

### Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=your_api_url
VITE_GITHUB_TOKEN=your_github_token (optional)
```

## Project Structure

```
en-git/
├── client/                 # React web application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utility functions
│   │   ├── config/        # Configuration files
│   │   └── context/       # React context providers
│   └── public/            # Static assets
├── chrome-extension/      # Chrome extension
│   ├── src/              # Extension source files
│   ├── icons/            # Extension icons
│   └── manifest.json     # Extension manifest
└── docs/                 # Documentation
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

### JavaScript/React

- Use **functional components** with hooks
- Follow **ES6+ syntax**
- Use **meaningful variable and function names**
- Keep components **small and focused**
- Use **TypeScript** where possible (future goal)

### Code Style

- Use **2 spaces** for indentation
- Use **semicolons**
- Use **single quotes** for strings
- Use **camelCase** for variables and functions
- Use **PascalCase** for components
- Add **comments** for complex logic

### CSS/Styling

- Use **Tailwind CSS** utility classes
- Follow **mobile-first** approach
- Use **semantic class names** when custom CSS is needed
- Maintain **dark mode** compatibility

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

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

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows the project's coding guidelines
- [ ] Commits follow the commit message format
- [ ] No console errors or warnings
- [ ] UI changes are responsive and work in dark mode
- [ ] Documentation is updated if needed
- [ ] Self-review of code completed
- [ ] PR description clearly explains the changes

### Recognition

Contributors will be:

- Listed in the project's README
- Mentioned in release notes
- Credited in the project documentation

---

Thank you for contributing to en-git! Your efforts help make this project better for everyone. 
