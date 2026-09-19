import os
import re

def migrate_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # 1. Add "use client"; if not present and if it's a page component using client hooks
    if '"use client"' not in content and "'use client'" not in content:
        if 'useState' in content or 'useEffect' in content or 'useRouter' in content or 'useNavigate' in content or 'react-hook-form' in content:
            content = '"use client";\n\n' + content

    # 2. Replace useNavigate import
    content = re.sub(r'import\s+{\s*useNavigate\s*}\s+from\s+[\'"]react-router-dom[\'"];?', 'import { useRouter } from "next/navigation";', content)
    
    # 3. Replace Link import (if mixed with others, it gets tricky, but let's assume it might be on its own or with others)
    # If it's just import { Link } from "react-router-dom"
    content = re.sub(r'import\s+{\s*Link\s*}\s+from\s+[\'"]react-router-dom[\'"];?', 'import Link from "next/link";', content)
    # If it's mixed like import { useNavigate, Link } from ...
    content = re.sub(r'import\s+{\s*useNavigate\s*,\s*Link\s*}\s+from\s+[\'"]react-router-dom[\'"];?', 'import { useRouter } from "next/navigation";\nimport Link from "next/link";', content)

    # 4. Replace useNavigate() usage
    content = content.replace('const navigate = useNavigate();', 'const router = useRouter();')
    content = content.replace('navigate(', 'router.push(')

    # 5. DashboardLayout and ProtectedRoute might be used in App.tsx but now they need to be imported in the page, OR we can wrap the page content in them.
    # Actually, they are already wrapped in App.tsx. The page components themselves just export the content. We need to manually wrap the page components in Next.js layouts, or wrap them inside the page.tsx files.
    # Let's wrap them inside the page.tsx files for simplicity.
    if 'Dashboard' in filepath or 'Reviews' in filepath or 'Schedules' in filepath:
        if 'ProtectedRoute' not in content:
            content = 'import ProtectedRoute from "@/components/ProtectedRoute";\nimport DashboardLayout from "@/components/DashboardLayout";\n' + content
            # We'll need to wrap the default export. We will do this manually for those 3 pages.

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Migrated {filepath}")

for root, _, files in os.walk('src/app'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            migrate_file(os.path.join(root, file))

