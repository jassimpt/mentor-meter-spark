import os
import re

files = [
    "src/app/api/schedules/[id]/route.ts",
    "src/app/api/reviews/[id]/route.ts",
    "src/app/api/schedules/[id]/complete/route.ts",
    "src/app/api/schedules/[id]/status/route.ts"
]

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Change type of params from { id: string } to Promise<{ id: string }>
        content = content.replace('{ params }: { params: { id: string } }', '{ params }: { params: Promise<{ id: string }> }')
        
        # Then, we need to extract `id` from `params` before using `params.id`
        # Because replacing every `params.id` would be messy, let's just insert `const resolvedParams = await params;`
        # and replace `params.id` with `resolvedParams.id`.
        # Wait, a better way is to do it properly with regex.
        
        # First, find all handler signatures and add `const { id } = await params;` at the beginning of the block.
        # Handlers start with `export async function METHOD(req: Request, { params }: ... ) {`
        # Followed by:
        # `  const user = await getCurrentUser();`
        
        # Let's just do a string replacement for the first line of the function body.
        content = re.sub(
            r'(export async function \w+\(req: Request, \{ params \}: \{ params: Promise<\{ id: string \}> \}\) \{\n)',
            r'\1  const { id } = await params;\n',
            content
        )
        
        # Now replace all `params.id` with `id`
        content = content.replace('params.id', 'id')
        
        with open(filepath, 'w') as f:
            f.write(content)

