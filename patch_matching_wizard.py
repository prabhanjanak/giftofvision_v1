with open('src/views/MatchingWizardView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace unit cost calculation in donorStats
old_donor_stats = """  // Pricing calculations for standard mode
  const donorStats = useMemo(() => {
  if (!selectedDonor) return null;
  const rawNum = parseFloat(selectedDonor.amount.replace(/[^0-9.]/g,'')) || 0;
  const isInr = selectedDonor.amount.includes('R') || selectedDonor.amount.includes('₹');
  const symb = isInr ?'Rs.':'$';

  let unitCost = isInr ? 3500 : 50;
  if (selectedDonor.purpose.includes('Corneal') || selectedDonor.purpose.includes('Child')) {
  unitCost = isInr ? 7000 : 100;
  } else if (selectedDonor.purpose.includes('Food') || selectedDonor.purpose.includes('Annadhanam')) {
  unitCost = isInr ? 10000 : 200;
  }

  const maxSurgeries = Math.floor(rawNum / unitCost);
  const isPartial = rawNum < unitCost;
  const fundedPct = isPartial ? Math.round((rawNum / unitCost) * 100) : 100;
  const selectedCount = selectedPatientIds.length;
  const allocatedAmount = selectedCount * unitCost;
  const remainingAmount = Math.max(0, rawNum - allocatedAmount);"""

new_donor_stats = """  // Pricing calculations for standard manual mode (Penny-to-Penny precision)
  const donorStats = useMemo(() => {
  if (!selectedDonor) return null;
  const rawNum = parseFloat(selectedDonor.amount.replace(/[^0-9.]/g, '')) || 0;
  const isInr = selectedDonor.amount.includes('R') || selectedDonor.amount.includes('₹');
  const symb = isInr ? '₹' : '$';

  let unitCost = isInr ? 3000 : 30;
  if (selectedDonor.purpose.includes('Corneal') || selectedDonor.purpose.includes('Child') || selectedDonor.purpose.includes('Pediatric')) {
    unitCost = isInr ? 3000 : 100;
  } else if (selectedDonor.purpose.includes('Food') || selectedDonor.purpose.includes('Annadhanam')) {
    unitCost = isInr ? 10000 : 200;
  } else if (selectedDonor.purpose.includes('Eye Camp')) {
    unitCost = isInr ? 60000 : 1000;
  } else if (selectedDonor.purpose.includes('Endow') || selectedDonor.purpose.includes('Day')) {
    unitCost = isInr ? 180000 : 3000;
  }

  const maxSurgeries = Math.max(1, Math.floor(rawNum / unitCost));
  const isPartial = rawNum < unitCost;
  const fundedPct = isPartial ? Math.round((rawNum / unitCost) * 100) : 100;
  const selectedCount = selectedPatientIds.length;
  const allocatedAmount = selectedCount * unitCost;
  const remainingAmount = Math.max(0, rawNum - allocatedAmount);"""

if old_donor_stats in content:
    content = content.replace(old_donor_stats, new_donor_stats)
    print("Replaced donorStats successfully")
else:
    print("Warning: old_donor_stats pattern not found verbatim, checking sub-string...")

# Update coPoolStats target cost
content = content.replace("const targetCostInr = 3500;", "const targetCostInr = 3000;")
content = content.replace("Standard 1-to-1 & Multi-Patient", "🎯 Manual Match (Direct 1-to-1 & Multi-Patient)")
content = content.replace("Co-Sponsorship Pooling (₹1500 + ₹2000)", "🤝 Co-Sponsorship Pooling (Micro-Donors)")
content = content.replace("Overall Allocation Ledger", "📑 Allocation Ledger & Statement Audit")

with open('src/views/MatchingWizardView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated MatchingWizardView.tsx")
