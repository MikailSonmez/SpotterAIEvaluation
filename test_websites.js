const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// List of websites to test
const websites = [
  {
    name: 'SpotterLavandesn',
    url: 'https://spotter.lavandesn.com/'
  },
  {
    name: 'TripsFrontendDusky',
    url: 'https://trips-frontend-dusky.vercel.app'
  },
  {
    name: 'EldClientRender',
    url: 'https://eld-client.onrender.com'
  },
  {
    name: 'EldLogAppVercel',
    url: 'https://eld-log-app-git-main-mert-gokhan-donmezs-projects.vercel.app/'
  },
  {
    name: 'TrackingUserApp',
    url: 'https://tracking-user-app.netlify.app/'
  },
  {
    name: 'FrontendNine',
    url: 'https://frontend-nine-phi-12.vercel.app/'
  },
  {
    name: 'TripAppYdoc',
    url: 'https://tripapp-ydoc.onrender.com'
  },
  {
    name: 'TripplannerRailway',
    url: 'https://tripplanner-frontend-production.up.railway.app/'
  },
  {
    name: 'SpotterAILogbook',
    url: 'https://spotter-ai-logbook-react-frontend.vercel.app'
  },
  {
    name: 'DriverLogbook',
    url: 'https://driver-logbook.vercel.app/'
  },
  {
    name: 'TripPlanningLogging',
    url: 'https://trip-planning-logging.netlify.app/'
  },
  {
    name: 'EldLogDuckDNS',
    url: 'http://eldlog.duckdns.org'
  },
  {
    name: 'RouteEldTracker',
    url: 'https://route-eld-tracker-git-main-ilhams-projects-9cb20472.vercel.app/'
  },
  {
    name: 'TrajectSpotter',
    url: 'https://trajectspotterfrontend.onrender.com'
  },
  {
    name: 'EldFrontendCobt',
    url: 'https://eld-frontend-cobt.vercel.app/'
  },
  {
    name: 'TripplannerMu',
    url: 'https://tripplanner-mu.vercel.app/'
  },
  {
    name: 'TripLoggerJet',
    url: 'https://trip-logger-jet.vercel.app'
  },
  {
    name: 'EldTripPlannerFrontend',
    url: 'https://eld-trip-planner-frontend.vercel.app/'
  },
  {
    name: 'SpotterFrontGit',
    url: 'https://spotter-front-git-master-pbnjaays-projects.vercel.app/'
  },
  {
    name: 'TrackDrivers',
    url: 'https://track-drivers.vercel.app/'
  },
  {
    name: 'TruckLogbook',
    url: 'https://truck-logbook.vercel.app/'
  },
  {
    name: 'TripPlannerTau',
    url: 'https://trip-planner-frontend-tau.vercel.app'
  },
  {
    name: 'EldClientVercel',
    url: 'https://eld-client.vercel.app'
  },
  {
    name: 'WeHaulFrontend',
    url: 'https://we-haul-frontend.vercel.app/trips'
  },
  {
    name: 'EldGenerator',
    url: 'https://eld-generator.netlify.app'
  },
  {
    name: 'TripPlannerYphs',
    url: 'https://trip-planner-yphs.onrender.com/'
  },
  {
    name: 'EldFrontendSand',
    url: 'https://eld-frontend-sand.vercel.app/'
  },
  {
    name: 'EldTripTracker',
    url: 'https://eld-trip-tracker.vercel.app/'
  },
  {
    name: 'EldTripPlanner',
    url: 'https://eld-trip-planner.vercel.app/'
  },
  {
    name: 'TripPlannerAppGray',
    url: 'https://trip-planner-app-gray.vercel.app/'
  }
];

// Test data for routes
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
  }
];

