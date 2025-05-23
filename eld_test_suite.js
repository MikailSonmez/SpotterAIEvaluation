// ELD Trip Planner Evaluation Test Suite
// This test suite evaluates various ELD Trip Planner applications based on the specified criteria

const { test, expect } = require('@playwright/test');

// Test data
const testRoutes = [
  {
    name: 'Short route',
    currentLocation: 'Chicago, IL',
    pickupLocation: 'Indianapolis, IN',
    dropoffLocation: 'Cincinnati, OH',
    currentCycleUsed: 2
  },
  {
    name: 'Medium route',
    currentLocation: 'Seattle, WA',
    pickupLocation: 'Portland, OR',
    dropoffLocation: 'San Francisco, CA',
    currentCycleUsed: 4
  },
  {
    name: 'Long route',
    currentLocation: 'New York, NY',
    pickupLocation: 'Chicago, IL',
    dropoffLocation: 'Denver, CO',
    currentCycleUsed: 6
  },
  {
    name: 'Edge case - high hours',
    currentLocation: 'Miami, FL',
    pickupLocation: 'Atlanta, GA',
    dropoffLocation: 'Nashville, TN',
    currentCycleUsed: 10
  }
];

// List of websites to test
const websites = [
  { url: 'https://spotter.lavandesn.com/', name: 'SpotterLavandesn' },
  { url: 'https://trips-frontend-dusky.vercel.app', name: 'TripsFrontendDusky' },
  { url: 'https://eld-client.onrender.com', name: 'EldClientOnrender' },
  { url: 'https://eld-log-app-git-main-mert-gokhan-donmezs-projects.vercel.app/', name: 'EldLogAppMertGokhan' },
  { url: 'https://tracking-user-app.netlify.app/', name: 'TrackingUserApp' },
  { url: 'https://frontend-nine-phi-12.vercel.app/', name: 'FrontendNinePhi' },
  { url: 'https://tripapp-ydoc.onrender.com', name: 'TripappYdoc' },
  { url: 'https://web-production-59cbe.up.railway.app/', name: 'WebProduction59cbe' },
  { url: 'https://spotter-ai-logbook-react-frontend.vercel.app', name: 'SpotterAILogbookReact' },
  { url: 'https://driver-logbook.vercel.app/', name: 'DriverLogbook' },
  { url: 'https://trip-planning-logging.netlify.app/', name: 'TripPlanningLogging' },
  { url: 'http://eldlog.duckdns.org', name: 'EldlogDuckdns' },
  { url: 'https://route-eld-tracker-git-main-ilhams-projects-9cb20472.vercel.app/', name: 'RouteEldTracker' },
  { url: 'https://trajectspotterfrontend.onrender.com', name: 'TrajectspotterFrontend' },
  { url: 'https://eld-frontend-cobt.vercel.app/', name: 'EldFrontendCobt' },
  { url: 'https://tripplanner-mu.vercel.app/', name: 'TripplannerMu' },
  { url: 'https://trip-logger-jet.vercel.app', name: 'TripLoggerJet' },
  { url: 'https://eld-trip-planner-frontend.vercel.app/', name: 'EldTripPlannerFrontend' },
  { url: 'https://spotter-front-git-master-pbnjaays-projects.vercel.app/', name: 'SpotterFrontPbnjaays' },
  { url: 'https://track-drivers.vercel.app/', name: 'TrackDrivers' },
  { url: 'https://truck-logbook.vercel.app/', name: 'TruckLogbook' },
  { url: 'https://trip-planner-frontend-tau.vercel.app', name: 'TripPlannerFrontendTau' },
  { url: 'https://eld-client.vercel.app', name: 'EldClientVercel' },
  { url: 'https://we-haul-frontend.vercel.app/trips', name: 'WeHaulFrontend' },
  { url: 'https://eld-generator.netlify.app', name: 'EldGenerator' },
  { url: 'https://trip-planner-yphs.onrender.com/', name: 'TripPlannerYphs' },
  { url: 'https://eld-frontend-sand.vercel.app/', name: 'EldFrontendSand' },
  { url: 'https://eld-trip-tracker.vercel.app/', name: 'EldTripTracker' },
  { url: 'https://eld-trip-planner.vercel.app/', name: 'EldTripPlanner' },
  { url: 'https://trip-planner-app-gray.vercel.app/', name: 'TripPlannerAppGray' }
];

