import os

filepath = "src/app/api/schedules/route.ts"
with open(filepath, 'r') as f:
    content = f.read()

replacement = """  const formattedSchedules = schedules.map(s => ({
    ...s,
    schedule_date: s.schedule_date.toISOString().split("T")[0],
    schedule_time: s.schedule_time.toISOString().split("T")[1].substring(0, 5)
  }));
  return NextResponse.json(formattedSchedules);"""

content = content.replace("  return NextResponse.json(schedules);", replacement)

with open(filepath, 'w') as f:
    f.write(content)
