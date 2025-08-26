# Backend Scripts

This directory contains utility scripts for maintaining and managing the backend.

## Available Scripts

### `simple_endpoint_scanner.py` ⭐ **RECOMMENDED**

A simplified and reliable scanner that focuses on finding endpoints without complex function detection. This is the most reliable scanner, finding 165+ endpoints.

#### Usage

```bash
# Scan all API files and display endpoints
python scripts/simple_endpoint_scanner.py --scan

# Scan and save results to a file
python scripts/simple_endpoint_scanner.py --scan --output endpoints_found.md
```

#### Features

- Automatically scans all Python files in `backend/api/`
- Extracts endpoint information (method, path, auth requirements)
- Generates clean markdown tables for easy documentation updates
- Successfully detects all endpoint types including admin endpoints
- **Most reliable scanner** - found 165+ actual endpoints

### `update_api_docs.py`

An experimental AST-based scanner that attempts to extract function names and docstrings. Less reliable than the simple scanner.

#### Usage

```bash
# Scan all API files and display endpoints
python scripts/update_api_docs.py --scan

# Scan and save results to a file
python scripts/update_api_docs.py --scan --output api_scan_results.md

# Check if documentation is up to date (not yet implemented)
python scripts/update_api_docs.py --check-docs
```

#### Features

- Automatically scans all Python files in `backend/api/`
- Extracts endpoint information (method, path, auth requirements, descriptions)
- Generates markdown tables for easy documentation updates
- Helps maintain `ai_docs/docs/backend-api-endpoints.md` as the single source of truth

#### When to Use

- After adding new API endpoints
- After modifying existing endpoints
- Before updating the API documentation
- To verify all endpoints are properly documented

## Running Scripts

All scripts should be run from the `backend/` directory:

```bash
cd backend
python scripts/update_api_docs.py --scan
```

## Contributing

When adding new scripts:

1. Add a clear description in this README
2. Include usage examples
3. Document any dependencies or requirements
4. Follow the same coding standards as the main project
