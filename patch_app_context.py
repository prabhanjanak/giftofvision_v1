with open('src/context/AppContext.tsx', 'r') as f:
    text = f.read()

# 1. Update interface
target1 = "  // DPDP Act (2023) Healthcare Data Protection & Patient Safety"
if target1 in text:
    replacement1 = """  // Dual Currency (USD / INR) Architecture & Simulator
  globalCurrency: 'USD' | 'INR';
  setGlobalCurrency: (c: 'USD' | 'INR') => void;
  toggleGlobalCurrency: () => void;
  isSimulatorOpen: boolean;
  setIsSimulatorOpen: (open: boolean) => void;

  // DPDP Act (2023) Healthcare Data Protection & Patient Safety"""
    text = text.replace(target1, replacement1, 1)

# 2. Update storage version
text = text.replace("STORAGE_VERSION = 'gov_v5_clean_fresh_live'", "STORAGE_VERSION = 'gov_v7_prod_stable_dual_fx'")

# 3. Add state in provider
target2 = "  const [selectedDonorDetails, setSelectedDonorDetails] = useState<Donation | null>(null);"
if target2 in text:
    replacement2 = """  const [globalCurrency, setGlobalCurrency] = useState<'USD' | 'INR'>(() => {
    return (localStorage.getItem(`${STORAGE_VERSION}_currency`) as 'USD' | 'INR') || 'USD';
  });
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  const toggleGlobalCurrency = () => {
    setGlobalCurrency((prev) => {
      const next = prev === 'USD' ? 'INR' : 'USD';
      localStorage.setItem(`${STORAGE_VERSION}_currency`, next);
      showToast(`Switched display currency to ${next === 'USD' ? 'USD ($)' : 'INR (₹)'}`, 'info');
      return next;
    });
  };

  const [selectedDonorDetails, setSelectedDonorDetails] = useState<Donation | null>(null);"""
    text = text.replace(target2, replacement2, 1)

# 4. Add to Provider value
target3 = "        isDpdpShieldActive,"
if target3 in text:
    replacement3 = """        globalCurrency,
        setGlobalCurrency,
        toggleGlobalCurrency,
        isSimulatorOpen,
        setIsSimulatorOpen,
        isDpdpShieldActive,"""
    text = text.replace(target3, replacement3, 1)

with open('src/context/AppContext.tsx', 'w') as f:
    f.write(text)

print("Updated AppContext.tsx successfully!")
