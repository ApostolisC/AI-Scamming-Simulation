# Contributing to AI Scammer Simulation

Thank you for your interest in contributing to the AI Scammer Simulation project! This guide will help you get started with contributing to our codebase.

## 🎯 Project Vision

Our goal is to create a sophisticated, educational tool that helps people understand and recognize scammer tactics through AI-powered simulations while maintaining the highest standards of security and user experience.

## 🚀 Quick Start for Contributors

### 1. Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/AI-Scammer-Simulation.git
cd AI-Scammer-Simulation

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL-OWNER/AI-Scammer-Simulation.git
```

### 2. Set Up Development Environment
Follow the detailed setup instructions in [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#development-environment-setup).

### 3. Create a Branch
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

## 📋 Ways to Contribute

### 🐛 Bug Reports
- Use the GitHub issue template
- Include steps to reproduce
- Provide system information
- Include error messages and logs

### 💡 Feature Requests
- Check existing issues first
- Describe the problem you're solving
- Explain the proposed solution
- Consider backward compatibility

### 🔧 Code Contributions
- Follow our coding standards
- Include tests for new features
- Update documentation as needed
- Ensure security best practices

### 📚 Documentation
- Fix typos and unclear explanations
- Add examples and tutorials
- Improve API documentation
- Translate to other languages

## 🎨 Development Guidelines

### Code Style

#### Python (Backend/Server)
```python
# Follow PEP 8
# Use type hints
def process_request(data: Dict[str, Any]) -> ResponseModel:
    """Process incoming request data.
    
    Args:
        data: Request data dictionary
        
    Returns:
        Processed response model
        
    Raises:
        ValidationError: If data is invalid
    """
    pass

# Use dataclasses for structured data
from dataclasses import dataclass

@dataclass
class ApiResponse:
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
```

#### TypeScript (Frontend)
```typescript
// Use strict TypeScript
// Define proper interfaces
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
  disabled?: boolean;
}

// Use proper error handling
const handleApiCall = async (): Promise<void> => {
  try {
    const response = await api.call();
    // Handle success
  } catch (error) {
    console.error('API call failed:', error);
    // Handle error
  }
};

// Export components properly
export default ComponentName;
```

### Commit Message Format
```
type(scope): brief description

Longer description if needed

Fixes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(api): add spam classification endpoint

Add new endpoint for real-time spam detection with confidence scoring.
Includes rate limiting and input validation.

Fixes #45
```

```
fix(frontend): resolve authentication header issue

SpamCheck component was not including Authorization header in API calls.
Added proper authentication using getAuthHeaders utility.

Fixes #67
```

## 🧪 Testing Requirements

### Backend Tests
```python
# test_new_feature.py
import pytest
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_new_endpoint():
    """Test the new endpoint functionality"""
    response = client.post("/api/new-endpoint", 
        json={"test": "data"},
        headers={"Authorization": "Bearer test-key"}
    )
    assert response.status_code == 200
    assert response.json()["success"] is True

class TestNewFeature:
    def test_validation(self):
        """Test input validation"""
        # Test implementation
        pass
    
    def test_error_handling(self):
        """Test error conditions"""
        # Test implementation  
        pass
```

### Frontend Tests
```typescript
// NewComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import NewComponent from './NewComponent';

