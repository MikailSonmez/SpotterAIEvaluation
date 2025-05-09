// Playwright test for evaluating Trips Frontend website
const { test, expect } = require('@playwright/test');

// Website details
const website = {
  name: 'Trips Frontend',
  url: 'https://trips.spotter.social', // Update this with the actual URL
  description: 'Trip Planning Frontend Application'
};

// Initialize evaluation results structure
const evaluationResults = {
  requiredFeatures: 0,
  uiAesthetics: 0,
  uxIntuitiveness: 0,
  bugs: 0,
  tripPlanningAccuracy: 0, // Changed from eldAccuracy to tripPlanningAccuracy
  notes: [],
  finalScores: {}
};

// Test data for different route scenarios
const testRoutes = {
  short: {
    currentLocation: 'Chicago, IL',
    pickupLocation: 'Milwaukee, WI',
    dropoffLocation: 'Green Bay, WI',
    tripDetails: {
      distance: '200 miles',
      estimatedTime: '3.5 hours'
    }
  },
  medium: {
    currentLocation: 'Dallas, TX',
    pickupLocation: 'Oklahoma City, OK',
    dropoffLocation: 'Kansas City, MO',
    tripDetails: {
      distance: '450 miles',
      estimatedTime: '7 hours'
    }
  },
  long: {
    currentLocation: 'Seattle, WA',
    pickupLocation: 'Portland, OR',
    dropoffLocation: 'San Francisco, CA',
    tripDetails: {
      distance: '800 miles',
      estimatedTime: '13 hours'
    }
  }
};

