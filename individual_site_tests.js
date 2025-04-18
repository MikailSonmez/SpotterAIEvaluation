// Individual Site Tests for ELD Trip Planning Applications
const { test, expect } = require('@playwright/test');

// Test specific sites in detail
// These tests are examples of how to customize testing for specific site structures

// Test Site 1: Spotter Lavandesn
test.describe('Spotter Lavandesn Tests', () => {
  test('complete trip planning flow', async ({ page }) => {
    await page.goto('https://spotter.lavandesn.com/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'spotter_lavandesn_initial.png', fullPage: true });
    
    // Fill out the form
    await page.fill('input[placeholder*="Current Location"], input[name="currentLocation"]', 'Chicago, IL');
    await page.waitForTimeout(1000); // Wait for autocomplete
    await page.keyboard.press('Tab');
    
    await page.fill('input[placeholder*="Pickup"], input[name="pickupLocation"]', 'Indianapolis, IN');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Tab');
    
    await page.fill('input[placeholder*="Dropoff"], input[name="dropoffLocation"]', 'Cincinnati, OH');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Tab');
    
    await page.fill('input[placeholder*="Hour"], input[name="currentHours"], input[type="number"]', '4');
    
    // Submit the form
    await page.click('button[type="submit"], button:has-text("Plan Trip")');
    
    // Wait for results
    await page.waitForTimeout(5000);
    
    // Take screenshot of results
    await page.screenshot({ path: 'spotter_lavandesn_results.png', fullPage: true });
    
    // Check for map
    const mapExists = await page.isVisible('.map, #map, [class*="map"], canvas, svg');
    expect(mapExists).toBeTruthy();
    
    // Check for ELD logs
    const eldLogsExist = await page.isVisible('.eld, #eldLogs, [class*="log"], svg, canvas, table');
    expect(eldLogsExist).toBeTruthy();
    
    // Check for specific elements that should be present in results
    const hasRoute = await page.isVisible('text=/Route|Distance|Duration|ETA/i');
    expect(hasRoute).toBeTruthy();
    
    const hasBreaks = await page.isVisible('text=/Break|Rest|Stop/i');
    expect(hasBreaks).toBeTruthy();
  });
  
  test('validates form input', async ({ page }) => {
    await page.goto('https://spotter.lavandesn.com/');
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    await page.click('button[type="submit"], button:has-text("Plan Trip")');
    
    // Check for validation messages
    const hasValidationError = await page.isVisible('text=/required|fill|enter/i, .error, [aria-invalid="true"]');
    expect(hasValidationError).toBeTruthy();
    
    // Try an invalid hours value
    await page.fill('input[placeholder*="Hour"], input[name="currentHours"], input[type="number"]', '12');
    await page.click('button[type="submit"], button:has-text("Plan Trip")');
    
    // Check for specific hours validation
    const hasHoursError = await page.isVisible('text=/valid|maximum|exceeded/i, .error, [aria-invalid="true"]');
    expect(hasHoursError).toBeTruthy();
  });
});

// Test Site 2: Driver Logbook
test.describe('Driver Logbook Tests', () => {
  test('complete trip planning flow', async ({ page }) => {
    await page.goto('https://driver-logbook.vercel.app/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'driver_logbook_initial.png', fullPage: true });
    
    // Look for and fill out the form
    await page.fill('input[placeholder*="start"], input[placeholder*="current"], input[name*="start"], input[name*="current"]', 'Chicago, IL');
    await page.waitForTimeout(1000);
    
    await page.fill('input[placeholder*="pickup"], input[name*="pickup"]', 'Indianapolis, IN');
    await page.waitForTimeout(1000);
    
    await page.fill('input[placeholder*="drop"], input[placeholder*="destination"], input[name*="drop"], input[name*="destination"]', 'Cincinnati, OH');
    await page.waitForTimeout(1000);
    
    await page.fill('input[type="number"], input[placeholder*="hour"], input[name*="hour"], input[name*="cycle"]', '4');
    
    // Submit the form
    await page.click('button[type="submit"], button:has-text("Calculate"), button:has-text("Generate")');
    
    // Wait for results
    await page.waitForTimeout(5000);
    
    // Take screenshot of results
    await page.screenshot({ path: 'driver_logbook_results.png', fullPage: true });
    
    // Check for expected result elements
    const hasMap = await page.isVisible('.map, #map, [class*="map"], canvas, svg, iframe[src*="map"]');
    expect(hasMap).toBeTruthy();
    
    // Check for ELD logs (driver logbook should definitely have these)
    const hasLogs = await page.isVisible('.log, #logs, [class*="log"], table, svg');
    expect(hasLogs).toBeTruthy();
    
    // Look for specific ELD elements such as duty status
    const hasDutyStatus = await page.isVisible('text=/duty|status|driving|on duty|off duty|sleeper/i');
    expect(hasDutyStatus).toBeTruthy();
  });
  
  test('evaluates UI design', async ({ page }) => {
    await page.goto('https://driver-logbook.vercel.app/');
    await page.waitForLoadState('networkidle');
    
    // Check responsive design
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'driver_logbook_mobile.png' });
    
    // Check if the layout is responsive (no horizontal scrollbar)
    const hasHorizontalScrollbar = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScrollbar).toBeFalsy();
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'driver_logbook_tablet.png' });
    
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'driver_logbook_desktop.png' });
    
    // Check for consistent styling
    const hasConsistentStyling = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      if (buttons.length < 2) return true;
      
      const firstButtonStyle = getComputedStyle(buttons[0]);
      return buttons.every(btn => {
        const style = getComputedStyle(btn);
        return style.fontFamily === firstButtonStyle.fontFamily;
      });
    });
    expect(hasConsistentStyling).toBeTruthy();
  });
});

