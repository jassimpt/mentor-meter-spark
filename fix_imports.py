import os

files = [
    "src/app/dashboard/page.tsx",
    "src/app/reviews/page.tsx",
    "src/app/schedules/page.tsx"
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    if 'import ProtectedRoute' not in content:
        content = 'import ProtectedRoute from "@/components/ProtectedRoute";\n' + content
    if 'import DashboardLayout' not in content:
        content = 'import DashboardLayout from "@/components/DashboardLayout";\n' + content
        
    with open(file, 'w') as f:
        f.write(content)
