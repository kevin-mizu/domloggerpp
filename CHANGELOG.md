# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2024-05-16

### Added

- New configs available in the configs folder.
- New requiredHooks config option.
- New exec: match and !match directives -> generate your regex using JavaScript.
- It is now possible to fully configure the devtools table (hiding columns, reordering, etc.).
- New domlogger.clean() function to reset the current Canary debugger.

### Updated

- hookFunction now ensures that the provided code is valid.
- In case of attribute hooking, if neither get: nor set: is specified, both will be hooked.
- The goto function has been optimized and should always be working.

### Fixed

- Internally used functions are now safely utilized, avoiding any DOS issues.
- The devtools table is now perfectly responsive.

## [1.0.3] - 2023-10-25

### Added

- First public release.