// Ensure results directory exists
const resultsDir = path.join(__dirname, 'test_results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

// Main testing function
async function testWebsites() {
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 30000 
  });
  const results = [];

  console.log('Starting website evaluations...');
  
  for (const website of websites) {
    console.log(`\n===== Testing ${website.name} (${website.url}) =====`);
    
    const evaluationResults = {
      website: website.name,
      url: website.url,
      scores: {
        ui: 0,
        ux: 0,
        bugs: 0,
        total: 0
      },
      notes: [],
      screenshots: [],
      status: 'not_tested',
      requiredFeatures: 0,
      eldAccuracy: 0,
      uxIntuitiveness: 0,
      uiAesthetics: 0,
      bugs: 0
    };

    try {
      const page = await browser.newPage();
      console.log(`Navigating to ${website.url}...`);
      
      try {
        await page.goto(website.url, { timeout: 30000 });
        console.log('Page loaded successfully');
        
        // Test 1: Try to load the website
        try {
          await page.waitForLoadState('networkidle', { timeout: 60000 });
          
          // Take screenshot
          const screenshotPath = path.join(resultsDir, `${website.name}_initial.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          evaluationResults.screenshots.push(screenshotPath);
          
          evaluationResults.notes.push('Website loaded successfully');
          evaluationResults.status = 'loaded';
          console.log('Initial page load successful and screenshot taken');
        } catch (error) {
          console.error(`Error during initial page load: ${error.message}`);
          evaluationResults.notes.push(`Error loading website: ${error.message}`);
          evaluationResults.status = 'load_failed';
          continue; // Skip further testing if site doesn't load
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
            evaluationResults.notes.push('Required input fields found');
            console.log('Required input fields found');
          } else {
            evaluationResults.notes.push('Missing some required input fields');
            console.log('Missing some required input fields');
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
          
          if (hasCurrentLocationLabel && hasPickupLabel && hasDropoffLabel && hasHoursLabel) {
            evaluationResults.requiredFeatures += 1;
            evaluationResults.notes.push('All required input labels present');
            console.log('All required input labels present');
          } else {
            evaluationResults.notes.push('Some input labels missing or unclear');
            console.log('Some input labels missing or unclear');
          }
        } catch (error) {
          console.error(`Error checking input fields: ${error.message}`);
          evaluationResults.notes.push(`Error checking input fields: ${error.message}`);
        }
        
        // Test 3: Try to fill form and submit
        console.log('Attempting to fill form and submit...');
        try {
          const route = testRoutes[0]; // Use the first test route
          
          // Look for form fields
          const inputFields = await page.$$('input[type="text"], input[type="number"]');
          if (inputFields.length >= 4) {
            // Try to fill location fields
            await fillLocationFields(page, route);
            console.log('Location fields filled');
            
            await fillHoursField(page, route);
            console.log('Hours field filled');
            
            // Click submit button
            const submitted = await clickSubmitButton(page);
            
            if (submitted) {
              console.log('Form submitted successfully');
              // Wait for results to load
              await page.waitForTimeout(5000);
              
              // Take screenshot of results
              const resultsScreenshot = path.join(resultsDir, `${website.name}_results.png`);
              await page.screenshot({ path: resultsScreenshot, fullPage: true });
              evaluationResults.screenshots.push(resultsScreenshot);
              console.log('Results screenshot taken');
              
              // Check for map
              const hasMap = await checkForMap(page);
              if (hasMap) {
                evaluationResults.requiredFeatures += 1;
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
                evaluationResults.notes.push('ELD logs found');
                console.log('ELD logs found');
              } else {
                evaluationResults.notes.push('No ELD logs found in results');
                console.log('No ELD logs found in results');
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
          
          const mobileScreenshot = path.join(resultsDir, `${website.name}_mobile.png`);
          await page.screenshot({ path: mobileScreenshot });
          evaluationResults.screenshots.push(mobileScreenshot);
          console.log('Mobile viewport screenshot taken');
          
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
          evaluationResults.scores.ui += styleConsistency;
          evaluationResults.notes.push(styleConsistency ? 
            'Design appears to have consistent styling' : 
            'Design lacks style consistency');
          console.log(styleConsistency ? 'Design appears consistent' : 'Design lacks consistency');
          
          // Check for professional elements
          const hasLogo = await page.$('img[alt*="logo"], img[src*="logo"], .logo, #logo');
          const hasFooter = await page.$('footer, .footer, #footer');
          const professionalScore = (hasLogo ? 1 : 0) + (hasFooter ? 1 : 0);
          
          evaluationResults.uiAesthetics += professionalScore;
          evaluationResults.scores.ui += professionalScore;
          evaluationResults.notes.push(`Professional UI elements score: ${professionalScore}/2`);
          console.log(`Professional UI elements score: ${professionalScore}/2`);
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
          }
          
          // Score based on errors (fewer is better)
          const bugScore = Math.min(consoleErrors.length, 5);
          evaluationResults.bugs = 5 - bugScore;
          evaluationResults.scores.bugs = 5 - bugScore;
          
          if (consoleErrors.length > 0) {
            evaluationResults.notes.push(`Found ${consoleErrors.length} console errors`);
            console.log(`Found ${consoleErrors.length} console errors`);
          } else {
            evaluationResults.notes.push('No console errors detected');
            console.log('No console errors detected');
          }
        } catch (error) {
          console.error(`Error during bugs evaluation: ${error.message}`);
          evaluationResults.notes.push(`Error checking for bugs: ${error.message}`);
        }
        
        // Calculate final score
        console.log('Calculating final scores...');
        evaluationResults.scores.total = (
          evaluationResults.scores.ui +
          evaluationResults.scores.ux +
          evaluationResults.scores.bugs
        ) / 3;
        
        // Save the results
        console.log(`Saving results for ${website.name}...`);
        fs.writeFileSync(
          path.join(resultsDir, `${website.name}_evaluation.json`),
          JSON.stringify(evaluationResults, null, 2)
        );
        
      } catch (error) {
        console.error(`Failed to load ${website.url}: ${error.message}`);
        evaluationResults.notes.push(`Failed to load page: ${error.message}`);
        evaluationResults.scores.total = 0;
        evaluationResults.status = 'load_failed';
      }
      
      results.push(evaluationResults);
      console.log(`Completed evaluation of ${website.name}`);
      await page.close();
      
    } catch (error) {
      console.error(`Fatal error testing ${website.name}: ${error.message}`);
      evaluationResults.notes.push(`Fatal error: ${error.message}`);
      evaluationResults.status = 'fatal_error';
      results.push(evaluationResults);
    }
  }

  // Generate summary
  console.log('\nGenerating evaluation summary...');
  const summary = {
    totalWebsites: websites.length,
    averageScore: results.reduce((sum, r) => sum + r.scores.total, 0) / results.length,
    highestScore: Math.max(...results.map(r => r.scores.total)),
    lowestScore: Math.min(...results.map(r => r.scores.total)),
    websiteRanking: results
      .sort((a, b) => b.scores.total - a.scores.total)
      .map(r => ({
        name: r.website,
        score: r.scores.total
      }))
  };

  // Save results
  console.log('Saving all evaluation results...');
  fs.writeFileSync(
    path.join(resultsDir, 'all_evaluations.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('Saving summary...');
  fs.writeFileSync(
    path.join(resultsDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  await browser.close();
  console.log('\n===== Evaluation complete! =====');
  console.log(`Results saved to ${resultsDir}`);
  
  // Return top 3 sites
  const top3 = summary.websiteRanking.slice(0, 3);
  console.log('Top 3 websites:');
  top3.forEach((site, index) => {
    console.log(`${index + 1}. ${site.name} - Score: ${site.score.toFixed(1)}`);
  });
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

// Run the tests
testWebsites().catch(console.error); 