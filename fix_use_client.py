import os
import re

files = [
    "src/app/dashboard/page.tsx",
    "src/app/reviews/page.tsx",
    "src/app/schedules/page.tsx"
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Remove all occurrences of "use client";
    content = re.sub(r'"use client";\n+', '', content)
    
    # Prepend it to the very top
    content = '"use client";\n\n' + content
        
    with open(file, 'w') as f:
        f.write(content)
