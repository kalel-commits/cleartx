# 🤝 Contributing to ClearTx

Thank you for your interest in contributing to ClearTx! This guide will help you get started.

## 🎯 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/cleartx.git`
3. **Install** dependencies: `npm install`
4. **Start** development: `npm run dev`
5. **Pick** an issue from the [good first issues](https://github.com/yourname/cleartx/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
6. **Create** a branch: `git checkout -b feature/your-feature`
7. **Make** your changes
8. **Test** your changes: `npm test`
9. **Commit** with a clear message: `git commit -m "feat: add your feature"`
10. **Push** to your fork: `git push origin feature/your-feature`
11. **Create** a Pull Request

## 🏷️ Issue Labels

- `good-first-issue` - Perfect for new contributors
- `gsoc-candidate` - Great for GSOC 2025 projects
- `bounty` - Paid issues (via GitHub Sponsors)
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `help-wanted` - Extra attention is needed

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Use Jest and React Testing Library
- Test user interactions, not implementation details
- Aim for >80% code coverage
- Test both success and error cases

### Example Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionsPage } from '../TransactionsPage'

test('adds new transaction', () => {
  render(<TransactionsPage />)
  
  fireEvent.change(screen.getByLabelText(/amount/i), {
    target: { value: '100' }
  })
  fireEvent.click(screen.getByText(/add transaction/i))
  
  expect(screen.getByText('₹100')).toBeInTheDocument()
})
```

## 📝 Code Style

### TypeScript
- Use strict mode
- Prefer interfaces over types for objects
- Use meaningful variable names
- Add JSDoc comments for complex functions

### React
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Use proper prop types

### CSS/Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use semantic class names

## 🏗️ Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── core/          # Core utilities and logic
├── plugins/       # Plugin system
├── types/         # TypeScript type definitions
└── storage.ts     # Data persistence
```

## 🚀 Development Workflow

### 1. Setup
```bash
git clone https://github.com/YOUR_USERNAME/cleartx.git
cd cleartx
npm install
npm run dev
```

### 2. Make Changes
- Create a feature branch: `git checkout -b feature/your-feature`
- Make your changes
- Follow the code style guidelines
- Write tests for new functionality

### 3. Test
```bash
npm test
npm run lint
npm run type-check
```

### 4. Commit
```bash
git add .
git commit -m "feat: add your feature"
```

### 5. Push and PR
```bash
git push origin feature/your-feature
# Create Pull Request on GitHub
```

## 📋 Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(transactions): add UPI auto-detection
fix(ui): resolve mobile layout issues
docs(readme): update installation instructions
test(accountMatcher): add unit tests for bank detection
```

## 🎁 Rewards for Contributors

### Good First Issue
- Shoutout in README
- Mentor guidance
- Welcome to the community

### GSOC Candidate
- Mentor recommendation letter
- Technical guidance
- Project proposal review

### Bounty Issue
- $50 via GitHub Sponsors
- Featured contributor status
- Direct mentorship

### Top 3 Contributors
- Featured on project homepage
- Private mentoring sessions
- GSOC proposal review
- Direct input on project direction

## 🤝 Community Guidelines

### Be Respectful
- Use inclusive language
- Respect different viewpoints
- Be patient with newcomers

### Be Helpful
- Answer questions in issues
- Review pull requests
- Share knowledge and resources

### Be Professional
- Follow the code of conduct
- Maintain high code quality
- Communicate clearly

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/yourname/cleartx/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourname/cleartx/discussions)
- **Chat**: [Matrix Room](https://matrix.to/#/#cleartx:matrix.org)

## 🎯 GSOC 2025

ClearTx is a great project for GSOC 2025! Here's why:

### Technical Depth
- Advanced React/TypeScript
- AI/ML integration
- Privacy and cryptography
- Chrome extensions

### Real-World Impact
- Solves actual problems
- Privacy-focused approach
- Indian market relevance

### Mentorship
- Experienced maintainers
- Clear project roadmap
- Supportive community

### Project Ideas
1. **AI Receipt Scanning** - TensorFlow.js + OCR
2. **Real-Time UPI Sync** - Chrome Extension API
3. **Privacy Features** - Tor integration, encryption
4. **Advanced Analytics** - ML-powered insights

## 📄 License

By contributing to ClearTx, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to financial privacy! 🏦🔒**
