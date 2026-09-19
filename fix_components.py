import os
import re

def fix_appsidebar():
    filepath = 'src/components/AppSidebar.tsx'
    with open(filepath, 'r') as f:
        content = f.read()

    # Add use client
    if '"use client"' not in content:
        content = '"use client";\n\n' + content

    content = content.replace('import { NavLink, useNavigate } from "react-router-dom";', 'import Link from "next/link";\nimport { useRouter, usePathname } from "next/navigation";')
    content = content.replace('const navigate = useNavigate();', 'const router = useRouter();\n  const pathname = usePathname();')
    
    # Replace NavLink with Next.js Link
    # Next.js link doesn't provide {isActive} function like React Router's NavLink.
    # We must manually check pathname.
    # Replace: 
    # <NavLink key={item.title} to={item.url}>
    #   {({ isActive }) => <NavItem item={item} isActive={isActive} />}
    # </NavLink>
    # With:
    # <Link key={item.title} href={item.url}>
    #   <NavItem item={item} isActive={pathname === item.url} />
    # </Link>
    
    content = re.sub(
        r'<NavLink key={item.title} to={item.url}>\s*\{\(\{ isActive \}\) => <NavItem item={item} isActive={isActive} />\}\s*</NavLink>',
        '<Link key={item.title} href={item.url}>\n              <NavItem item={item} isActive={pathname === item.url} />\n            </Link>',
        content
    )

    with open(filepath, 'w') as f:
        f.write(content)

def fix_mobilebottomnav():
    filepath = 'src/components/MobileBottomNav.tsx'
    with open(filepath, 'r') as f:
        content = f.read()

    if '"use client"' not in content:
        content = '"use client";\n\n' + content

    content = content.replace('import { NavLink, useLocation } from "react-router-dom";', 'import Link from "next/link";\nimport { usePathname } from "next/navigation";')
    content = content.replace('const location = useLocation();', 'const pathname = usePathname();')
    content = content.replace('location.pathname', 'pathname')
    
    # Replace <NavLink to={item.url} with <Link href={item.url}
    content = content.replace('<NavLink', '<Link')
    content = content.replace('</NavLink>', '</Link>')
    content = content.replace('to={item.url}', 'href={item.url}')

    with open(filepath, 'w') as f:
        f.write(content)

fix_appsidebar()
fix_mobilebottomnav()
