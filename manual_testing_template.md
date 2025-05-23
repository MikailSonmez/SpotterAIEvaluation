# ELD Trip Planner Manual Testing Template

## Website Information
- **URL**: [Website URL]
- **Testing Date**: [Date]
- **Browser Used**: [Browser & Version]
- **Device/Screen Size**: [Desktop/Mobile/Tablet details]

## 1. Required Input Fields

### Current Location Input
- [ ] Field is present and clearly labeled
- [ ] Accepts valid location input
- [ ] Provides autocomplete suggestions
- [ ] Validates input properly
- [ ] Has appropriate placeholder text
- **Notes**:

### Pickup Location Input
- [ ] Field is present and clearly labeled
- [ ] Accepts valid location input
- [ ] Provides autocomplete suggestions
- [ ] Validates input properly
- [ ] Has appropriate placeholder text
- **Notes**:

### Dropoff Location Input
- [ ] Field is present and clearly labeled
- [ ] Accepts valid location input
- [ ] Provides autocomplete suggestions
- [ ] Validates input properly
- [ ] Has appropriate placeholder text
- **Notes**:

### Current Cycle Used (Hours) Input
- [ ] Field is present and clearly labeled
- [ ] Accepts numerical input
- [ ] Validates input properly (e.g., enforces 0-11 hour limit)
- [ ] Has appropriate placeholder text or default value
- **Notes**:

## 2. Route Calculation & Map Output

### Map Display
- [ ] Map is displayed after form submission
- [ ] Map shows full route from current to dropoff location
- [ ] Map includes pickup location as waypoint
- [ ] Map is interactive (zoom, pan)
- [ ] Map displays appropriate level of detail
- **Notes**:

### Route Information
- [ ] Total distance is calculated and displayed
- [ ] Estimated travel time is calculated and displayed
- [ ] Route directions are provided
- [ ] Multiple route options are offered (if applicable)
- **Notes**:

### Rest Stops & Breaks
- [ ] Required rest periods are calculated and displayed
- [ ] Rest locations are suggested on the map
- [ ] Required breaks account for HOS regulations
- [ ] Fueling stops are suggested when routes exceed 1,000 miles
- **Notes**:

## 3. ELD Log Generation

### Daily Log Sheets
- [ ] Daily log sheets are generated
- [ ] Appropriate number of log sheets for trip length
- [ ] Log sheets follow standard ELD format
- [ ] Log sheets display correct date/time information
- **Notes**:

### Hours of Service Representation
- [ ] Different duty statuses are properly represented (Driving, On Duty, Off Duty, Sleeper Berth)
- [ ] Status changes are accurately displayed
- [ ] 11-hour driving limit is correctly represented
- [ ] 14-hour on-duty limit is correctly represented
- [ ] 70-hour/8-day limit is correctly represented
- [ ] Required 10-hour rest periods are shown
- [ ] 30-minute breaks are included when required
- **Notes**:

### Log Visualization
- [ ] Visual graph representation is clear
- [ ] Time scale is accurate
- [ ] Status changes are visually distinct
- [ ] Graph legend is present and clear
- **Notes**:

## 4. UI/UX Evaluation

### Visual Design (1-5 scale)
- **Color Scheme**: [1-5]
- **Typography**: [1-5]
- **Layout/Organization**: [1-5]
- **Visual Hierarchy**: [1-5]
- **Overall Aesthetic**: [1-5]
- **Notes**:

### User Experience (1-5 scale)
- **Ease of Navigation**: [1-5]
- **Form Usability**: [1-5]
- **Clarity of Information**: [1-5]
- **Intuitiveness**: [1-5]
- **Responsiveness**: [1-5]
- **Notes**:

### Responsive Design
- [ ] Works well on desktop
- [ ] Works well on tablet
- [ ] Works well on mobile
- [ ] UI elements resize appropriately
- [ ] No horizontal scrolling on mobile
- **Notes**:

## 5. Bug Testing

### Form Validation
- [ ] Tests with empty fields
- [ ] Tests with invalid location formats
- [ ] Tests with invalid hours input
- [ ] Tests with special characters
- **Issues Found**:

### Functional Testing
- [ ] Tests with very short routes
- [ ] Tests with very long routes
- [ ] Tests with international routes (if applicable)
- [ ] Tests with high hours used
- [ ] Tests with low hours used
- **Issues Found**:

### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- **Issues Found**:

### Console Errors
- **Number of console errors**: [Count]
- **Types of errors**: [Description]
- **Impact on functionality**: [Description]

## 6. Overall Assessment

### Strengths
- 
- 
- 

### Weaknesses
- 
- 
- 

### Bugs & Issues
- 
- 
- 

### Improvement Suggestions
- 
- 
- 

## 7. Final Scores (1-5 scale)

| Category | Score | Justification |
|----------|-------|---------------|
| ELD Accuracy |  |  |
| Required Features |  |  |
| UI Aesthetics |  |  |
| UX Intuitiveness |  |  |
| Bugs |  |  |
| **OVERALL** |  |  |
