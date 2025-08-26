#!/usr/bin/env python3
"""
Simple script to scan FastAPI endpoints using regex patterns.
This is more reliable than AST parsing for finding decorators.
"""

import os
import re
from pathlib import Path
from typing import List, Dict
import argparse

def find_api_files(api_dir: str = "api") -> List[str]:
    """Find all Python files in the API directory."""
    api_path = Path(api_dir)
    if not api_path.exists():
        print(f"❌ API directory not found: {api_dir}")
        return []
    
    api_files = []
    for file_path in api_path.glob("*.py"):
        if file_path.name != "__init__.py":
            api_files.append(str(file_path))
    
    return api_files

def extract_endpoints_from_file(file_path: str) -> List[Dict]:
    """Extract endpoint information from a Python API file using regex."""
    endpoints = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find router prefix
        prefix_match = re.search(r'router\s*=\s*APIRouter\s*\(\s*prefix\s*=\s*["\']([^"\']+)["\']', content)
        router_prefix = prefix_match.group(1) if prefix_match else ""
        
        # Find all endpoint decorators
        # Pattern: @router.method("path") or @router.method("path", ...)
        # This covers @router.get(), @router.post(), @router.put(), @router.delete(), etc.
        endpoint_pattern = r'@router\.(get|post|put|delete|patch)\s*\(\s*["\']([^"\']+)["\']'
        
        matches = re.finditer(endpoint_pattern, content)
        
        for match in matches:
            try:
                method = match.group(1).upper()
                path = match.group(2)
                
                # Combine prefix and path
                full_path = router_prefix + path if router_prefix and path else router_prefix or path
                
                # Find the function definition after this decorator
                decorator_pos = match.start()
                # Look for the next function definition - search from decorator position
                # Handle both regular and async functions
                remaining_content = content[decorator_pos:]
                function_match = re.search(r'(?:async\s+)?def\s+(\w+)\s*\([^)]*\):', remaining_content, re.DOTALL)
                
                # Debug output for admin files
                if "admin" in file_path.lower():
                    print(f"    Found endpoint: {method} {full_path}")
                    print(f"    Function match: {function_match}")
                    if function_match:
                        print(f"    Function name: {function_match.group(1)}")
                
                if function_match:
                    function_name = function_match.group(1)
                    
                    # Try to find docstring after function definition
                    func_start = decorator_pos + function_match.start()
                    docstring_match = re.search(r'def\s+\w+\s*\([^)]*\):\s*(?:"""(.*?)"""|"""([^"]*)""")?', content[func_start:func_start+200], re.DOTALL)
                    
                    if docstring_match:
                        docstring = docstring_match.group(1) or docstring_match.group(2) or "No description available"
                        docstring = re.sub(r'\s+', ' ', docstring.strip())
                    else:
                        docstring = "No description available"
                    
                    # Determine auth requirement (simplified)
                    auth_required = "User"  # Default assumption
                    if "admin" in full_path.lower():
                        auth_required = "Admin"
                    elif any(word in full_path.lower() for word in ["login", "register", "contact", "health", "test", "debug"]):
                        auth_required = "None"
                    
                    endpoints.append({
                        "method": method,
                        "path": full_path,
                        "auth": auth_required,
                        "description": docstring,
                        "function": function_name,
                        "file": os.path.basename(file_path)
                    })
            except Exception as e:
                print(f"    Error processing endpoint in {file_path}: {e}")
                continue
        
    except Exception as e:
        print(f"⚠️  Error parsing {file_path}: {e}")
    
    return endpoints

def generate_markdown_table(endpoints: List[Dict]) -> str:
    """Generate a markdown table from endpoint data."""
    if not endpoints:
        return "No endpoints found."
    
    # Sort endpoints by path
    endpoints.sort(key=lambda x: x['path'])
    
    table = "| Method | Endpoint | Auth | Description | Function | File |\n"
    table += "|--------|----------|------|-------------|----------|------|\n"
    
    for endpoint in endpoints:
        # Truncate long descriptions
        desc = endpoint['description']
        if len(desc) > 50:
            desc = desc[:47] + "..."
        
        table += f"| {endpoint['method']} | `{endpoint['path']}` | {endpoint['auth']} | {desc} | {endpoint['function']} | {endpoint['file']} |\n"
    
    return table

def main():
    parser = argparse.ArgumentParser(description="Simple FastAPI endpoints scanner")
    parser.add_argument("--scan", action="store_true", help="Scan all API files and show endpoints")
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
                f.write("# FastAPI Endpoints Scan Results\n\n")
                f.write(f"Generated on: {__import__('datetime').datetime.now()}\n\n")
                f.write("## All Endpoints\n\n")
                f.write(generate_markdown_table(all_endpoints))
            print(f"💾 Results saved to {args.output}")
        else:
            print("\n## All Endpoints\n")
            print(generate_markdown_table(all_endpoints))
    
    else:
        print("🔍 Use --scan to scan all API files")
        print("🔍 Use --output <file> to save results to a file")

if __name__ == "__main__":
    main()
