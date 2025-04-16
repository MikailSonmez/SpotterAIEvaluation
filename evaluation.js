const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Main function to evaluate a single website
async function evaluateWebsite(url) {
  const websiteName = url.replace(/https?:\/\//, '')
                       .replace(/\/$/, '')
                       .replace(/[^\w.-]/g, '_');
  
  console.log(`\n===== Testing ${websiteName} (${url}) =====`);
  
  const evaluationResults = {
    website: websiteName,
    url: url,
    status: 'not_tested',
    finalScore: 0,
    error: null,
    notes: [],
    screenshots: [],
    // Main score categories out of 10
    scores: {
      eldAccuracy: 0,
      requiredFeatures: 0,
      uiAesthetics: 0,
      uxIntuitiveness: 0,
      bugs: 0
    },
    // Detailed sub-category scores
    detailedScores: {
      // 1. Accuracy of ELD drawings (10 points total)
      eldAccuracy: {
        hosVisualization: 0,    // 0-3 points
        statusChanges: 0,        // 0-2 points
        driveTimeCalculation: 0, // 0-3 points
        breaksRepresentation: 0, // 0-2 points
      },
      // 2. Required features (10 points total)
      requiredFeatures: {
        locationInputs: 0,      // 0-2 points
        hoursInputs: 0,         // 0-2 points
        routeMap: 0,            // 0-3 points
        eldLogs: 0,             // 0-3 points
      },
      // 3. UI aesthetics (10 points total)
      uiAesthetics: {
        professionalDesign: 0,   // 0-3 points
        colorScheme: 0,          // 0-2 points
        layout: 0,               // 0-3 points
        responsiveDesign: 0,     // 0-2 points
      },
      // 4. UX intuitiveness (10 points total)
      uxIntuitiveness: {
        navigation: 0,           // 0-2 points
        formLabels: 0,           // 0-2 points
        userFeedback: 0,         // 0-3 points
        accessibility: 0,        // 0-3 points
      },
      // 5. Bugs (10 points total)
      bugs: {
        consoleErrors: 0,        // 0-3 points
        functionalIssues: 0,     // 0-3 points
        formValidation: 0,       // 0-2 points
        visualGlitches: 0,       // 0-2 points
      }
    }
  };

  // Store test route data
  const testRoute = {
    currentLocation: 'Chicago, IL',
    pickupLocation: 'Indianapolis, IN',
    dropoffLocation: 'Cincinnati, OH',
    currentCycleUsed: 2
  };

  let browser;
  try {
    // Launch browser with headed mode (visible UI)
    browser = await chromium.launch({ 
      headless: false,  // Change to false to see the browser UI
      timeout: 30000,
      slowMo: 100 // Add slight delay to operations so they're easier to see
    });
    
    const page = await browser.newPage();
    
    // Configure viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
    
    try {
      // Test 1: Load the website
      await evaluatePageLoad(page, url, evaluationResults);
      
      if (evaluationResults.status === 'loaded') {
        // Test 2: Required input fields
        await evaluateRequiredInputs(page, evaluationResults, testRoute);
        
        // Test 3: UI aesthetics
        await evaluateUIAesthetics(page, evaluationResults);
        
        // Test 4: UX intuitiveness
        await evaluateUXIntuitiveness(page, evaluationResults);
        
        // Test 5: Attempt form submission
        await attemptFormSubmission(page, evaluationResults, testRoute);
        
        // Test 6: Check for bugs and issues
        await evaluateBugsAndIssues(page, evaluationResults);
        
        // Test 7: Check for ELD accuracy if logs are present
        if (evaluationResults.detailedScores.requiredFeatures.eldLogs > 0) {
          await evaluateELDAccuracy(page, evaluationResults);
        }
        
        // Mark the evaluation as complete
        evaluationResults.status = 'complete';
      }
    } catch (error) {
      evaluationResults.status = 'error';
      evaluationResults.error = `Error during evaluation: ${error.message}`;
      evaluationResults.notes.push(`Evaluation error: ${error.message}`);
      console.error(`Error evaluating ${url}: ${error.message}`);
    }
    
    // Calculate final scores
    calculateFinalScores(evaluationResults);
    
    // Allow user to view the results before closing
    console.log("\nPress any key to close the browser and continue...");
    await new Promise(resolve => process.stdin.once('data', resolve));
    
    // Close the page
    await page.close();
    
  } catch (error) {
    evaluationResults.status = 'fatal_error';
    evaluationResults.error = `Fatal error during evaluation: ${error.message}`;
    evaluationResults.notes.push(`Fatal error: ${error.message}`);
    console.error(`Fatal error evaluating ${url}: ${error.message}`);
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
  }
  
  // Save detailed evaluation results to JSON file
  const resultsDir = path.join(__dirname, 'results');
  const resultsFile = path.join(resultsDir, `${websiteName}_evaluation.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(evaluationResults, null, 2));
  
  return evaluationResults;
}

// Helper function: Evaluate page load
async function evaluatePageLoad(page, url, results) {
  console.log(`Loading ${url}...`);
  try {
    await page.goto(url, { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Take initial screenshot
    const resultsDir = path.join(__dirname, 'results');
    const screenshotPath = path.join(resultsDir, `${results.website}_initial.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    results.screenshots.push(screenshotPath);
    
    results.status = 'loaded';
    results.notes.push('Website loaded successfully');
    console.log('Page loaded successfully');
    return true;
  } catch (error) {
    results.status = 'load_failed';
    results.error = `Failed to load page: ${error.message}`;
    results.notes.push(`Failed to load page: ${error.message}`);
    console.error(`Failed to load ${url}: ${error.message}`);
    return false;
  }
}

// Helper function: Evaluate required inputs
async function evaluateRequiredInputs(page, results, testRoute) {
  console.log('Checking for required input fields...');
  try {
    // Look for location inputs
    const locationInputs = await page.$$('input[type="text"], [placeholder*="location"], [placeholder*="origin"], [placeholder*="destination"], [name*="location"], [id*="location"]');
    const hoursInputs = await page.$$('input[type="number"], [placeholder*="hour"], [placeholder*="cycle"], [name*="hour"], [name*="cycle"], [id*="hour"], [id*="cycle"]');
    
    // Score based on number of proper inputs found
    if (locationInputs.length >= 3) {
      results.detailedScores.requiredFeatures.locationInputs = 2;
      results.notes.push('All required location input fields found');
    } else if (locationInputs.length >= 2) {
      results.detailedScores.requiredFeatures.locationInputs = 1;
      results.notes.push('Some location input fields found');
    } else {
      results.notes.push('Insufficient location input fields');
    }
    
    if (hoursInputs.length >= 1) {
      results.detailedScores.requiredFeatures.hoursInputs = 2;
      results.notes.push('Hours/cycle input field found');
    } else {
      results.notes.push('No hours/cycle input field found');
    }
    
    // Check for input labels which improves UX
    const pageContent = await page.content();
    const labelChecks = [
      pageContent.includes('Current Location') || pageContent.includes('current location') || pageContent.includes('Origin') || pageContent.includes('origin') || pageContent.includes('Start'),
      pageContent.includes('Pickup') || pageContent.includes('pickup'),
      pageContent.includes('Dropoff') || pageContent.includes('dropoff') || pageContent.includes('Destination') || pageContent.includes('destination'),
      pageContent.includes('Hours') || pageContent.includes('Cycle') || pageContent.includes('cycle') || pageContent.includes('HOS')
    ];
    
    const labelScore = labelChecks.filter(Boolean).length;
    if (labelScore >= 3) {
      results.detailedScores.uxIntuitiveness.formLabels = 2;
      results.notes.push('Clear input labels present');
    } else if (labelScore >= 2) {
      results.detailedScores.uxIntuitiveness.formLabels = 1;
      results.notes.push('Some input labels present');
    } else {
      results.notes.push('Few or no clear input labels');
    }
    
  } catch (error) {
    results.notes.push(`Error evaluating input fields: ${error.message}`);
    console.error(`Error evaluating input fields: ${error.message}`);
  }
}

// Helper function: Evaluate UI aesthetics
async function evaluateUIAesthetics(page, results) {
  console.log('Evaluating UI aesthetics...');
  try {
    // Take screenshot for mobile viewport
    const originalViewport = page.viewportSize();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Check if page renders on mobile
    const resultsDir = path.join(__dirname, 'results');
    const mobileScreenshotPath = path.join(resultsDir, `${results.website}_mobile.png`);
    await page.screenshot({ path: mobileScreenshotPath });
    results.screenshots.push(mobileScreenshotPath);
    
    // Check for responsive design (compare DOM structure before and after viewport change)
    const isMobileAdapted = await page.evaluate(() => {
      const viewport = window.innerWidth;
      return viewport < 400; // Verify that the page respects the viewport size
    });
    
    // Check for media queries in CSS
    const hasMediaQueries = await page.evaluate(() => {
      let mediaQueryCount = 0;
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.type === 4) { // CSSMediaRule
              mediaQueryCount++;
            }
          }
        } catch (e) {
          // Skip cross-origin stylesheets
        }
      }
      return mediaQueryCount > 2;
    });
    
    // Score responsive design
    if (isMobileAdapted && hasMediaQueries) {
      results.detailedScores.uiAesthetics.responsiveDesign = 2;
      results.notes.push('Fully responsive design detected');
    } else if (isMobileAdapted || hasMediaQueries) {
      results.detailedScores.uiAesthetics.responsiveDesign = 1;
      results.notes.push('Partial responsive design detected');
    } else {
      results.notes.push('No responsive design detected');
    }
    
    // Restore original viewport
    await page.setViewportSize(originalViewport);
    
    // Check for professional UI elements
    const hasLogo = await page.$('img[alt*="logo"], img[src*="logo"], .logo, #logo');
    const hasConsistentHeader = await page.$('header, .header, #header');
    const hasFooter = await page.$('footer, .footer, #footer');
    const hasNav = await page.$('nav, .navbar, .navigation, #nav');
    
    // Score professional design elements
    const professionalElements = [hasLogo, hasConsistentHeader, hasFooter, hasNav].filter(Boolean).length;
    
    if (professionalElements >= 3) {
      results.detailedScores.uiAesthetics.professionalDesign = 3;
      results.notes.push('Professional UI with logo, header, footer, and navigation');
    } else if (professionalElements >= 2) {
      results.detailedScores.uiAesthetics.professionalDesign = 2;
      results.notes.push('Somewhat professional UI with some key elements');
    } else if (professionalElements >= 1) {
      results.detailedScores.uiAesthetics.professionalDesign = 1;
      results.notes.push('Basic UI with minimal professional elements');
    } else {
      results.notes.push('Lacks professional UI elements');
    }
    
    // Analyze color scheme
    const colorAnalysis = await page.evaluate(() => {
      const colors = {
        background: new Set(),
        text: new Set(),
        accent: new Set()
      };
      
      // Sample elements for color analysis
      const elements = document.querySelectorAll('body, h1, h2, h3, p, button, input, a, nav, footer, header, div');
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        colors.background.add(style.backgroundColor);
        colors.text.add(style.color);
        
        // Buttons, links, and interactive elements often use accent colors
        if (el.tagName === 'BUTTON' || el.tagName === 'A' || style.cursor === 'pointer') {
          colors.accent.add(style.backgroundColor);
          colors.accent.add(style.borderColor);
        }
      });
      
      return {
        backgroundColors: Array.from(colors.background),
        textColors: Array.from(colors.text),
        accentColors: Array.from(colors.accent),
        totalUniqueColors: new Set([
          ...Array.from(colors.background),
          ...Array.from(colors.text),
          ...Array.from(colors.accent)
        ]).size
      };
    });
    
    // Score color scheme (good design typically uses 3-7 colors)
    if (colorAnalysis.totalUniqueColors >= 3 && colorAnalysis.totalUniqueColors <= 12) {
      results.detailedScores.uiAesthetics.colorScheme = 2;
      results.notes.push('Balanced color scheme with appropriate number of colors');
    } else if (colorAnalysis.totalUniqueColors > 12) {
      results.detailedScores.uiAesthetics.colorScheme = 1;
      results.notes.push('Too many colors in design (may appear inconsistent)');
    } else {
      results.detailedScores.uiAesthetics.colorScheme = 1;
      results.notes.push('Too few colors used in design (may appear bland)');
    }
    
    // Analyze layout
    const layoutAnalysis = await page.evaluate(() => {
      // Check for modern layout techniques
      const hasFlexbox = document.querySelector('*[style*="display: flex"], *[style*="display:flex"]') !== null;
      const hasGrid = document.querySelector('*[style*="display: grid"], *[style*="display:grid"]') !== null;
      
      // Check content structure
      const hasClearSections = document.querySelectorAll('section, article, .container, .section, .row').length > 0;
      
      // Check for consistent spacing
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
      const paragraphs = Array.from(document.querySelectorAll('p'));
      
      // Detect if paragraphs have consistent margins
      let consistentSpacing = false;
      if (paragraphs.length > 1) {
        const firstMarginBottom = window.getComputedStyle(paragraphs[0]).marginBottom;
        consistentSpacing = paragraphs.every(p => 
          window.getComputedStyle(p).marginBottom === firstMarginBottom
        );
      }
      
      return {
        hasModernLayout: hasFlexbox || hasGrid,
        hasClearSections,
        hasConsistentSpacing: consistentSpacing,
        hasProperHierarchy: headings.length > 0
      };
    });
    
    // Score layout
    let layoutScore = 0;
    if (layoutAnalysis.hasModernLayout) layoutScore++;
    if (layoutAnalysis.hasClearSections) layoutScore++;
    if (layoutAnalysis.hasConsistentSpacing || layoutAnalysis.hasProperHierarchy) layoutScore++;
    
    results.detailedScores.uiAesthetics.layout = layoutScore;
    results.notes.push(`Layout quality score: ${layoutScore}/3`);
    
    console.log('UI aesthetics evaluation complete');
    
  } catch (error) {
    results.notes.push(`Error evaluating UI: ${error.message}`);
    console.error(`Error evaluating UI: ${error.message}`);
  }
}

