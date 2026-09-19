import os

files = [
    "src/app/dashboard/page.tsx",
    "src/app/reviews/page.tsx",
    "src/app/schedules/page.tsx",
    "src/components/PWAInstallButton.tsx"
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    if '"use client"' not in content and "'use client'" not in content:
        content = '"use client";\n\n' + content
        
    with open(file, 'w') as f:
        f.write(content)