// Test Site 3: ELD Generator
test.describe('ELD Generator Tests', () => {
  test('complete trip planning flow', async ({ page }) => {
    await page.goto('https://eld-generator.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'eld_generator_initial.png', fullPage: true });
    
    // Look for and interact with form elements
    // This site might have a different structure, so we'll try different approaches
    
    // Try direct field identifiers first
    try {
      await page.fill('input#currentLocation, input[name="currentLocation"]', 'Chicago, IL');
      await page.fill('input#pickupLocation, input[name="pickupLocation"]', 'Indianapolis, IN');
      await page.fill('input#dropoffLocation, input[name="dropoffLocation"]', 'Cincinnati, OH');
      await page.fill('input#cycleHours, input[name="cycleHours"]', '4');
    } catch (e) {
      // If the above fails, try generic approach
      const inputFields = await page.$$('input[type="text"]');
      if (inputFields.length >= 3) {
        await inputFields[0].fill('Chicago, IL');
        await inputFields[1].fill('Indianapolis, IN');
        await inputFields[2].fill('Cincinnati, OH');
      }
      
      const numberFields = await page.$$('input[type="number"]');
      if (numberFields.length > 0) {
        await numberFields[0].fill('4');
      }
    }
    
    // Find and click submit button
    try {
      await page.click('button[type="submit"], input[type="submit"], button:has-text("Generate"), button:has-text("Calculate")');
    } catch (e) {
      // If specific button selectors fail, try any button
      const buttons = await page.$$('button');
      if (buttons.length > 0) {
        await buttons[0].click();
      }
    }
    
    // Wait for results
    await page.waitForTimeout(5000);
    
    // Take screenshot of results
    await page.screenshot({ path: 'eld_generator_results.png', fullPage: true });
    
    // Check for expected output elements
    const pageContent = await page.content();
    
    // Look for indications of ELD in the content
    const hasEldContent = pageContent.includes('ELD') || 
                          pageContent.includes('Electronic Log') || 
                          pageContent.includes('Driver Log') || 
                          pageContent.includes('HOS') || 
                          pageContent.includes('Hours of Service');
    
    // Save this result for evaluation
    console.log(`ELD Generator has ELD content: ${hasEldContent}`);
    
    // Look for map indicators
    const hasMapContent = await page.isVisible('.map, #map, [class*="map"], canvas, svg, iframe[src*="map"]');
    console.log(`ELD Generator has map: ${hasMapContent}`);
  });
  
  test('test edge case - high hours', async ({ page }) => {
    await page.goto('https://eld-generator.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Try to input high hours value
    try {
      await page.fill('input#cycleHours, input[name="cycleHours"]', '10');
    } catch (e) {
      const numberFields = await page.$$('input[type="number"]');
      if (numberFields.length > 0) {
        await numberFields[0].fill('10');
      }
    }
    
    // Fill other fields
    const inputFields = await page.$$('input[type="text"]');
    if (inputFields.length >= 3) {
      await inputFields[0].fill('Miami, FL');
      await inputFields[1].fill('Atlanta, GA');
      await inputFields[2].fill('Nashville, TN');
    }
    
    // Submit form
    try {
      await page.click('button[type="submit"], input[type="submit"], button:has-text("Generate"), button:has-text("Calculate")');
    } catch (e) {
      const buttons = await page.$$('button');
      if (buttons.length > 0) {
        await buttons[0].click();
      }
    }
    
    // Wait for results
    await page.waitForTimeout(5000);
    
    // Take screenshot of results
    await page.screenshot({ path: 'eld_generator_high_hours.png', fullPage: true });
    
    // Check if the application handles high hours properly
    // This would ideally look for indicators that the app recognized limited remaining drive time
    const pageContent = await page.content();
    const handlesHighHours = pageContent.includes('rest') || 
                             pageContent.includes('break') || 
                             pageContent.includes('limit') || 
                             pageContent.includes('exceeded') || 
                             pageContent.includes('remaining');
    
    console.log(`ELD Generator handles high hours appropriately: ${handlesHighHours}`);
  });
});

// Test Site 4: Trip Planner Frontend Tau
test.describe('Trip Planner Frontend Tau Tests', () => {
  test('complete trip planning flow', async ({ page }) => {
    await page.goto('https://trip-planner-frontend-tau.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'trip_planner_tau_initial.png', fullPage: true });
    
    // Fill form fields - try different selector strategies
    try {
      // Try explicit selectors first
      await page.fill('[placeholder*="current"], [name*="current"], [id*="current"]', 'Chicago, IL');
      await page.fill('[placeholder*="pickup"], [name*="pickup"], [id*="pickup"]', 'Indianapolis, IN');
      await page.fill('[placeholder*="drop"], [placeholder*="destination"], [name*="drop"], [id*="drop"]', 'Cincinnati, OH');
      await page.fill('[type="number"], [placeholder*="hour"], [name*="hour"], [name*="cycle"]', '4');
    } catch (e) {
      // Fall back to positional approach
      const textInputs = await page.$$('input[type="text"]');
      if (textInputs.length >= 3) {
        await textInputs[0].fill('Chicago, IL');
        await textInputs[1].fill('Indianapolis, IN');
        await textInputs[2].fill('Cincinnati, OH');
      }
      
      const numberInputs = await page.$$('input[type="number"]');
      if (numberInputs.length > 0) {
        await numberInputs[0].fill('4');
      }
    }
    
    // Wait for any location suggestions and select if needed
    await page.waitForTimeout(1000);
    
    // Find and click submit
    await page.click('button[type="submit"], input[type="submit"], button:has-text("Plan"), button:has-text("Calculate"), button:has-text("Submit"), button:has-text("Generate")').catch(() => {
      // If explicit selectors fail, try any button
      page.$$eval('button', buttons => {
        if (buttons.length > 0) buttons[0].click();
      });
    });
    
    // Wait for results
    await page.waitForTimeout(5000);
    
    // Take screenshot of results
    await page.screenshot({ path: 'trip_planner_tau_results.png', fullPage: true });
    
    // Check map presence
    const hasMap = await page.isVisible('.map, #map, [class*="map"], canvas, svg, iframe[src*="map"], iframe[src*="google"]');
    console.log(`Trip Planner Tau has map: ${hasMap}`);
    
    // Check for ELD logs
    const hasEld = await page.isVisible('.eld, #eld, [class*="log"], .log, #log, table, svg, canvas');
    console.log(`Trip Planner Tau has ELD logs: ${hasEld}`);
    
    // Check for route information
    const hasRouteInfo = await page.isVisible('text=/distance|duration|time|hour|mile/i');
    console.log(`Trip Planner Tau has route info: ${hasRouteInfo}`);
  });
  
  test('check for console errors', async ({ page }) => {
    // Setup error collection
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('https://trip-planner-frontend-tau.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // Interact with the page to potentially trigger errors
    await page.click('body');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Try some basic interactions
    const buttons = await page.$$('button');
    for (const button of buttons.slice(0, 3)) {
      await button.click().catch(() => {});
      await page.waitForTimeout(500);
    }
    
    const inputs = await page.$$('input');
    for (const input of inputs.slice(0, 3)) {
      await input.click().catch(() => {});
      await input.fill('test').catch(() => {});
      await page.waitForTimeout(500);
    }
    
    // Report findings
    console.log(`Trip Planner Tau console errors: ${errors.length}`);
    errors.forEach(error => console.log(` - ${error}`));
  });
});

// Test Site 5: ELD Trip Tracker
test.describe('ELD Trip Tracker Tests', () => {
  test('complete trip planning flow', async ({ page }) => {
    await page.goto('https://eld-trip-tracker.vercel.app/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'eld_trip_tracker_initial.png', fullPage: true });
    
    // Fill the form
    await fillLocationForm(page, 'Chicago, IL', 'Indianapolis, IN', 'Cincinnati, OH', '4');
    
    // Wait for results to load
    await page.waitForTimeout(5000);
    
    // Take screenshot of results
    await page.screenshot({ path: 'eld_trip_tracker_results.png', fullPage: true });
    
    // Check for expected outputs
    const outputs = await checkForOutputs(page);
    console.log('ELD Trip Tracker Outputs:', outputs);
  });
  
  test('test long route scenario', async ({ page }) => {
    await page.goto('https://eld-trip-tracker.vercel.app/');
    await page.waitForLoadState('networkidle');
    
    // Fill the form with a long route
    await fillLocationForm(page, 'Seattle, WA', 'Denver, CO', 'Chicago, IL', '6');
    
    // Wait for results to load (may take longer for a complex route)
    await page.waitForTimeout(10000);
    
    // Take screenshot of results
    await page.screenshot({ path: 'eld_trip_tracker_long_route.png', fullPage: true });
    
    // Check for multiple log sheets
    const multipleLogSheets = await page.evaluate(() => {
      const pageContent = document.body.innerText;
      return pageContent.includes('Day 1') || 
             pageContent.includes('Day 2') || 
             pageContent.includes('multiple') || 
             pageContent.includes('log sheets') ||
             document.querySelectorAll('.log, #log, [class*="log"], table, svg, canvas').length > 1;
    });
    
    console.log(`ELD Trip Tracker shows multiple log sheets for long route: ${multipleLogSheets}`);
    
    // Check for fueling stops (should be required for routes over 1000 miles)
    const hasFuelingStops = await page.evaluate(() => {
      const pageContent = document.body.innerText.toLowerCase();
      return pageContent.includes('fuel') || 
             pageContent.includes('fueling') || 
             pageContent.includes('gas') || 
             pageContent.includes('diesel');
    });
    
    console.log(`ELD Trip Tracker shows fueling stops for long route: ${hasFuelingStops}`);
  });
});

// Common helper functions

async function fillLocationForm(page, currentLocation, pickupLocation, dropoffLocation, hours) {
  try {
    // Try different selectors for location fields
    const currentLocationInput = await page.$('input[placeholder*="current"], input[placeholder*="start"], input[name*="current"], input[name*="start"], input[id*="current"], input[id*="start"]');
    const pickupInput = await page.$('input[placeholder*="pickup"], input[name*="pickup"], input[id*="pickup"]');
    const dropoffInput = await page.$('input[placeholder*="drop"], input[placeholder*="destination"], input[name*="drop"], input[name*="destination"], input[id*="drop"], input[id*="destination"]');
    const hoursInput = await page.$('input[type="number"], input[placeholder*="hour"], input[placeholder*="cycle"], input[name*="hour"], input[name*="cycle"], input[id*="hour"], input[id*="cycle"]');
    
    // Fill fields if found
    if (currentLocationInput) await currentLocationInput.fill(currentLocation);
    if (pickupInput) await pickupInput.fill(pickupLocation);
    if (dropoffInput) await dropoffInput.fill(dropoffLocation);
    if (hoursInput) await hoursInput.fill(hours);
    
    // If specific inputs weren't found, try a generic approach
    if (!currentLocationInput || !pickupInput || !dropoffInput) {
      const textInputs = await page.$$('input[type="text"]');
      if (textInputs.length >= 3) {
        await textInputs[0].fill(currentLocation);
        await textInputs[1].fill(pickupLocation);
        await textInputs[2].fill(dropoffLocation);
      }
    }
    
    if (!hoursInput) {
      const numberInputs = await page.$$('input[type="number"]');
      if (numberInputs.length > 0) {
        await numberInputs[0].fill(hours);
      }
    }
    
    // Wait for any autocomplete suggestions
    await page.waitForTimeout(1000);
    
    // Try to submit the form
    await page.click('button[type="submit"], input[type="submit"], button:has-text("Plan"), button:has-text("Calculate"), button:has-text("Submit"), button:has-text("Generate")').catch(() => {
      // If explicit selectors fail, try any button
      page.$$eval('button', buttons => {
        if (buttons.length > 0) buttons[0].click();
      });
    });
    
  } catch (error) {
    console.error('Error filling location form:', error);
  }
}

async function checkForOutputs(page) {
  const results = {
    hasMap: false,
    hasEldLogs: false,
    hasRouteInfo: false,
    hasBreaks: false,
    hasHoursInfo: false
  };
  
  try {
    // Check for map
    results.hasMap = await page.isVisible('.map, #map, [class*="map"], canvas, svg, iframe[src*="map"], iframe[src*="google"]');
    
    // Check for ELD logs
    results.hasEldLogs = await page.isVisible('.eld, #eld, [class*="log"], .log, #log, table, svg, canvas');
    
    // Check for route information
    results.hasRouteInfo = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('distance') || 
             text.includes('duration') || 
             text.includes('mile') || 
             text.includes('km') || 
             text.includes('hour') || 
             text.includes('time');
    });
    
    // Check for breaks information
    results.hasBreaks = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('break') || 
             text.includes('rest') || 
             text.includes('stop') || 
             text.includes('sleep');
    });
    
    // Check for hours of service information
    results.hasHoursInfo = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('hos') || 
             text.includes('hours of service') || 
             text.includes('driving time') || 
             text.includes('duty') || 
             text.includes('cycle');
    });
  } catch (error) {
    console.error('Error checking for outputs:', error);
  }
  
  return results;
}
