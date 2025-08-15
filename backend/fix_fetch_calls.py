#!/usr/bin/env python3
"""
Script to add credentials: 'include' to all fetch calls in frontend files
"""
import os
import re

def fix_fetch_calls(file_path):
    """Fix fetch calls in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern to match fetch calls that don't already have credentials: 'include'
        # This is a simplified pattern - might need refinement
        fetch_pattern = r'(fetch\([^,]+,\s*\{[^}]*headers:\s*\{[^}]*\}[^}]*)\}(\s*\))'
        
        def replace_fetch(match):
            fetch_call = match.group(1)
            closing = match.group(2)
            
            # Don't modify if already has credentials
            if 'credentials:' in fetch_call or "credentials'" in fetch_call or 'credentials"' in fetch_call:
                return match.group(0)
            
            # Add credentials: 'include'
            return fetch_call + ",\n        credentials: 'include'\n      }" + closing
        
        content = re.sub(fetch_pattern, replace_fetch, content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {file_path}")
            return True
        else:
            print(f"📄 No changes: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Fix all fetch calls in frontend files"""
    frontend_dir = r'c:\Code\atuomate-web\frontend'
    
    files_to_fix = [
        'components/EditJobModal.tsx',
        'components/CreateRecurringPaymentModal.tsx', 
        'components/CreateJobModal.tsx',
        'components/CreateInvoiceModal.tsx',
        'components/AppointmentModal.tsx',
        'app/customer/page.tsx',
        'app/admin/jobs/[jobId]/page.tsx',
        'app/admin/customers/[customerId]/page.tsx'
    ]
    
    fixed_count = 0
    
    for file_rel_path in files_to_fix:
        file_path = os.path.join(frontend_dir, file_rel_path)
        if os.path.exists(file_path):
            if fix_fetch_calls(file_path):
                fixed_count += 1
        else:
            print(f"❌ File not found: {file_path}")
    
    print(f"\n🎉 Fixed {fixed_count} files")

if __name__ == "__main__":
    main()
