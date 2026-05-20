# Contributing Guide

Thank you for your interest in contributing! 🎉

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Install dependencies: `pip install -r backend/requirements.txt && cd frontend && npm install`
4. Make your changes with tests
5. Run tests: `pytest backend/tests/ -v && cd frontend && npm test`
6. Commit: `git commit -m "feat: your feature description"`
7. Push and open a Pull Request

## Code Standards

- **Python**: Black formatting, Ruff linting, mypy type hints
- **JavaScript**: ESLint + Prettier
- **Commits**: Conventional Commits format (`feat:`, `fix:`, `docs:`, etc.)
- **Tests**: Minimum 80% coverage for new code

## Pull Request Process

1. Update README.md if you add features
2. Add tests for all new functionality
3. Ensure CI/CD pipeline passes
4. Request review from maintainers

## Code of Conduct

Be respectful, inclusive, and constructive. We welcome contributors of all backgrounds.