// Main test suite
test.describe(`Evaluation of ${website.name}`, () => {
  // Set up for all tests
  test.beforeEach(async ({ page }) => {
    await page.goto(website.url);
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial page
    await page.screenshot({ path: `${website.name}_initial.png` });
    
    // Record the website is reachable
    evaluationResults.notes.push('Website successfully loaded');
  });
  
  // Test 1: Check for required trip planning input fields
  test('check for required input fields', async ({ page }) => {
    try {
      // Look for origin/starting location field
      const originField = await page.$('input[placeholder*="origin"], input[placeholder*="start"], input[aria-label*="origin"], input[aria-label*="start"]');
      
      // Look for destination field
      const destinationField = await page.$('input[placeholder*="destination"], input[placeholder*="end"], input[aria-label*="destination"], input[aria-label*="end"]');
      
      // Look for date/time selection
      const dateTimeField = await page.$('input[type="date"], input[type="datetime-local"], input[placeholder*="date"], input[placeholder*="time"]');
      
      // Check for trip type selection (e.g. one-way, round trip)
      const tripTypeField = await page.$('select[aria-label*="trip"], input[name*="trip"], button[aria-label*="trip"]');
      
      // Count how many required fields are present
      let requiredFieldCount = 0;
      if (originField) requiredFieldCount++;
      if (destinationField) requiredFieldCount++;
      if (dateTimeField) requiredFieldCount++;
      if (tripTypeField) requiredFieldCount++;
      
      // Each field is worth 1 point, up to 4 points
      evaluationResults.requiredFeatures += Math.min(requiredFieldCount, 4);
      
      // Take screenshot with form fields
      await page.screenshot({ path: `${website.name}_form_fields.png` });
      
      // Add notes about found fields
      if (originField) evaluationResults.notes.push('Origin field found');
      if (destinationField) evaluationResults.notes.push('Destination field found');
      if (dateTimeField) evaluationResults.notes.push('Date/time selection found');
      if (tripTypeField) evaluationResults.notes.push('Trip type selection found');
      
      evaluationResults.notes.push(`Required field score: ${requiredFieldCount}/4`);
    } catch (error) {
      evaluationResults.notes.push(`Error checking input fields: ${error.message}`);
    }
  });
  
  // Test 2: Check trip planning functionality
  test('evaluate trip planning functionality', async ({ page }) => {
    try {
      // Fill in the form with test data for a medium route
      await fillLocationFields(page, testRoutes.medium);
      
      // Try to submit the form
      const submitted = await clickSubmitButton(page);
      
      if (submitted) {
        // Wait for results to load
        await page.waitForTimeout(2000);
        
        // Check for map visualization
        const hasMap = await checkForMap(page);
        if (hasMap) {
          evaluationResults.tripPlanningAccuracy += 2;
          evaluationResults.notes.push('Map visualization found');
        } else {
          evaluationResults.notes.push('No map visualization found');
        }
        
        // Check for route details
        const hasRouteDetails = await page.$$eval('*', elements => {
          return elements.some(el => {
            const text = el.textContent;
            return text && (
              text.includes('miles') || 
              text.includes('km') || 
              text.includes('hours') || 
              text.includes('min') ||
              text.includes('distance') ||
              text.includes('duration')
            );
          });
        });
        
        if (hasRouteDetails) {
          evaluationResults.tripPlanningAccuracy += 2;
          evaluationResults.notes.push('Route details found');
        } else {
          evaluationResults.notes.push('No route details found');
        }
        
        // Check for additional trip information (e.g., stops, breaks, etc.)
        const hasTripInfo = await page.$$eval('*', elements => {
          return elements.some(el => {
            const text = el.textContent;
            return text && (
              text.includes('stop') || 
              text.includes('break') || 
              text.includes('rest') || 
              text.includes('waypoint')
            );
          });
        });
        
        if (hasTripInfo) {
          evaluationResults.tripPlanningAccuracy += 1;
          evaluationResults.notes.push('Additional trip information found');
        } else {
          evaluationResults.notes.push('No additional trip information found');
        }
        
        // Take screenshot of results
        await page.screenshot({ path: `${website.name}_results.png` });
      } else {
        evaluationResults.notes.push('Could not submit form');
      }
    } catch (error) {
      evaluationResults.notes.push(`Error evaluating trip planning: ${error.message}`);
    }
  });
  
  // Test 3: Evaluate UI aesthetics
  test('evaluate UI aesthetics', async ({ page }) => {
    try {
      // Check responsive design by resizing viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      
      // Take screenshot of mobile view
      await page.screenshot({ path: `${website.name}_mobile.png` });
      
      // Check if UI is properly responsive
      const overflowX = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (!overflowX) {
        evaluationResults.uiAesthetics += 2;
        evaluationResults.notes.push('UI is responsive on mobile');
      } else {
        evaluationResults.uiAesthetics += 0;
        evaluationResults.notes.push('UI has horizontal overflow on mobile');
      }
      
      // Return to desktop view
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(1000);
      
      // Check for consistent styling
      const hasConsistentStyling = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const inputs = Array.from(document.querySelectorAll('input'));
        
        // Check if buttons have consistent styling
        const buttonStyles = buttons.map(b => window.getComputedStyle(b).backgroundColor);
        const uniqueButtonStyles = new Set(buttonStyles);
        
        // Check if inputs have consistent styling
        const inputStyles = inputs.map(i => window.getComputedStyle(i).borderColor);
        const uniqueInputStyles = new Set(inputStyles);
        
        return {
          consistentButtons: uniqueButtonStyles.size <= 3,
          consistentInputs: uniqueInputStyles.size <= 2
        };
      });
      
      if (hasConsistentStyling.consistentButtons && hasConsistentStyling.consistentInputs) {
        evaluationResults.uiAesthetics += 1;
        evaluationResults.notes.push('UI has consistent styling');
      } else {
        evaluationResults.notes.push('UI has inconsistent styling');
      }
      
      // Check for professional UI elements
      const professionalScore = await page.evaluate(() => {
        // Check for drop shadows, gradients, or rounded corners
        const elements = Array.from(document.querySelectorAll('*'));
        const styles = elements.map(e => window.getComputedStyle(e));
        
        const hasDropShadows = styles.some(s => s.boxShadow !== 'none');
        const hasRoundedCorners = styles.some(s => s.borderRadius !== '0px');
        
        return (hasDropShadows ? 1 : 0) + (hasRoundedCorners ? 1 : 0);
      });
      
      evaluationResults.uiAesthetics += professionalScore;
      evaluationResults.notes.push(`Professional UI elements score: ${professionalScore}/2`);
    } catch (error) {
      evaluationResults.notes.push(`Error evaluating UI: ${error.message}`);
    }
  });
  
  // Test 4: Check for UX intuitiveness
  test('evaluate UX intuitiveness', async ({ page }) => {
    try {
      // Check for form validation
      const formFields = await page.$$('input, select, textarea');
      if (formFields.length > 0) {
        // Try to submit an empty form
        await clickSubmitButton(page);
        await page.waitForTimeout(1000);
        
        // Look for validation messages
        const hasValidation = await page.$$eval('*', elements => {
          return elements.some(el => {
            const text = el.textContent;
            return text && (
              text.includes('required') || 
              text.includes('invalid') || 
              text.includes('error') || 
              text.includes('Please') ||
              el.getAttribute('aria-invalid') === 'true'
            );
          });
        });
        
        if (hasValidation) {
          evaluationResults.uxIntuitiveness += 1;
          evaluationResults.notes.push('Form validation present');
        } else {
          evaluationResults.notes.push('No form validation found');
        }
      }
      
      // Check for clear navigation
      const hasNavigation = await page.$$('nav, .nav, #nav, .navbar, header a, .menu');
      if (hasNavigation.length > 0) {
        evaluationResults.uxIntuitiveness += 1;
        evaluationResults.notes.push('Navigation elements found');
      } else {
        evaluationResults.notes.push('No clear navigation found');
      }
      
      // Check for help text or tooltips
      const hasHelp = await page.$$('*[title], [data-tooltip], .tooltip, .help, [aria-describedby]');
      if (hasHelp.length > 0) {
        evaluationResults.uxIntuitiveness += 1;
        evaluationResults.notes.push('Help elements found');
      } else {
        evaluationResults.notes.push('No help elements found');
      }
    } catch (error) {
      evaluationResults.notes.push(`Error evaluating UX: ${error.message}`);
    }
  });
  
  // Test 5: Look for bugs and issues
  test('check for bugs and issues', async ({ page }) => {
    try {
      // Check console for errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Reload the page to capture any console errors
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Try interactions that might cause errors
      const locations = await page.$$('input[type="text"]');
      if (locations.length > 0) {
        // Try entering an invalid location
        await locations[0].fill('!@#$%^&*()');
        await clickSubmitButton(page);
        await page.waitForTimeout(1000);
      }
      
      // Record the number of errors (fewer is better)
      const bugScore = Math.min(consoleErrors.length, 5);
      evaluationResults.bugs = 5 - bugScore;
      
      if (consoleErrors.length > 0) {
        evaluationResults.notes.push(`Found ${consoleErrors.length} console errors`);
      } else {
        evaluationResults.notes.push('No console errors detected');
      }
    } catch (error) {
      evaluationResults.notes.push(`Error checking for bugs: ${error.message}`);
    }
  });
  
  // After all tests, compile results
  test.afterAll(async () => {
    // Calculate overall score (1-5 scale for each category)
    const tripPlanningAccuracy = Math.min(evaluationResults.tripPlanningAccuracy, 5);
    const requiredFeatures = Math.min(evaluationResults.requiredFeatures, 5);
    const uiAesthetics = Math.min(evaluationResults.uiAesthetics, 5);
    const uxIntuitiveness = Math.min(evaluationResults.uxIntuitiveness, 5);
    const bugs = Math.min(evaluationResults.bugs, 5);
    
    evaluationResults.finalScores = {
      tripPlanningAccuracy,
      requiredFeatures,
      uiAesthetics,
      uxIntuitiveness,
      bugs,
      overall: (tripPlanningAccuracy + requiredFeatures + uiAesthetics + uxIntuitiveness + bugs) / 5
    };
    
    // Save results to a JSON file
    const fs = require('fs');
    fs.writeFileSync(
      `${website.name}_evaluation.json`, 
      JSON.stringify(evaluationResults, null, 2)
    );
    
    console.log(`${website.name} evaluation completed with overall score: ${evaluationResults.finalScores.overall.toFixed(1)}`);
  });
});

