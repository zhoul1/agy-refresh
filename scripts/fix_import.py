path = "tests/database.test.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace(
    "resetDb, saveImageGenQuota",
    "resetDb, getDb, saveImageGenQuota"
)
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("OK")