// Helper function: Evaluate UX intuitiveness
async function evaluateUXIntuitiveness(page, results) {
  console.log('Evaluating UX intuitiveness...');
  try {
    // Check for navigation elements
    const navigationElements = await page.$$('nav, .navbar, .navigation, ul li a, .menu, #menu, [role="navigation"]');
    
    if (navigationElements.length > 0) {
      results.detailedScores.uxIntuitiveness.navigation = 2;
      results.notes.push('Clear navigation elements found');
    } else {
      // Check for any links that might serve as navigation
      const potentialNavLinks = await page.$$('a');
      if (potentialNavLinks.length >= 3) {
        results.detailedScores.uxIntuitiveness.navigation = 1;
        results.notes.push('Some navigation links found');
      } else {
        results.notes.push('No clear navigation found');
      }
    }
    
    // Check for user feedback mechanisms
    let feedbackScore = 0;
    
    // Look for form validation cues
    const hasValidationAttributes = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      return Array.from(inputs).some(input => 
        input.hasAttribute('required') || 
        input.hasAttribute('pattern') || 
        input.hasAttribute('min') || 
        input.hasAttribute('max') ||
        input.hasAttribute('aria-required')
      );
    });
    
    if (hasValidationAttributes) {
      feedbackScore++;
      results.notes.push('Form validation attributes present');
    }
    
    // Look for visual feedback elements
    const hasFeedbackElements = await page.$$eval('*', elements => {
      return elements.some(el => {
        const text = el.textContent;
        return text && (
          text.includes('Please') || 
          text.includes('required') || 
          text.includes('invalid') || 
          text.includes('success') || 
          text.includes('error')
        );
      });
    });
    
    if (hasFeedbackElements) {
      feedbackScore++;
      results.notes.push('User feedback messages present');
    }
    
    // Look for loading indicators
    const hasLoadingIndicators = await page.$$('.loader, .loading, .spinner, [role="progressbar"]');
    if (hasLoadingIndicators.length > 0) {
      feedbackScore++;
      results.notes.push('Loading indicators present');
    }
    
    results.detailedScores.uxIntuitiveness.userFeedback = Math.min(3, feedbackScore);
    
    // Check for accessibility features
    let accessibilityScore = 0;
    
    // Check for proper HTML5 semantic elements
    const hasSemanticElements = await page.evaluate(() => {
      const semanticTags = ['header', 'footer', 'nav', 'main', 'section', 'article', 'aside'];
      return semanticTags.some(tag => document.querySelector(tag) !== null);
    });
    
    if (hasSemanticElements) {
      accessibilityScore++;
      results.notes.push('Semantic HTML elements used');
    }
    
    // Check for ARIA attributes
    const hasAriaAttributes = await page.evaluate(() => {
      return document.querySelector('[aria-label], [aria-describedby], [aria-hidden], [role]') !== null;
    });
    
    if (hasAriaAttributes) {
      accessibilityScore++;
      results.notes.push('ARIA attributes present');
    }
    
    // Check for proper focus states on interactive elements
    const hasFocusStyles = await page.evaluate(() => {
      // Create a style element to inject a CSS rule that will reveal which elements have focus styles
      const styleEl = document.createElement('style');
      styleEl.textContent = '.focus-test:focus { outline: 5px solid red !important; }';
      document.head.appendChild(styleEl);
      
      // Add and remove the class to all interactive elements
      const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
      let focusStyleCount = 0;
      
      interactiveElements.forEach(el => {
        el.classList.add('focus-test');
        el.focus();
        
        // Check if the element has a computed outline style when focused
        const focusStyle = window.getComputedStyle(el);
        if (focusStyle.outlineStyle !== 'none' && focusStyle.outlineStyle !== '') {
          focusStyleCount++;
        }
        
        el.classList.remove('focus-test');
      });
      
      // Clean up
      document.head.removeChild(styleEl);
      
      return focusStyleCount > 0;
    });
    
    if (hasFocusStyles) {
      accessibilityScore++;
      results.notes.push('Focus styles present on interactive elements');
    }
    
    results.detailedScores.uxIntuitiveness.accessibility = Math.min(3, accessibilityScore);
    
    console.log('UX intuitiveness evaluation complete');
    
  } catch (error) {
    results.notes.push(`Error evaluating UX: ${error.message}`);
    console.error(`Error evaluating UX: ${error.message}`);
  }
}

