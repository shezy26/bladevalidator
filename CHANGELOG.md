# Changelog

All notable changes to BladeValidator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-23

### Added

- Initial release of BladeValidator
- Live form validation for Laravel Blade templates
- Support for Laravel FormRequest classes
- Automatic CSS framework detection (Bootstrap & Tailwind)
- Blade directive for easy integration: `@bladeValidator()`
- Validation triggers: blur, input (debounced), change
- Automatic JavaScript inclusion (no manual script tags needed)
- CSRF token auto-handling
- Comprehensive error display with framework-specific styling
- Custom error container support via `data-error-target`
- Public JavaScript API for programmatic control
- Full documentation and examples
- Minified JavaScript version for production

### Features

- Zero build tools required
- Works with existing Laravel validation
- Compatible with `$request->validated()` method
- Auto-detects Bootstrap and Tailwind CSS
- Configurable validation timing and behavior
- Support for custom error/success classes
- Callback hooks: onValidate, onSuccess, onError
- Multiple forms on same page support

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- All modern ES6-compatible browsers

### Requirements

- PHP 8.0+
- Laravel 9.0+