describe('NewComponent', () => {
  test('renders correctly', () => {
    render(<NewComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('handles user interaction', () => {
    const onSubmit = jest.fn();
    render(<NewComponent onSubmit={onSubmit} />);
    
    fireEvent.click(screen.getByText('Submit'));
    expect(onSubmit).toHaveBeenCalled();
  });
});
```

### Running Tests
```bash
# Backend tests
cd server
pytest

# Frontend tests  
cd frontend
npm test

# All tests with coverage
pytest --cov=. && cd ../frontend && npm test -- --coverage
```

## 🔒 Security Guidelines

### Security Checklist
- [ ] No hardcoded secrets or API keys
- [ ] All inputs validated and sanitized
- [ ] Proper error handling (no information leakage)
- [ ] Authentication required for protected endpoints
- [ ] Rate limiting implemented where appropriate
- [ ] HTTPS enforced in production

### Security Review Process
1. Run security audit: `npm audit` and `safety check`
2. Check for hardcoded secrets: `git log --grep="password\|secret\|key"`
3. Validate input sanitization
4. Test authentication and authorization
5. Review error messages for information disclosure

## 📝 Pull Request Process

### 1. Pre-submission Checklist
- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] Documentation updated
- [ ] Security considerations addressed
- [ ] No merge conflicts with main branch
- [ ] Commits are squashed and have clear messages

### 2. PR Description Template
```markdown
## Description
Brief description of the changes and why they're needed.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

Describe the tests you ran and how to reproduce them.

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### 3. Review Process
1. **Automated Checks**: CI/CD pipeline runs tests and security scans
2. **Code Review**: Maintainers review code for quality, security, and style
3. **Testing**: Reviewers test the changes locally if needed
4. **Documentation**: Ensure documentation is updated
5. **Approval**: At least one maintainer approval required
6. **Merge**: Squash and merge to main branch

## 🏷️ Issue Labels

We use labels to categorize and prioritize issues:

### Type Labels
- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `security`: Security-related issues
- `performance`: Performance improvements

### Priority Labels
- `priority: high`: Critical issues
- `priority: medium`: Important issues
- `priority: low`: Nice-to-have issues

### Status Labels
- `status: help-wanted`: Extra attention is needed
- `status: good-first-issue`: Good for newcomers
- `status: in-progress`: Currently being worked on
- `status: blocked`: Blocked by other work

### Component Labels
- `component: backend`: AI processing modules
- `component: server`: FastAPI server
- `component: frontend`: Next.js application
- `component: docs`: Documentation

## 🌟 Recognition

### Contributors
We maintain a list of contributors in our README and release notes. Your contributions will be acknowledged!

### Hall of Fame
Outstanding contributors may be featured in our project documentation and social media.

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's technical standards

### Communication
- Use GitHub issues for bug reports and feature requests
- Join discussions in GitHub Discussions
- Be patient and helpful with newcomers
- Provide context and examples in your questions

## 📚 Resources for Contributors

### Technical Resources
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Comprehensive development guide
- [SECURITY.md](SECURITY.md) - Security guidelines and best practices
- [README.md](README.md) - Project overview and quick start

### Learning Resources
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Python Testing with pytest](https://docs.pytest.org/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [GitHub CLI](https://cli.github.com/) - Command-line GitHub tools

## 🎯 Current Priorities

### High Priority
- [ ] Improve test coverage (currently ~70%, target 90%+)
- [ ] Performance optimization for AI model calls
- [ ] Enhanced error handling and user feedback
- [ ] Mobile-responsive design improvements

### Medium Priority
- [ ] Additional AI model integrations
- [ ] Internationalization support
- [ ] Advanced analytics and monitoring
- [ ] Database integration for conversation persistence

### Good First Issues
- [ ] Fix typos in documentation
- [ ] Add loading states to frontend components
- [ ] Improve error messages
- [ ] Add unit tests for utility functions
- [ ] Update dependencies to latest versions

## 🚀 Getting Help

### Stuck? Here's how to get help:

1. **Check Documentation**: Look through our docs and guides
2. **Search Issues**: Check if someone else had the same problem
3. **Ask Questions**: Create a GitHub Discussion or issue
4. **Join the Community**: Connect with other contributors

### Mentorship
New contributors can request mentorship by creating an issue with the `help-wanted` label. Experienced contributors will help guide you through your first contributions.

## 📊 Development Statistics

Track project health and your contributions:
- **Test Coverage**: Aim for 90%+ coverage
- **Code Quality**: Follow linting and style guidelines
- **Documentation**: Keep docs up-to-date with code changes
- **Security**: Regular security audits and updates

## 🔄 Release Cycle

We follow semantic versioning (MAJOR.MINOR.PATCH):

- **Patch releases** (bug fixes): As needed
- **Minor releases** (new features): Monthly
- **Major releases** (breaking changes): Quarterly

Contributors will be notified of upcoming releases and can help with testing release candidates.

---

## Thank You! 🙏

Your contributions make this project better for everyone. Whether you're fixing a typo, adding a feature, or helping other contributors, every contribution matters.

Happy coding! 🚀
