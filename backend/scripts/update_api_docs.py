#!/usr/bin/env python3
"""
Script to help maintain the backend API endpoints documentation.
This script scans the backend API files and can help identify new/modified endpoints.
"""

import os
import re
import ast
from pathlib import Path
from typing import List, Dict, Set
import argparse

def find_api_files(backend_dir: str = "api") -> List[str]:
    """Find all Python files in the API directory."""
    api_dir = Path(backend_dir)
    if not api_dir.exists():
        print(f"❌ API directory not found: {backend_dir}")
        return []
    
    api_files = []
    for file_path in api_dir.glob("*.py"):
        if file_path.name != "__init__.py":
            api_files.append(str(file_path))
    
    return api_files

def extract_endpoints_from_file(file_path: str) -> List[Dict]:
    """Extract endpoint information from a Python API file."""
    endpoints = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse the Python file
        tree = ast.parse(content)
        
        # Find router definitions
        router_name = None
        router_prefix = ""
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id == 'router':
                        if isinstance(node.value, ast.Call):
                            if hasattr(node.value.func, 'id') and node.value.func.id == 'APIRouter':
                                router_name = 'router'
                                # Check for prefix
                                for keyword in node.value.keywords:
                                    if keyword.arg == 'prefix':
                                        if isinstance(keyword.value, ast.Constant):
                                            router_prefix = keyword.value.value
                                        elif hasattr(keyword.value, 's'):  # ast.Str in older Python versions
                                            router_prefix = keyword.value.s
                                break
        
        # Find endpoint decorators
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                # Check for decorators (compatible with Python 3.8+)
                decorators = getattr(node, 'decorator_list', [])
                for decorator in decorators:
                    if isinstance(decorator, ast.Call):
                        # Check if this is a router decorator (e.g., @router.get(), @router.post())
                        if hasattr(decorator.func, 'value') and hasattr(decorator.func.value, 'id'):
                            if decorator.func.value.id == router_name:
                                # This is an endpoint
                                method = decorator.func.attr
                                path = ""
                                
                                # Check for path arguments
                                if decorator.args:
                                    if isinstance(decorator.args[0], ast.Constant):
                                        path = decorator.args[0].value
                                    elif hasattr(decorator.args[0], 's'):  # ast.Str in older Python versions
                                        path = decorator.args[0].s
                                
                                # Combine prefix and path
                                full_path = router_prefix + path if router_prefix and path else router_prefix or path
                                
                                # Get function docstring
                                docstring = ast.get_docstring(node) or "No description available"
                                
                                # Determine auth requirement (simplified)
                                auth_required = "User"  # Default assumption
                                if "admin" in full_path.lower():
                                    auth_required = "Admin"
                                elif any(word in full_path.lower() for word in ["login", "register", "contact", "health"]):
                                    auth_required = "None"
                                
                                endpoints.append({
                                    "method": method.upper(),
                                    "path": full_path,
                                    "auth": auth_required,
                                    "description": docstring.strip(),
                                    "file": os.path.basename(file_path)
                                })
        
    except Exception as e:
        print(f"⚠️  Error parsing {file_path}: {e}")
    
    return endpoints

def generate_markdown_table(endpoints: List[Dict]) -> str:
    """Generate a markdown table from endpoint data."""
    if not endpoints:
        return "No endpoints found."
    
    # Sort endpoints by path
    endpoints.sort(key=lambda x: x['path'])
    
    table = "| Method | Endpoint | Auth | Description |\n"
    table += "|--------|----------|------|-------------|\n"
    
    for endpoint in endpoints:
        # Truncate long descriptions
        desc = endpoint['description']
        if len(desc) > 60:
            desc = desc[:57] + "..."
        
        table += f"| {endpoint['method']} | `{endpoint['path']}` | {endpoint['auth']} | {desc} |\n"
    
    return table

def main():
    parser = argparse.ArgumentParser(description="Update API endpoints documentation")
    parser.add_argument("--scan", action="store_true", help="Scan all API files and show endpoints")
    parser.add_argument("--check-docs", action="store_true", help="Check if docs are up to date")
    parser.add_argument("--output", help="Output file for the scan results")
    
    args = parser.parse_args()
    
    if args.scan:
        print("🔍 Scanning backend API files...")
        api_files = find_api_files()
        
        if not api_files:
            print("❌ No API files found")
            return
        
        print(f"📁 Found {len(api_files)} API files")
        
        all_endpoints = []
        for file_path in api_files:
            print(f"📄 Scanning {os.path.basename(file_path)}...")
            endpoints = extract_endpoints_from_file(file_path)
            all_endpoints.extend(endpoints)
            print(f"   Found {len(endpoints)} endpoints")
        
        print(f"\n📊 Total endpoints found: {len(all_endpoints)}")
        
        if args.output:
            with open(args.output, 'w') as f:
                f.write("# API Endpoints Scan Results\n\n")
                f.write(f"Generated on: {__import__('datetime').datetime.now()}\n\n")
                f.write("## All Endpoints\n\n")
                f.write(generate_markdown_table(all_endpoints))
            print(f"💾 Results saved to {args.output}")
        else:
            print("\n## All Endpoints\n")
            print(generate_markdown_table(all_endpoints))
    
    elif args.check_docs:
        print("🔍 Checking if API documentation is up to date...")
        # This would compare the current docs with the scanned endpoints
        print("⚠️  Check docs functionality not yet implemented")
    
    else:
        print("🔍 Use --scan to scan all API files")
        print("🔍 Use --check-docs to check if documentation is up to date")
        print("🔍 Use --output <file> to save results to a file")

if __name__ == "__main__":
    main()
