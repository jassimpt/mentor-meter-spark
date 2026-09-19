import os

files = [
    "src/app/api/schedules/[id]/complete/route.ts",
    "src/app/api/schedules/[id]/status/route.ts"
]

replacement = """  return NextResponse.json({
    ...updated,
    schedule_date: updated.schedule_date.toISOString().split("T")[0],
    schedule_time: updated.schedule_time.toISOString().split("T")[1].substring(0, 5)
  });"""

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
            
        content = content.replace("  return NextResponse.json(updated);", replacement)
        
        with open(filepath, 'w') as f:
            f.write(content)