// Evaluation results storage
const evaluationResults = {};

// Main test for each website
websites.forEach(website => {
  test.describe(`Evaluating ${website.name}`, () => {
    test.beforeEach(async ({ page }) => {
      // Initialize evaluation object
      if (!evaluationResults[website.name]) {
        evaluationResults[website.name] = {
          url: website.url,
          eldAccuracy: 0,
          requiredFeatures: 0,
          uiAesthetics: 0,
          uxIntuitiveness: 0,
          bugs: 0,
          notes: [],
          screenshots: []
        };
      }
      
      // Navigate to the website
      try {
        await page.goto(website.url, { timeout: 60000 });
        await page.waitForLoadState('networkidle');
        
        // Capture initial screenshot
        await page.screenshot({ path: `${website.name}_initial.png`, fullPage: true });
        evaluationResults[website.name].screenshots.push(`${website.name}_initial.png`);
        
        // Add note about initial load
        evaluationResults[website.name].notes.push('Website loaded successfully');
      } catch (error) {
        evaluationResults[website.name].notes.push(`Error loading website: ${error.message}`);
        test.fail();
      }
    });
    
    // Test 1: Check for required input fields
    test('has required input fields', async ({ page }) => {
      try {
        // Look for input fields (different websites may use different field identifiers)
        const locationInputs = await page.$$('input[type="text"], [placeholder*="location"], [name*="location"], [id*="location"]');
        const hoursInput = await page.$$('input[type="number"], [placeholder*="hour"], [name*="hour"], [id*="hour"], [id*="cycle"]');
        
        // Evaluate and record findings
        const hasRequiredInputs = locationInputs.length >= 3 && hoursInput.length >= 1;
        if (hasRequiredInputs) {
          evaluationResults[website.name].requiredFeatures += 1;
          evaluationResults[website.name].notes.push('Required input fields found');
        } else {
          evaluationResults[website.name].notes.push('Missing some required input fields');
        }
        
        // Try to find specific field labels
        const pageContent = await page.content();
        const hasCurrentLocationLabel = pageContent.includes('Current Location') || 
                                       pageContent.includes('current location') || 
                                       pageContent.includes('Start');
        const hasPickupLabel = pageContent.includes('Pickup') || 
                              pageContent.includes('pickup');
        const hasDropoffLabel = pageContent.includes('Dropoff') || 
                               pageContent.includes('dropoff') || 
                               pageContent.includes('Destination');
        const hasHoursLabel = pageContent.includes('Cycle') || 
                             pageContent.includes('Hours') || 
                             pageContent.includes('HOS');
        
        if (hasCurrentLocationLabel && hasPickupLabel && hasDropoffLabel && hasHoursLabel) {
          evaluationResults[website.name].requiredFeatures += 1;
          evaluationResults[website.name].notes.push('All required input labels present');
        } else {
          evaluationResults[website.name].notes.push('Some input labels missing or unclear');
        }
      } catch (error) {
        evaluationResults[website.name].notes.push(`Error checking input fields: ${error.message}`);
      }
    });
    
    // Test 2: Submit a route and check for outputs
    test('generates route and ELD logs', async ({ page }) => {
      try {
        // Use the first test route
        const route = testRoutes[0];
        
        // Try to fill in form fields (this is generalized and may need adjustments for specific sites)
        const inputFields = await page.$$('input[type="text"], input[type="number"]');
        if (inputFields.length >= 4) {
          // Attempt to fill fields based on common patterns
          await fillLocationFields(page, route);
          await fillHoursField(page, route);
          
          // Look for and click submit button
          await clickSubmitButton(page);
          
          // Wait for results to load
          await page.waitForTimeout(5000);
          
          // Capture results screenshot
          await page.screenshot({ path: `${website.name}_results.png`, fullPage: true });
          evaluationResults[website.name].screenshots.push(`${website.name}_results.png`);
          
          // Check for map presence
          const hasMap = await checkForMap(page);
          if (hasMap) {
            evaluationResults[website.name].requiredFeatures += 1;
            evaluationResults[website.name].notes.push('Map output found');
          } else {
            evaluationResults[website.name].notes.push('No map found in results');
          }
          
          // Check for ELD logs
          const hasEldLogs = await checkForEldLogs(page);
          if (hasEldLogs) {
            evaluationResults[website.name].eldAccuracy += 2;
            evaluationResults[website.name].notes.push('ELD logs found');
          } else {
            evaluationResults[website.name].notes.push('No ELD logs found in results');
          }
        } else {
          evaluationResults[website.name].notes.push('Insufficient input fields to complete form');
        }
      } catch (error) {
        evaluationResults[website.name].notes.push(`Error testing route generation: ${error.message}`);
      }
    });
    
    // Test 3: Evaluate UI aesthetics
    test('evaluate UI aesthetics', async ({ page }) => {
      try {
        // Check for responsive design
        const viewport = page.viewportSize();
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${website.name}_mobile.png` });
        evaluationResults[website.name].screenshots.push(`${website.name}_mobile.png`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Check for color consistency and visual elements
        const styles = await page.evaluate(() => {
          const styleMap = {};
          const elements = document.querySelectorAll('button, input, header, nav');
          elements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (!styleMap[el.tagName]) {
              styleMap[el.tagName] = {
                color: style.color,
                backgroundColor: style.backgroundColor,
                borderStyle: style.borderStyle,
                borderRadius: style.borderRadius,
                fontFamily: style.fontFamily
              };
            }
          });
          return styleMap;
        });
        
        // Analyze design consistency
        const styleConsistency = Object.keys(styles).length > 3 ? 1 : 0;
        evaluationResults[website.name].uiAesthetics += styleConsistency;
        evaluationResults[website.name].notes.push(styleConsistency ? 
          'Design appears to have consistent styling' : 
          'Design lacks style consistency');
        
        // Subjective assessment based on visual appearance
        // Note: In a real QA process, you would have more objective criteria
        const hasProfessionalAppearance = false; // This would be determined by human evaluation
        
        // For this test, we'll rely on a simple heuristic
        const hasLogo = await page.$('img[alt*="logo"], img[src*="logo"], .logo, #logo');
        const hasFooter = await page.$('footer, .footer, #footer');
        const professionalScore = (hasLogo ? 1 : 0) + (hasFooter ? 1 : 0);
        
        evaluationResults[website.name].uiAesthetics += professionalScore;
        evaluationResults[website.name].notes.push(`Professional UI elements score: ${professionalScore}/2`);
      } catch (error) {
        evaluationResults[website.name].notes.push(`Error evaluating UI: ${error.message}`);
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
            evaluationResults[website.name].uxIntuitiveness += 1;
            evaluationResults[website.name].notes.push('Form validation present');
          } else {
            evaluationResults[website.name].notes.push('No form validation found');
          }
        }
        
        // Check for clear navigation
        const hasNavigation = await page.$$('nav, .nav, #nav, .navbar, header a, .menu');
        if (hasNavigation.length > 0) {
          evaluationResults[website.name].uxIntuitiveness += 1;
          evaluationResults[website.name].notes.push('Navigation elements found');
        } else {
          evaluationResults[website.name].notes.push('No clear navigation found');
        }
        
        // Check for help text or tooltips
        const hasHelp = await page.$$('*[title], [data-tooltip], .tooltip, .help, [aria-describedby]');
        if (hasHelp.length > 0) {
          evaluationResults[website.name].uxIntuitiveness += 1;
          evaluationResults[website.name].notes.push('Help elements found');
        } else {
          evaluationResults[website.name].notes.push('No help elements found');
        }
      } catch (error) {
        evaluationResults[website.name].notes.push(`Error evaluating UX: ${error.message}`);
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
        evaluationResults[website.name].bugs = 5 - bugScore;
        
        if (consoleErrors.length > 0) {
          evaluationResults[website.name].notes.push(`Found ${consoleErrors.length} console errors`);
        } else {
          evaluationResults[website.name].notes.push('No console errors detected');
        }
      } catch (error) {
        evaluationResults[website.name].notes.push(`Error checking for bugs: ${error.message}`);
      }
    });
    
    // After all tests, compile and save results
    test.afterAll(async () => {
      // Calculate overall score (1-5 scale for each category)
      const eldAccuracy = Math.min(evaluationResults[website.name].eldAccuracy, 5);
      const requiredFeatures = Math.min(evaluationResults[website.name].requiredFeatures, 5);
      const uiAesthetics = Math.min(evaluationResults[website.name].uiAesthetics, 5);
      const uxIntuitiveness = Math.min(evaluationResults[website.name].uxIntuitiveness, 5);
      const bugs = Math.min(evaluationResults[website.name].bugs, 5);
      
      evaluationResults[website.name].finalScores = {
        eldAccuracy,
        requiredFeatures,
        uiAesthetics,
        uxIntuitiveness,
        bugs,
        overall: (eldAccuracy + requiredFeatures + uiAesthetics + uxIntuitiveness + bugs) / 5
      };
      
      // Save results to a JSON file
      const fs = require('fs');
      fs.writeFileSync(
        `${website.name}_evaluation.json`, 
        JSON.stringify(evaluationResults[website.name], null, 2)
      );
    });
  });
});

// Helper functions

// Attempt to find and fill location fields
async function fillLocationFields(page, route) {
  try {
    // Try different strategies to locate and fill fields
    
    // Strategy 1: Look for placeholders or labels
    const currentLocationInput = await page.$('input[placeholder*="current"], input[placeholder*="start"], input[aria-label*="current"], input[aria-label*="start"]');
    const pickupInput = await page.$('input[placeholder*="pickup"], input[aria-label*="pickup"]');
    const dropoffInput = await page.$('input[placeholder*="dropoff"], input[placeholder*="destination"], input[aria-label*="dropoff"], input[aria-label*="destination"]');
    
    if (currentLocationInput) await currentLocationInput.fill(route.currentLocation);
    if (pickupInput) await pickupInput.fill(route.pickupLocation);
    if (dropoffInput) await dropoffInput.fill(route.dropoffLocation);
    
    // Strategy 2: If the above didn't work, try the first three text inputs
    if (!currentLocationInput || !pickupInput || !dropoffInput) {
      const textInputs = await page.$$('input[type="text"]');
      if (textInputs.length >= 3) {
        await textInputs[0].fill(route.currentLocation);
        await textInputs[1].fill(route.pickupLocation);
        await textInputs[2].fill(route.dropoffLocation);
      }
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

// Attempt to find and fill hours field
async function fillHoursField(page, route) {
  try {
    // Try different strategies
    
    // Strategy 1: Look for specific input
    const hoursInput = await page.$('input[placeholder*="hour"], input[placeholder*="cycle"], input[aria-label*="hour"], input[aria-label*="cycle"]');
    
    if (hoursInput) {
      await hoursInput.fill(route.currentCycleUsed.toString());
    } else {
      // Strategy 2: Try to find a number input
      const numberInputs = await page.$$('input[type="number"]');
      if (numberInputs.length > 0) {
        await numberInputs[0].fill(route.currentCycleUsed.toString());
      }
    }
  } catch (error) {
    console.log(`Error filling hours field: ${error.message}`);
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
      'button:has-text("Calculate")',
      'button:has-text("Plan")',
      'button:has-text("Generate")',
      'button:has-text("Create")',
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

// Check if the page contains ELD logs
async function checkForEldLogs(page) {
  try {
    // Look for ELD-related elements in the page
    const hasEldText = await page.$$eval('*', elements => {
      return elements.some(el => {
        const text = el.textContent;
        return text && (
          text.includes('ELD') || 
          text.includes('Electronic Log') || 
          text.includes('Duty Status') || 
          text.includes('Hours of Service') || 
          text.includes('HOS') ||
          text.includes('Driver Log')
        );
      });
    });
    
    // Look for visual log elements like tables or charts
    const hasLogElements = await page.$$('table, svg, canvas, .log, #log, [class*="log"], [class*="eld"]');
    
    return hasEldText || hasLogElements.length > 0;
  } catch (error) {
    console.log(`Error checking for ELD logs: ${error.message}`);
    return false;
  }
}
