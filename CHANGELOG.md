# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dual format build support (ESM + CommonJS) for maximum compatibility
- Comprehensive test suite with Vitest
- Enhanced type safety throughout codebase
- Strict TypeScript types for all component interfaces
- Component type exports for better type inference
- ESLint configuration with React and accessibility rules

### Changed
- Removed 'use client' directives from components for framework-agnostic usage
- Improved ESLint configuration with comprehensive rule set
- Updated build configuration to generate both ESM and CJS formats
- Enhanced TypeScript types for better developer experience

### Fixed
- Type safety issues in DataTable component
- React Hook rules violation in DeleteConfirmDialog
- Import ordering across all files
- Build configuration for better package compatibility

## [0.1.0] - 2025-03-16

### Added
- Initial release
- DataTable component with pagination and actions
- TableHeader component with search functionality
- TablePagination component with page size selector
- DeleteConfirmDialog component with verification
- Full TypeScript support
- Tailwind CSS integration
- Component injection pattern for maximum flexibility
