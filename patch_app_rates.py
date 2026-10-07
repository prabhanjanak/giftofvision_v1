with open('src/context/AppContext.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """      // Standardize unit costs across purposes
      let unitCost = isInr ? 3500 : 50;
      if (donor.purpose.includes('Corneal') || donor.purpose.includes('Child') || donor.purpose.includes('Pediatric')) {
        unitCost = isInr ? 7000 : 100;
      } else if (donor.purpose.includes('Food') || donor.purpose.includes('Annadhanam')) {
        unitCost = isInr ? 10000 : 200;
      }"""

new_block = """      // Standardize unit costs across purposes to official master chart
      let unitCost = isInr ? 3000 : 30;
      if (donor.purpose.includes('Corneal') || donor.purpose.includes('Child') || donor.purpose.includes('Pediatric')) {
        unitCost = isInr ? 3000 : 100;
      } else if (donor.purpose.includes('Food') || donor.purpose.includes('Annadhanam')) {
        unitCost = isInr ? 10000 : 200;
      } else if (donor.purpose.includes('Eye Camp')) {
        unitCost = isInr ? 60000 : 1000;
      } else if (donor.purpose.includes('Endow') || donor.purpose.includes('Day')) {
        unitCost = isInr ? 180000 : 3000;
      }"""

if old_block in content:
    content = content.replace(old_block, new_block)
    print("Replaced unitCost in AppContext.tsx autoMatchQueue successfully")
else:
    print("Warning: old_block not found verbatim in AppContext.tsx")

with open('src/context/AppContext.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated AppContext.tsx")