// Helper functions for filling forms
async function fillLocationFields(page, route) {
  try {
    // Strategy 1: Try placeholders
    const currentLocationInput = await page.$('input[placeholder*="current"], input[placeholder*="start"], input[placeholder*="origin"]');
    const pickupInput = await page.$('input[placeholder*="pickup"]');
    const dropoffInput = await page.$('input[placeholder*="dropoff"], input[placeholder*="destination"]');
    
    let filledCurrentLocation = false, filledPickup = false, filledDropoff = false;
    
    if (currentLocationInput) {
      await currentLocationInput.fill(route.currentLocation);
      filledCurrentLocation = true;
    }
    
    if (pickupInput) {
      await pickupInput.fill(route.pickupLocation);
      filledPickup = true;
    }
    
    if (dropoffInput) {
      await dropoffInput.fill(route.dropoffLocation);
      filledDropoff = true;
    }
    
    // Strategy 2: Try by index of text inputs if first strategy didn't work fully
    if (!filledCurrentLocation || !filledPickup || !filledDropoff) {
      const textInputs = await page.$$('input[type="text"]');
      
      if (textInputs.length >= 3) {
        if (!filledCurrentLocation) await textInputs[0].fill(route.currentLocation);
        if (!filledPickup) await textInputs[1].fill(route.pickupLocation);
        if (!filledDropoff) await textInputs[2].fill(route.dropoffLocation);
      }
    }
    
    // Wait for any autocomplete suggestions
    await page.waitForTimeout(1000);
    
    // Try to select first autocomplete option if any appear
    const autocompleteOptions = await page.$$('.autocomplete-option, .suggestion, [role="option"], .pac-item');
    for (const option of autocompleteOptions) {
      await option.click();
      await page.waitForTimeout(500);
    }
    
    return true;
  } catch (error) {
    console.log(`Error filling location fields: ${error.message}`);
    return false;
  }
}

