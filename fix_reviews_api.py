import os

filepath = "src/app/api/reviews/route.ts"
if os.path.exists(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    replacement = """  const formattedReviews = reviews.map(r => ({
    ...r,
    review_date: r.review_date.toISOString().split("T")[0]
  }));
  return NextResponse.json(formattedReviews);"""
  
    content = content.replace("  return NextResponse.json(reviews);", replacement)
    
    with open(filepath, 'w') as f:
        f.write(content)

filepath_id = "src/app/api/reviews/[id]/route.ts"
if os.path.exists(filepath_id):
    with open(filepath_id, 'r') as f:
        content_id = f.read()
        
    replacement_id = """  return NextResponse.json({
    ...updated,
    review_date: updated.review_date.toISOString().split("T")[0]
  });"""
  
    content_id = content_id.replace("  return NextResponse.json(updated);", replacement_id)
    
    with open(filepath_id, 'w') as f:
        f.write(content_id)