// Helper functions

// Attempt to find and fill location fields
async function fillLocationFields(page, route) {
  try {
    // Try different strategies to locate and fill fields
    
    // Strategy 1: Look for placeholders or labels
    const originInput = await page.$('input[placeholder*="origin"], input[placeholder*="start"], input[aria-label*="origin"], input[aria-label*="start"]');
    const destinationInput = await page.$('input[placeholder*="destination"], input[placeholder*="end"], input[aria-label*="destination"], input[aria-label*="end"]');
    
    if (originInput) await originInput.fill(route.currentLocation);
    if (destinationInput) await destinationInput.fill(route.dropoffLocation);
    
    // Strategy 2: If the above didn't work, try the first two text inputs
    if (!originInput || !destinationInput) {
      const textInputs = await page.$$('input[type="text"]');
      if (textInputs.length >= 2) {
        await textInputs[0].fill(route.currentLocation);
        await textInputs[1].fill(route.dropoffLocation);
      }
    }
    
    // Fill date field if present
    const dateField = await page.$('input[type="date"], input[placeholder*="date"]');
    if (dateField) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
      await dateField.fill(formattedDate);
    }
    
    // Wait for any autocomplete suggestions
    await page.waitForTimeout(1000);
    
    // Try to select first autocomplete option if it appears
    const autocompleteOptions = await page.$$('.autocomplete-option, .suggestion, [role="option"]');
    for (const option of autocompleteOptions) {
      await option.click();
      await page.waitForTimeout(500);
    }
  } catch (error) {
    console.log(`Error filling location fields: ${error.message}`);
  }
}

// Attempt to find and click a submit button
async function clickSubmitButton(page) {
  try {
    // Try different selectors that might be submit buttons
    const buttonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Search")',
      'button:has-text("Plan")',
      'button:has-text("Find")',
      'button:has-text("Go")',
      '.submit',
      '#submit'
    ];
    
    for (const selector of buttonSelectors) {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        await page.waitForTimeout(1000);
        return true;
      }
    }
    
    // If no specific button found, try any button
    const buttons = await page.$$('button');
    if (buttons.length > 0) {
      await buttons[0].click();
      await page.waitForTimeout(1000);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`Error clicking submit button: ${error.message}`);
    return false;
  }
}

// Check if the page contains a map
async function checkForMap(page) {
  try {
    // Check for common map elements
    const mapElements = await page.$$('.map, #map, [class*="map"], svg, iframe[src*="map"], iframe[src*="google"], canvas');
    return mapElements.length > 0;
  } catch (error) {
    console.log(`Error checking for map: ${error.message}`);
    return false;
  }
}

module.exports = { website, evaluationResults };
