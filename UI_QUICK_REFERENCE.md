# Quick Reference: UI Adjustment Locations & Code Snippets

## 📍 File: `src/components/uploads/UploadCenter.jsx`

---

## 🎛️ ADJUSTMENT #1: Mode Selection Buttons (Lines 90-97)

### Current (Responsive)
```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  width: '100%',
  justifyContent: 'flex-start'
}}>
```

### To Limit Button Width on Very Large Screens:
```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  width: 'clamp(200px, 100%, 500px)',  // Limits max width to 500px
  justifyContent: 'flex-start'
}}>
```

### To Make Buttons Stack on Mobile:
```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
  gap: '16px',
  width: '100%',
  justifyContent: 'flex-start'
}}>
```

---

## 📤 ADJUSTMENT #2: Upload Box (Lines 141-148)

### Current (Full Width)
```jsx
<div style={{
  background: '#121d2f',
  borderRadius: '12px',
  padding: 0,
  width: '100%',
  border: 'none',
  opacity: !hasProject ? 0.5 : 1,
  pointerEvents: !hasProject ? 'none' : 'auto',
  boxSizing: 'border-box'
}}>
```

### To Limit Upload Box Width:
```jsx
<div style={{
  background: '#121d2f',
  borderRadius: '12px',
  padding: 0,
  width: 'min(100%, 900px)',  // Never exceeds 900px
  margin: '0 auto',  // Center it
  border: 'none',
  opacity: !hasProject ? 0.5 : 1,
  pointerEvents: !hasProject ? 'none' : 'auto',
  boxSizing: 'border-box'
}}>
```

---

## 📊 ADJUSTMENT #3: Metric Cards (Lines 268-271)

### Current (3 columns on large screens)
```jsx
<div style={{
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '24px'
}}>
```

### For 2 Columns on Large Screens:
```jsx
gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))'
```

### For 4 Columns on Large Screens:
```jsx
gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
```

### For Fixed 3 Columns (No Responsiveness):
```jsx
gridTemplateColumns: 'repeat(3, 1fr)'
```

### For Mobile-First Responsive:
```jsx
gridTemplateColumns: window.innerWidth < 640 
  ? '1fr' 
  : window.innerWidth < 1024 
    ? 'repeat(2, 1fr)' 
    : 'repeat(3, 1fr)'
```

---

## 📈 ADJUSTMENT #4: Analysis Summary Section (Lines 283-286)

### Current (2-column on large, 1 on small)
```jsx
<div style={{
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '24px'
}}>
```

### To Always Show 2 Columns:
```jsx
gridTemplateColumns: '2fr 1fr'  // Back to fixed layout
```

### To Make Summary Box Take More Space:
```jsx
gridTemplateColumns: '3fr 1fr'  // 3x wider than right column
```

### To Make Visualization Hub Take More Space:
```jsx
gridTemplateColumns: '2fr 1.5fr'  // Slightly wider than equal
```

---

## 🎨 ADJUSTMENT #5: Overall Padding/Spacing

### Location: Line 50 (Main Container)

### Current
```jsx
padding: '24px 32px 32px'
// top: 24px, right: 32px, bottom: 32px, left: 32px
```

### For Narrower Padding (Mobile-friendly):
```jsx
padding: '24px 16px 32px'
// Reduces horizontal padding from 32px to 16px
```

### For Maximum Spacing:
```jsx
padding: '32px 64px 48px'
// Increases all padding significantly
```

### For Responsive Padding:
```jsx
padding: 'clamp(16px, 5vw, 32px) clamp(16px, 10vw, 64px)'
// Scales automatically based on viewport width
```

---

## 🎯 ADJUSTMENT #6: Content Alignment (Line 53)

### Current (Stretches to full width)
```jsx
alignItems: 'stretch'
```

### To Center Content:
```jsx
alignItems: 'center'
// Returns to old centered behavior
// You'll need to add maxWidth constraints back if you want limited width
```

### To Align to Left:
```jsx
alignItems: 'flex-start'
```

### To Align to Right:
```jsx
alignItems: 'flex-end'
```

---

## 🔧 ADVANCED: Completely Custom Responsive Behavior

Replace the main container with this for more control:

```jsx
<div style={{
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  padding: 'clamp(16px, 5vw, 32px)',
  gap: '16px',
  overflowY: 'auto',
  background: '#0b1424',
  minWidth: 0,
  // Add media query behavior:
  maxWidth: window.innerWidth < 1200 ? '100%' : '90vw',
  margin: '0 auto'
}}>
```

---

## 📱 Breakpoint Reference

```
Mobile:     < 640px   → 1 column layouts
Tablet:     640-1024px → 2 column layouts
Desktop:    > 1024px  → 3+ column layouts
Ultra-wide: > 1920px  → Consider max-width to avoid text line length issues
```

---

## ✨ Copy-Paste Quick Solutions

### Solution 1: Limit Max Width (Like Before)
```jsx
const containerStyle = {
  width: 'clamp(100%, calc(100% - 100px), 1200px)',
  margin: '0 auto'
};
```

### Solution 2: Responsive Grid (Recommended)
```jsx
gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
```

### Solution 3: Mobile-First Grid
```jsx
gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)'
```

### Solution 4: Full-Width with Gutters
```jsx
const containerStyle = {
  width: '100%',
  maxWidth: 'calc(100vw - 32px)',  // Leaves 16px gutter on each side
  padding: '0 16px'
};
```

---

## 🔄 How to Test Changes Locally

1. Open `src/components/uploads/UploadCenter.jsx`
2. Find the line number from this guide
3. Make the change
4. Save the file (Ctrl+S)
5. Browser should hot-reload automatically
6. Test on different screen sizes using browser DevTools (F12)

---

## ⚠️ Common Mistakes to Avoid

❌ **Don't:** Use both `maxWidth` and `width: 100%` without care
```jsx
width: '100%',
maxWidth: '800px'  // This works but can be confusing
```

✅ **Do:** Use `min()` or `clamp()` instead
```jsx
width: 'min(100%, 800px)'  // Clearer intent
```

---

❌ **Don't:** Forget `minWidth: 0` on flex children
```jsx
display: 'flex',
flex: 1
// Without minWidth: 0, children might overflow
```

✅ **Do:** Always add it
```jsx
display: 'flex',
flex: 1,
minWidth: 0
```

---

❌ **Don't:** Use fixed pixel values for responsive layouts
```jsx
width: '1000px'  // Not responsive!
```

✅ **Do:** Use flexible units
```jsx
width: 'min(100%, 1000px)'  // Responsive!
width: 'clamp(320px, 100vw, 1000px)'  // Even better!
```