async function fillHoursField(page, route) {
  try {
    const hoursInput = await page.$('input[placeholder*="hour"], input[placeholder*="cycle"], input[type="number"]');
    
    if (hoursInput) {
      await hoursInput.fill(route.currentCycleUsed.toString());
      return true;
    }
    
    // Fallback: try any number inputs
    const numberInputs = await page.$$('input[type="number"]');
    if (numberInputs.length > 0) {
      await numberInputs[0].fill(route.currentCycleUsed.toString());
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`Error filling hours field: ${error.message}`);
    return false;
  }
}

async function clickSubmitButton(page) {
  try {
    // Try different selectors for submit buttons
    const buttonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Calculate")',
      'button:has-text("Plan")',
      'button:has-text("Generate")',
      'button:has-text("Create")',
      '.submit',
      '#submit',
      'button'
    ];
    
    for (const selector of buttonSelectors) {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        await page.waitForTimeout(2000); // Wait for form submission
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.log(`Error clicking submit button: ${error.message}`);
    return false;
  }
}

// Main evaluation function
async function attemptFormSubmission(page, results, testRoute) {
  console.log('Attempting to fill form and submit...');
  try {
    // Try to fill location fields
    const locationsFilled = await fillLocationFields(page, testRoute);
    
    // Try to fill hours field
    const hoursFilled = await fillHoursField(page, testRoute);
    
    // Try to submit the form
    const formSubmitted = await clickSubmitButton(page);
    
    if (formSubmitted) {
      results.notes.push('Form submitted successfully');
      console.log('Form submitted successfully');
      
      // Wait for results to load
      await page.waitForTimeout(3000);
      
      // Take screenshot of results
      const resultsDir = path.join(__dirname, 'results');
      const resultsScreenshot = path.join(resultsDir, `${results.website}_results.png`);
      await page.screenshot({ path: resultsScreenshot, fullPage: true });
      results.screenshots.push(resultsScreenshot);
      
      // Check for map component
      const hasMap = await checkForMap(page);
      if (hasMap) {
        results.detailedScores.requiredFeatures.routeMap = 3;
        results.notes.push('Route map found in results');
        console.log('Route map found');
      } else {
        // Check for partial map elements
        const hasPartialMap = await page.$$eval('*', elements => {
          return elements.some(el => {
            const text = el.textContent;
            return text && (
              text.includes('Map') || 
              text.includes('Route') || 
              text.includes('Distance') || 
              text.includes('miles')
            );
          });
        });
        
        if (hasPartialMap) {
          results.detailedScores.requiredFeatures.routeMap = 1;
          results.notes.push('Partial route information without full map');
        } else {
          results.notes.push('No route map or route information found');
        }
      }
      
      // Check for ELD logs
      const hasEldLogs = await checkForEldLogs(page);
      if (hasEldLogs) {
        results.detailedScores.requiredFeatures.eldLogs = 3;
        results.notes.push('ELD logs found in results');
        console.log('ELD logs found');
      } else {
        // Check for partial ELD information
        const hasPartialEld = await page.$$eval('*', elements => {
          return elements.some(el => {
            const text = el.textContent;
            return text && (
              text.includes('Hour') || 
              text.includes('Log') || 
              text.includes('ELD') || 
              text.includes('HOS')
            );
          });
        });
        
        if (hasPartialEld) {
          results.detailedScores.requiredFeatures.eldLogs = 1;
          results.notes.push('Partial ELD information found');
        } else {
          results.notes.push('No ELD logs found');
        }
      }
    } else {
      results.notes.push('Unable to submit form');
      console.log('Form submission failed');
    }
  } catch (error) {
    results.notes.push(`Error during form submission: ${error.message}`);
    console.error(`Error during form submission: ${error.message}`);
  }
}

