# Changelog

All notable changes to ClearTx will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Smart UPI auto-detection from transaction notes
- Bank handle parsing (OKHDFC, YBL, AXIS, etc.)
- Hashtag extraction and tagging system
- Strict UPI ID validation
- Comprehensive test suite with Jest
- GitHub Actions CI/CD pipeline
- Open source documentation and templates
- MIT License

### Changed
- Removed GSOC mentions and references
- Improved UI for detected account display
- Enhanced error handling and validation
- Refactored plugin system for better maintainability

### Fixed
- Import errors for PluginManager and plugins
- SUSI.AI SSL certificate issues
- Transit fare calculation errors
- Data persistence issues
- TypeScript configuration for JavaScript imports

## [0.1.0] - 2024-12-XX

### Added
- Initial release of ClearTx
- Basic transaction management
- Local storage for data persistence
- Responsive UI with Tailwind CSS
- Plugin architecture foundation
- Tor integration for privacy
- Multi-language support

### Features
- Add, edit, and delete transactions
- Account management with masked numbers
- Filter and search transactions
- CSV export functionality
- Dark/light theme toggle
- Mobile-responsive design

---

## Contributing

To add entries to this changelog:

1. Add your changes under the appropriate section in `[Unreleased]`
2. Use the following prefixes:
   - `Added` for new features
   - `Changed` for changes in existing functionality
   - `Deprecated` for soon-to-be removed features
   - `Removed` for now removed features
   - `Fixed` for any bug fixes
   - `Security` for security vulnerability fixes

3. When releasing, move `[Unreleased]` content to a new version section
