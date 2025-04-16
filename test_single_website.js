const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Get website URL from command line argument
const websiteUrl = process.argv[2];
if (!websiteUrl) {
  console.error("Please provide a website URL as an argument");
  process.exit(1);
}

// Create a website name from the URL
const websiteName = websiteUrl.replace(/https?:\/\//, '')
                             .replace(/\/$/, '')
                             .replace(/[^\w.-]/g, '_');

// Ensure results directory exists
const resultsDir = path.join(__dirname, 'test_results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

// Test data for routes
const testRoute = {
  currentLocation: 'Chicago, IL',
  pickupLocation: 'Indianapolis, IN',
  dropoffLocation: 'Cincinnati, OH',
  currentCycleUsed: 2
};

// Main testing function
async function testWebsite() {
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 30000 
  });
  
  console.log(`\n===== Testing ${websiteName} (${websiteUrl}) =====`);
  
  const evaluationResults = {
    website: websiteName,
    url: websiteUrl,
    scores: {
      ui: 0,
      ux: 0,
      bugs: 0,
      eldAccuracy: 0,
      requiredFeatures: 0,
      total: 0
    },
    notes: [],
    screenshots: [],
    status: 'not_tested',
    requiredFeatures: 0,
    eldAccuracy: 0,
    uxIntuitiveness: 0,
    uiAesthetics: 0,
    bugs: 0,
    detailedScores: {
      // 1. Accuracy of ELD drawings
      eldAccuracy: {
        hosRepresentation: 0, // 0-2 points
        statusChanges: 0,     // 0-2 points
        driveTimeCalculation: 0, // 0-2 points
        breaksRepresentation: 0,  // 0-2 points
        total: 0              // out of 8
      },
      // 2. Required inputs and outputs
      requiredFeatures: {
        inputFields: 0,       // 0-2 points
        routeMap: 0,          // 0-2 points
        stopRestInfo: 0,      // 0-2 points
        logSheets: 0,         // 0-2 points
        total: 0              // out of 8
      },
      // 3. UI aesthetics
      uiAesthetics: {
        visualDesign: 0,      // 0-2 points
        colorScheme: 0,       // 0-2 points
        layout: 0,            // 0-2 points
        responsiveDesign: 0,  // 0-2 points
        total: 0              // out of 8
      },
      // 4. UX intuitiveness
      uxIntuitiveness: {
        navigation: 0,        // 0-2 points
        workflow: 0,          // 0-2 points
        predictability: 0,    // 0-2 points
        feedback: 0,          // 0-2 points
        total: 0              // out of 8
      },
      // 5. Bugs
      bugs: {
        formValidation: 0,    // 0-2 points
        calculationErrors: 0, // 0-2 points
        visualGlitches: 0,    // 0-2 points
        functionalProblems: 0, // 0-2 points
        total: 0              // out of 8
      }
    }
  };

  try {
    const page = await browser.newPage();
    
    // Maximize the browser window
    const context = page.context();
    await context.browser().newContext({ viewport: null });
    await page.evaluate(() => {
      window.moveTo(0, 0);
      window.resizeTo(screen.availWidth, screen.availHeight);
    });
    
    console.log(`Navigating to ${websiteUrl}...`);
    
    try {
      await page.goto(websiteUrl, { timeout: 30000 });
      console.log('Page loaded successfully');
      
      // Test 1: Try to load the website
      try {
        await page.waitForLoadState('networkidle', { timeout: 30000 });
        
        // Take screenshot
        const screenshotPath = path.join(resultsDir, `${websiteName}_initial.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        evaluationResults.screenshots.push(screenshotPath);
        
        evaluationResults.notes.push('Website loaded successfully');
        evaluationResults.status = 'loaded';
        console.log('Initial page load successful and screenshot taken');
      } catch (error) {
        console.error(`Error during initial page load: ${error.message}`);
        evaluationResults.notes.push(`Error loading website: ${error.message}`);
        evaluationResults.status = 'load_failed';
        throw new Error("Failed to load page completely");
      }
      
      // Test 2: Check for required input fields
      console.log('Checking for required input fields...');
      try {
        // Look for location inputs
        const locationInputs = await page.$$('input[type="text"], [placeholder*="location"], [name*="location"], [id*="location"]');
        const hoursInput = await page.$$('input[type="number"], [placeholder*="hour"], [name*="hour"], [id*="hour"], [id*="cycle"]');
        
        // Check if required inputs are found
        const hasRequiredInputs = locationInputs.length >= 3 && hoursInput.length >= 1;
        if (hasRequiredInputs) {
          evaluationResults.requiredFeatures += 1;
          evaluationResults.detailedScores.requiredFeatures.inputFields += 2;
          evaluationResults.notes.push('Required input fields found');
          console.log('Required input fields found');
        } else if (locationInputs.length >= 2) {
          evaluationResults.requiredFeatures += 0.5;
          evaluationResults.detailedScores.requiredFeatures.inputFields += 1;
          evaluationResults.notes.push('Some required input fields found');
          console.log('Some required input fields found');
        } else {
          evaluationResults.notes.push('Missing most required input fields');
          console.log('Missing most required input fields');
        }
        
        // Check for field labels
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
        
        // Calculate label score
        const labelScore = [hasCurrentLocationLabel, hasPickupLabel, hasDropoffLabel, hasHoursLabel].filter(Boolean).length;
        
        if (labelScore >= 3) {
          evaluationResults.notes.push('All required input labels present');
          console.log('All required input labels present');
          evaluationResults.detailedScores.uxIntuitiveness.predictability += 1;
        } else if (labelScore >= 2) {
          evaluationResults.notes.push('Some input labels present');
          console.log('Some input labels present');
          evaluationResults.detailedScores.uxIntuitiveness.predictability += 0.5;
        } else {
          evaluationResults.notes.push('Most input labels missing or unclear');
          console.log('Most input labels missing or unclear');
        }
      } catch (error) {
        console.error(`Error checking input fields: ${error.message}`);
        evaluationResults.notes.push(`Error checking input fields: ${error.message}`);
      }
      
      // Test 3: Try to fill form and submit
      console.log('Attempting to fill form and submit...');
      try {
        // Look for form fields
        const inputFields = await page.$$('input[type="text"], input[type="number"]');
        if (inputFields.length >= 4) {
          // Try to fill location fields
          await fillLocationFields(page, testRoute);
          console.log('Location fields filled');
          
          await fillHoursField(page, testRoute);
          console.log('Hours field filled');
          
          // Click submit button
          const submitted = await clickSubmitButton(page);
          
          if (submitted) {
            console.log('Form submitted successfully');
            evaluationResults.detailedScores.uxIntuitiveness.workflow += 1;
            
            // Wait for results to load
            await page.waitForTimeout(5000);
            
            // Take screenshot of results
            const resultsScreenshot = path.join(resultsDir, `${websiteName}_results.png`);
            await page.screenshot({ path: resultsScreenshot, fullPage: true });
            evaluationResults.screenshots.push(resultsScreenshot);
            console.log('Results screenshot taken');
            
            // Check for map
            const hasMap = await checkForMap(page);
            if (hasMap) {
              evaluationResults.requiredFeatures += 1;
              evaluationResults.detailedScores.requiredFeatures.routeMap += 2;
              evaluationResults.notes.push('Map output found');
              console.log('Map output found');
            } else {
              evaluationResults.notes.push('No map found in results');
              console.log('No map found in results');
            }
            
            // Check for ELD logs
            const hasEldLogs = await checkForEldLogs(page);
            if (hasEldLogs) {
              evaluationResults.eldAccuracy += 2;
              evaluationResults.detailedScores.eldAccuracy.hosRepresentation += 1;
              evaluationResults.detailedScores.requiredFeatures.logSheets += 1;
              evaluationResults.notes.push('ELD logs found');
              console.log('ELD logs found');
              
              // Check for more detailed ELD elements
              const hasHosText = await page.$$eval('*', elements => {
                return elements.some(el => {
                  const text = el.textContent;
                  return text && (text.includes('Hours of Service') || text.includes('HOS'));
                });
              });
              
              if (hasHosText) {
                evaluationResults.detailedScores.eldAccuracy.hosRepresentation += 1;
                evaluationResults.notes.push('HOS information present');
              }
              
              // Look for status changes
              const hasStatusChanges = await page.$$eval('*', elements => {
                return elements.some(el => {
                  const text = el.textContent;
                  return text && (
                    text.includes('Status') || 
                    text.includes('Duty') || 
                    text.includes('On Duty') || 
                    text.includes('Off Duty') || 
                    text.includes('Driving')
                  );
                });
              });
              
              if (hasStatusChanges) {
                evaluationResults.detailedScores.eldAccuracy.statusChanges += 2;
                evaluationResults.notes.push('Status changes displayed');
              }
              
              // Look for drive time calculation
              const hasDriveTime = await page.$$eval('*', elements => {
                return elements.some(el => {
                  const text = el.textContent;
                  return text && (
                    text.includes('Drive Time') || 
                    text.includes('Driving Hours') || 
                    text.includes('Available Hours') || 
                    text.includes('Remaining')
                  );
                });
              });
              
              if (hasDriveTime) {
                evaluationResults.detailedScores.eldAccuracy.driveTimeCalculation += 2;
                evaluationResults.notes.push('Drive time calculations present');
              }
              
              // Look for breaks
              const hasBreaks = await page.$$eval('*', elements => {
                return elements.some(el => {
                  const text = el.textContent;
                  return text && (
                    text.includes('Break') || 
                    text.includes('Rest') || 
                    text.includes('Sleep')
                  );
                });
              });
              
              if (hasBreaks) {
                evaluationResults.detailedScores.eldAccuracy.breaksRepresentation += 2;
                evaluationResults.notes.push('Breaks representation present');
              }
              
            } else {
              evaluationResults.notes.push('No ELD logs found in results');
              console.log('No ELD logs found in results');
            }
            
            // Check for stop/rest information
            const hasStopInfo = await page.$$eval('*', elements => {
              return elements.some(el => {
                const text = el.textContent;
                return text && (
                  text.includes('Stop') || 
                  text.includes('Rest') || 
                  text.includes('Break') ||
                  text.includes('Station') ||
                  text.includes('Point')
                );
              });
            });
            
            if (hasStopInfo) {
              evaluationResults.detailedScores.requiredFeatures.stopRestInfo += 2;
              evaluationResults.notes.push('Stop/rest information present');
            }
            
          } else {
            evaluationResults.notes.push('Could not submit form');
            console.log('Could not submit form');
          }
        } else {
          evaluationResults.notes.push('Insufficient input fields to complete form');
          console.log('Insufficient input fields to complete form');
        }
      } catch (error) {
        console.error(`Error testing form submission: ${error.message}`);
        evaluationResults.notes.push(`Error testing form submission: ${error.message}`);
      }
      
      // Test 4: UI aesthetics
      console.log('Evaluating UI aesthetics...');
      try {
        // Check responsive design
        const viewport = page.viewportSize();
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        
        const mobileScreenshot = path.join(resultsDir, `${websiteName}_mobile.png`);
        await page.screenshot({ path: mobileScreenshot });
        evaluationResults.screenshots.push(mobileScreenshot);
        console.log('Mobile viewport screenshot taken');
        
        // Check if mobile version looks significantly different
        const mobileElements = await page.$$('*');
        const isMobileResponsive = mobileElements.length > 0;
        
        if (isMobileResponsive) {
          evaluationResults.detailedScores.uiAesthetics.responsiveDesign += 2;
          evaluationResults.notes.push('Mobile responsive design detected');
        }
        
        // Reset viewport
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Check styling consistency
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
        evaluationResults.uiAesthetics += styleConsistency;
        evaluationResults.detailedScores.uiAesthetics.visualDesign += styleConsistency;
        evaluationResults.notes.push(styleConsistency ? 
          'Design appears to have consistent styling' : 
          'Design lacks style consistency');
        console.log(styleConsistency ? 'Design appears consistent' : 'Design lacks consistency');
        
        // Check color scheme
        const colors = await page.evaluate(() => {
          const uniqueColors = new Set();
          const elements = document.querySelectorAll('*');
          elements.forEach(el => {
            const style = window.getComputedStyle(el);
            uniqueColors.add(style.color);
            uniqueColors.add(style.backgroundColor);
            uniqueColors.add(style.borderColor);
          });
          return Array.from(uniqueColors);
        });
        
        // Rate color scheme: good design typically uses 3-5 main colors
        if (colors.length >= 3 && colors.length <= 10) {
          evaluationResults.detailedScores.uiAesthetics.colorScheme += 2;
          evaluationResults.notes.push('Good color scheme with appropriate number of colors');
        } else if (colors.length > 10) {
          evaluationResults.detailedScores.uiAesthetics.colorScheme += 1;
          evaluationResults.notes.push('Too many colors used in design');
        } else {
          evaluationResults.notes.push('Too few colors used in design');
        }
        
        // Check for professional elements
        const hasLogo = await page.$('img[alt*="logo"], img[src*="logo"], .logo, #logo');
        const hasFooter = await page.$('footer, .footer, #footer');
        const hasHeader = await page.$('header, .header, #header');
        const hasNav = await page.$('nav, .nav, #nav');
        
        const professionalElementsCount = [hasLogo, hasFooter, hasHeader, hasNav].filter(Boolean).length;
        
        // Calculate layout score based on professional elements
        const layoutScore = Math.min(2, professionalElementsCount);
        evaluationResults.detailedScores.uiAesthetics.layout += layoutScore;
        
        evaluationResults.uiAesthetics += layoutScore;
        evaluationResults.scores.ui += layoutScore;
        evaluationResults.notes.push(`Professional UI elements score: ${professionalElementsCount}/4`);
        console.log(`Professional UI elements score: ${professionalElementsCount}/4`);
      } catch (error) {
        console.error(`Error during UI evaluation: ${error.message}`);
        evaluationResults.notes.push(`UI evaluation error: ${error.message}`);
      }
      
      // Test 5: UX intuitiveness
      console.log('Evaluating UX intuitiveness...');
      try {
        // Check form validation
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
            evaluationResults.scores.ux += 1;
            evaluationResults.detailedScores.uxIntuitiveness.feedback += 2;
            evaluationResults.detailedScores.bugs.formValidation += 2;
            evaluationResults.notes.push('Form validation present');
            console.log('Form validation present');
          } else {
            evaluationResults.notes.push('No form validation found');
            console.log('No form validation found');
          }
        }
        
        // Check for navigation
        const hasNavigation = await page.$$('nav, .nav, #nav, .navbar, header a, .menu');
        if (hasNavigation.length > 0) {
          evaluationResults.uxIntuitiveness += 1;
          evaluationResults.scores.ux += 1;
          evaluationResults.detailedScores.uxIntuitiveness.navigation += 2;
          evaluationResults.notes.push('Navigation elements found');
          console.log('Navigation elements found');
        } else {
          evaluationResults.notes.push('No clear navigation found');
          console.log('No clear navigation found');
        }
        
        // Check for help text or tooltips
        const hasHelp = await page.$$('*[title], [data-tooltip], .tooltip, .help, [aria-describedby]');
        if (hasHelp.length > 0) {
          evaluationResults.uxIntuitiveness += 1;
          evaluationResults.scores.ux += 1;
          evaluationResults.detailedScores.uxIntuitiveness.workflow += 1;
          evaluationResults.notes.push('Help elements found');
          console.log('Help elements found');
        } else {
          evaluationResults.notes.push('No help elements found');
          console.log('No help elements found');
        }
      } catch (error) {
        console.error(`Error during UX evaluation: ${error.message}`);
        evaluationResults.notes.push(`UX evaluation error: ${error.message}`);
      }
      
      // Test 6: Bug check
      console.log('Checking for bugs and issues...');
      try {
        // Check console for errors
        const consoleErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        // Reload the page to trigger any console errors
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Try entering invalid input
        const locations = await page.$$('input[type="text"]');
        if (locations.length > 0) {
          await locations[0].fill('!@#$%^&*()');
          await clickSubmitButton(page);
          await page.waitForTimeout(1000);
          
          // Check for invalid input handling
          const hasErrorMsg = await page.$$eval('*', elements => {
            return elements.some(el => {
              const text = el.textContent;
              return text && (
                text.includes('invalid') || 
                text.includes('error') || 
                text.includes('incorrect')
              );
            });
          });
          
          if (hasErrorMsg) {
            evaluationResults.detailedScores.bugs.formValidation += 2;
            evaluationResults.notes.push('Invalid input handling present');
          }
        }
        
        // Look for visual glitches
        const visualGlitches = await page.evaluate(() => {
          // Check for elements with negative margins, overlapping text, unusual positions
          const elements = document.querySelectorAll('*');
          let glitchCount = 0;
          
          for (const el of elements) {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            
            // Detect offscreen elements that might be visible
            if (rect.width > 0 && rect.height > 0) {
              if (rect.right < 0 || rect.bottom < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight) {
                glitchCount++;
              }
              
              // Detect overlapping text that might be unreadable
              if (el.tagName === 'P' || el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'H1' || el.tagName === 'H2') {
                if (parseFloat(style.opacity) < 0.5 && parseFloat(style.opacity) > 0) {
                  glitchCount++;
                }
              }
            }
          }
          
          return glitchCount;
        });
        
        if (visualGlitches < 5) {
          evaluationResults.detailedScores.bugs.visualGlitches += 2;
          evaluationResults.notes.push('Few or no visual glitches detected');
        } else if (visualGlitches < 15) {
          evaluationResults.detailedScores.bugs.visualGlitches += 1;
          evaluationResults.notes.push('Some visual glitches detected');
        } else {
          evaluationResults.notes.push('Many visual glitches detected');
        }
        
        // Score based on errors (fewer is better)
        const bugScore = Math.min(consoleErrors.length, 5);
        const calculationErrorsScore = 2 - Math.min(2, bugScore);
        evaluationResults.detailedScores.bugs.calculationErrors += calculationErrorsScore;
        
        evaluationResults.bugs = 5 - bugScore;
        evaluationResults.scores.bugs = 5 - bugScore;
        
        if (consoleErrors.length > 0) {
          evaluationResults.notes.push(`Found ${consoleErrors.length} console errors`);
          console.log(`Found ${consoleErrors.length} console errors`);
        } else {
          evaluationResults.notes.push('No console errors detected');
          console.log('No console errors detected');
          evaluationResults.detailedScores.bugs.functionalProblems += 2;
        }
      } catch (error) {
        console.error(`Error during bugs evaluation: ${error.message}`);
        evaluationResults.notes.push(`Error checking for bugs: ${error.message}`);
      }
      
      // Calculate totals for detailed scores
      evaluationResults.detailedScores.eldAccuracy.total = 
        evaluationResults.detailedScores.eldAccuracy.hosRepresentation +
        evaluationResults.detailedScores.eldAccuracy.statusChanges +
        evaluationResults.detailedScores.eldAccuracy.driveTimeCalculation +
        evaluationResults.detailedScores.eldAccuracy.breaksRepresentation;
      
      evaluationResults.detailedScores.requiredFeatures.total = 
        evaluationResults.detailedScores.requiredFeatures.inputFields +
        evaluationResults.detailedScores.requiredFeatures.routeMap +
        evaluationResults.detailedScores.requiredFeatures.stopRestInfo +
        evaluationResults.detailedScores.requiredFeatures.logSheets;
      
      evaluationResults.detailedScores.uiAesthetics.total = 
        evaluationResults.detailedScores.uiAesthetics.visualDesign +
        evaluationResults.detailedScores.uiAesthetics.colorScheme +
        evaluationResults.detailedScores.uiAesthetics.layout +
        evaluationResults.detailedScores.uiAesthetics.responsiveDesign;
      
      evaluationResults.detailedScores.uxIntuitiveness.total = 
        evaluationResults.detailedScores.uxIntuitiveness.navigation +
        evaluationResults.detailedScores.uxIntuitiveness.workflow +
        evaluationResults.detailedScores.uxIntuitiveness.predictability +
        evaluationResults.detailedScores.uxIntuitiveness.feedback;
      
      evaluationResults.detailedScores.bugs.total = 
        evaluationResults.detailedScores.bugs.formValidation +
        evaluationResults.detailedScores.bugs.calculationErrors +
        evaluationResults.detailedScores.bugs.visualGlitches +
        evaluationResults.detailedScores.bugs.functionalProblems;
      
      // Calculate final scores
      console.log('Calculating final scores...');
      evaluationResults.scores.eldAccuracy = evaluationResults.detailedScores.eldAccuracy.total;
      evaluationResults.scores.requiredFeatures = evaluationResults.detailedScores.requiredFeatures.total;
      evaluationResults.scores.ui = evaluationResults.detailedScores.uiAesthetics.total;
      evaluationResults.scores.ux = evaluationResults.detailedScores.uxIntuitiveness.total;
      evaluationResults.scores.bugs = evaluationResults.detailedScores.bugs.total;
      
      evaluationResults.scores.total = (
        evaluationResults.scores.ui +
        evaluationResults.scores.ux +
        evaluationResults.scores.bugs +
        evaluationResults.scores.eldAccuracy +
        evaluationResults.scores.requiredFeatures
      ) / 5;
      
      // Save the results
      console.log(`Saving results for ${websiteName}...`);
      fs.writeFileSync(
        path.join(resultsDir, `${websiteName}_evaluation.json`),
        JSON.stringify(evaluationResults, null, 2)
      );
      
    } catch (error) {
      console.error(`Failed to load ${websiteUrl}: ${error.message}`);
      evaluationResults.notes.push(`Failed to load page: ${error.message}`);
      evaluationResults.scores.total = 0;
      evaluationResults.status = 'load_failed';
    }
    
    console.log(`Completed evaluation of ${websiteName}`);
    await page.close();
    
  } catch (error) {
    console.error(`Fatal error testing ${websiteName}: ${error.message}`);
    evaluationResults.notes.push(`Fatal error: ${error.message}`);
    evaluationResults.status = 'fatal_error';
  }

  await browser.close();
  console.log('\n===== Evaluation complete! =====');
  
  // Return the results
  return evaluationResults;
}

// Helper functions
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
    
    return true;
  } catch (error) {
    console.log(`Error filling location fields: ${error.message}`);
    return false;
  }
}

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
    
    return true;
  } catch (error) {
    console.log(`Error filling hours field: ${error.message}`);
    return false;
  }
}

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

// Run the test and display the results
testWebsite()
  .then(results => {
    console.log("\nEvaluation Results Summary:");
    console.log("---------------------------");
    console.log(`Website: ${results.website}`);
    console.log(`URL: ${results.url}`);
    console.log(`Status: ${results.status}`);
    console.log(`UI Score: ${results.scores.ui}`);
    console.log(`UX Score: ${results.scores.ux}`);
    console.log(`Bugs Score: ${results.scores.bugs}`);
    console.log(`Total Score: ${results.scores.total.toFixed(2)}`);
    console.log(`Screenshots: ${results.screenshots.length}`);
    console.log("\nDetailed Notes:");
    results.notes.forEach((note, i) => console.log(`${i+1}. ${note}`));
  })
  .catch(console.error); 