// Helper functions for checking results
async function checkForMap(page) {
  try {
    // Check for common map elements
    const mapElements = await page.$$('.map, #map, [class*="map"], svg, iframe[src*="map"], iframe[src*="google"], canvas, [class*="googleMap"]');
    
    if (mapElements.length > 0) return true;
    
    // Check for Google Maps
    const hasGoogleMaps = await page.evaluate(() => {
      return window.google && window.google.maps;
    }).catch(() => false);
    
    return hasGoogleMaps;
  } catch (error) {
    console.log(`Error checking for map: ${error.message}`);
    return false;
  }
}

async function checkForEldLogs(page) {
  try {
    // Look for ELD-related elements
    const hasEldText = await page.$$eval('*', elements => {
      return elements.some(el => {
        const text = el.textContent;
        return text && (
          text.includes('ELD') || 
          text.includes('Electronic Log') || 
          text.includes('Hours of Service') || 
          text.includes('HOS') ||
          text.includes('Driver Log')
        );
      });
    });
    
    // Look for visual log elements
    const hasLogElements = await page.$$('table, svg, canvas, .log, #log, [class*="log"], [class*="eld"], [class*="chart"]');
    
    return hasEldText || hasLogElements.length > 0;
  } catch (error) {
    console.log(`Error checking for ELD logs: ${error.message}`);
    return false;
  }
}

