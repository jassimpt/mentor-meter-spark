import os

def wrap_page(filepath, component_name):
    with open(filepath, 'r') as f:
        content = f.read()

    if "export default function Page()" in content or "export default Page" in content:
        return

    content = content.replace(f"export default {component_name};", "")
    content += f"""
export default function Page() {{
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <{component_name} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}}
"""
    with open(filepath, 'w') as f:
        f.write(content)

wrap_page('src/app/dashboard/page.tsx', 'Dashboard')
wrap_page('src/app/reviews/page.tsx', 'Reviews')
wrap_page('src/app/schedules/page.tsx', 'Schedules')
