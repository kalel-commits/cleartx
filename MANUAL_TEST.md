# Manual Testing Guide for ICICI Default Issue Fix

## Issue Description
Previously, when users didn't have bank accounts set up and tried to add transactions for different banks, the system would default to assigning them to ICICI (or the first account) instead of the correct bank.

## Test Scenarios

### Scenario 1: No accounts exist, add HDFC transaction
**Steps:**
1. Clear browser storage (Application > Storage > Clear All)
2. Go to Transactions page
3. Try to add transaction with:
   - Amount: 100
   - Note: "Payment to merchant via user@okhdfc"
4. Click "Add Transaction"

**Expected Result:**
- ✅ Creates "Unlinked - HDFC" placeholder account
- ✅ Transaction assigned to HDFC placeholder
- ✅ Success message shows placeholder created

**Previous Behavior:**
- ❌ Would fail or assign to wrong bank

### Scenario 2: ICICI exists first, add AXIS transaction
**Steps:**
1. Go to Accounts page
2. Add account: "ICICI Savings", "****1234"
3. Go to Transactions page
4. Add transaction with:
   - Amount: 200
   - Note: "UPI payment via user@okaxis"
5. Click "Add Transaction"

**Expected Result:**
- ✅ Creates "Unlinked - AXIS" placeholder account
- ✅ Transaction assigned to AXIS placeholder (NOT ICICI)
- ✅ ICICI account remains untouched

**Previous Behavior:**
- ❌ Would assign to ICICI by default

### Scenario 3: Existing account matches bank
**Steps:**
1. Add account: "HDFC Current", "****5678"
2. Add transaction with:
   - Amount: 300
   - Note: "Payment via user@okhdfc with ****5678"
5. Click "Add Transaction"

**Expected Result:**
- ✅ Transaction assigned to existing HDFC account
- ✅ No placeholder created
- ✅ Works as before

### Scenario 4: Multiple matching accounts
**Steps:**
1. Add two HDFC accounts: "HDFC Savings ****1111" and "HDFC Current ****2222"
2. Add transaction with:
   - Amount: 400
   - Note: "Payment via user@okhdfc"
3. Click "Add Transaction"

**Expected Result:**
- ⚠️ Shows disambiguation message
- ⚠️ Asks user to add ****last4 to note

## Verification Checklist

- [ ] No automatic assignment to first account
- [ ] Placeholder accounts created for unknown banks
- [ ] Existing accounts matched correctly
- [ ] No silent wrong assignments
- [ ] Clear user feedback provided
- [ ] Form works without any existing accounts
- [ ] Auto-detection works properly

## Success Criteria
✅ **FIXED** - Users no longer experience silent wrong bank assignments
✅ **IMPROVED** - System creates helpful placeholders for unmatched banks
✅ **MAINTAINED** - Existing functionality works as before
