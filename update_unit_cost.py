with open('src/views/MatchingWizardView.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "let unitCost = isInr ? 3500 : 50;" in line:
        new_block = [
            "    let unitCost = isInr ? 3000 : 30;\n",
            "    if (selectedDonor.purpose.includes('Corneal') || selectedDonor.purpose.includes('Child') || selectedDonor.purpose.includes('Pediatric')) {\n",
            "      unitCost = isInr ? 3000 : 100;\n",
            "    } else if (selectedDonor.purpose.includes('Food') || selectedDonor.purpose.includes('Annadhanam')) {\n",
            "      unitCost = isInr ? 10000 : 200;\n",
            "    } else if (selectedDonor.purpose.includes('Eye Camp')) {\n",
            "      unitCost = isInr ? 60000 : 1000;\n",
            "    } else if (selectedDonor.purpose.includes('Endow') || selectedDonor.purpose.includes('Day')) {\n",
            "      unitCost = isInr ? 180000 : 3000;\n",
            "    }\n"
        ]
        # replace the 6 lines starting from line i
        lines = lines[:i] + new_block + lines[i+6:]
        break

with open('src/views/MatchingWizardView.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Updated unitCost in MatchingWizardView.tsx")
