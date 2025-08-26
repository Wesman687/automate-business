#!/usr/bin/env python3
"""
Simplified FastAPI endpoint scanner that focuses on finding endpoints
without complex function detection.
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
        endpoint_pattern = r'@router\.(get|post|put|delete|patch)\s*\(\s*["\']([^"\']+)["\']'
        
        matches = re.finditer(endpoint_pattern, content)
        
        for match in matches:
            method = match.group(1).upper()
            path = match.group(2)
            
            # Combine prefix and path
            full_path = router_prefix + path if router_prefix and path else router_prefix or path
            
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
                "description": "Endpoint found",  # Simplified description
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
    
    table = "| Method | Endpoint | Auth | File |\n"
    table += "|--------|----------|------|------|\n"
    
    for endpoint in endpoints:
        table += f"| {endpoint['method']} | `{endpoint['path']}` | {endpoint['auth']} | {endpoint['file']} |\n"
    
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