// Helper function: Evaluate bugs and issues
async function evaluateBugsAndIssues(page, results) {
  console.log('Checking for bugs and issues...');
  try {
    // Store console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Reload page to trigger any console errors
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Wait a bit to collect errors
    await page.waitForTimeout(2000);
    
    // Score console errors (fewer is better)
    if (consoleErrors.length === 0) {
      results.detailedScores.bugs.consoleErrors = 3;
      results.notes.push('No console errors detected');
    } else if (consoleErrors.length <= 3) {
      results.detailedScores.bugs.consoleErrors = 2;
      results.notes.push(`${consoleErrors.length} console errors detected`);
    } else if (consoleErrors.length <= 10) {
      results.detailedScores.bugs.consoleErrors = 1;
      results.notes.push(`${consoleErrors.length} console errors detected`);
    } else {
      results.notes.push(`Multiple console errors detected (${consoleErrors.length})`);
    }
    
    // Test form validation
    try {
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
            text.includes('Please')
          );
        });
      });
      
      if (hasValidation) {
        results.detailedScores.bugs.formValidation = 2;
        results.notes.push('Form validation present');
      } else {
        results.notes.push('Form validation missing');
      }
    } catch (error) {
      console.log(`Error testing form validation: ${error.message}`);
    }
    
    // Check for functional issues
    try {
      // Test if clicking important elements causes errors
      const clickableElements = await page.$$('button, a, .nav-item');
      let clickErrors = 0;
      
      for (let i = 0; i < Math.min(clickableElements.length, 5); i++) {
        try {
          await clickableElements[i].click({ timeout: 1000 });
          await page.waitForTimeout(500);
        } catch {
          clickErrors++;
        }
      }
      
      if (clickErrors === 0) {
        results.detailedScores.bugs.functionalIssues = 3;
        results.notes.push('No functional issues detected with interactive elements');
      } else if (clickErrors <= 2) {
        results.detailedScores.bugs.functionalIssues = 1;
        results.notes.push('Some functional issues detected with interactive elements');
      } else {
        results.notes.push('Multiple functional issues detected with interactive elements');
      }
    } catch (error) {
      console.log(`Error checking for functional issues: ${error.message}`);
    }
  } catch (error) {
    console.log(`Error checking for bugs and issues: ${error.message}`);
  }
}

// Helper function: Calculate final scores
function calculateFinalScores(results) {
  // Implement the logic to calculate final scores based on the detailed scores
  // This is a placeholder and should be replaced with the actual implementation
  results.finalScore = 0; // Placeholder for final score calculation
}

// Helper function: Evaluate ELD accuracy
async function evaluateELDAccuracy(page, results) {
  // Implement the logic to evaluate ELD accuracy
  // This is a placeholder and should be replaced with the actual implementation
  results.detailedScores.eldAccuracy.hosVisualization = 0; // Placeholder for ELD accuracy evaluation
}