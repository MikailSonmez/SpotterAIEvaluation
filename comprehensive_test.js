const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// List of websites to test
const websites = [
  { name: 'SpotterLavandesn', url: 'https://spotter.lavandesn.com/' },
  { name: 'TripsFrontend', url: 'https://trips-frontend-dusky.vercel.app' },
  { name: 'EldClient', url: 'https://eld-client.onrender.com' },
  { name: 'EldLogApp', url: 'https://eld-log-app-git-main-mert-gokhan-donmezs-projects.vercel.app/' },
  { name: 'TrackingUserApp', url: 'https://tracking-user-app.netlify.app/' },
  { name: 'FrontendNine', url: 'https://frontend-nine-phi-12.vercel.app/' },
  { name: 'TripappYdoc', url: 'https://tripapp-ydoc.onrender.com' },
  { name: 'TripplannerFrontend', url: 'https://tripplanner-frontend-production.up.railway.app/' },
  { name: 'SpotterAiLogbook', url: 'https://spotter-ai-logbook-react-frontend.vercel.app' },
  { name: 'DriverLogbook', url: 'https://driver-logbook.vercel.app/' },
  { name: 'TripPlanningLogging', url: 'https://trip-planning-logging.netlify.app/' },
  { name: 'EldLog', url: 'http://eldlog.duckdns.org' },
  { name: 'RouteELDTracker', url: 'https://route-eld-tracker-git-main-ilhams-projects-9cb20472.vercel.app/' },
  { name: 'TrajectSpotter', url: 'https://trajectspotterfrontend.onrender.com' },
  { name: 'EldFrontendCobt', url: 'https://eld-frontend-cobt.vercel.app/' },
  { name: 'TripplannerMu', url: 'https://tripplanner-mu.vercel.app/' },
  { name: 'TripLogger', url: 'https://trip-logger-jet.vercel.app' },
  { name: 'EldTripPlanner', url: 'https://eld-trip-planner-frontend.vercel.app/' },
  { name: 'SpotterFront', url: 'https://spotter-front-git-master-pbnjaays-projects.vercel.app/' },
  { name: 'TrackDrivers', url: 'https://track-drivers.vercel.app/' },
  { name: 'TruckLogbook', url: 'https://truck-logbook.vercel.app/' },
  { name: 'TripPlannerFrontend', url: 'https://trip-planner-frontend-tau.vercel.app' },
  { name: 'EldClientVercel', url: 'https://eld-client.vercel.app' },
  { name: 'WeHaulFrontend', url: 'https://we-haul-frontend.vercel.app/trips' },
  { name: 'EldGenerator', url: 'https://eld-generator.netlify.app' },
  { name: 'TripPlannerYphs', url: 'https://trip-planner-yphs.onrender.com/' },
  { name: 'EldFrontendSand', url: 'https://eld-frontend-sand.vercel.app/' },
  { name: 'EldTripTracker', url: 'https://eld-trip-tracker.vercel.app/' },
  { name: 'EldTripPlannerApp', url: 'https://eld-trip-planner.vercel.app/' },
  { name: 'TripPlannerAppGray', url: 'https://trip-planner-app-gray.vercel.app/' }
];

// Ensure results directory exists
const resultsDir = path.join(__dirname, 'comprehensive_results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

// Test data for forms
const testData = {
  locations: [
    'Chicago, IL',
    'New York, NY',
    'Los Angeles, CA',
    'Houston, TX',
    'Phoenix, AZ'
  ],
  hours: [
    '8',
    '10',
    '4',
    '2',
    '6'
  ],
  names: [
    'John Smith',
    'Jane Doe',
    'Bob Johnson',
    'Alice Williams',
    'Carlos Rodriguez'
  ],
  emails: [
    'test@example.com',
    'driver@trucking.com',
    'dispatch@logistics.net',
    'info@eldtesting.org',
    'support@driverlog.io'
  ],
  phones: [
    '555-123-4567',
    '(800) 555-1234',
    '312-555-6789',
    '213-555-9876',
    '800.555.4321'
  ],
  dates: [
    '2023-04-15',
    '2023-05-01',
    '2023-04-20',
    '2023-04-30',
    '2023-05-15'
  ],
  randomText: [
    'Test input',
    'ELD compliance check',
    'Driver log verification',
    'Hours of Service test',
    'Route planning test'
  ]
};

async function comprehensiveTest(website) {
  console.log(`\n==========================================`);
  console.log(`STARTING COMPREHENSIVE TEST FOR: ${website.name}`);
  console.log(`URL: ${website.url}`);
  console.log(`==========================================\n`);
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Initialize results
  const testResults = {
    name: website.name,
    url: website.url,
    date: new Date().toISOString(),
    status: 'incomplete',
    loadSuccess: false,
    interactiveElements: {
      buttons: 0,
      inputFields: 0,
      dropdowns: 0,
      checkboxes: 0,
      radioButtons: 0,
      links: 0
    },
    accessibilityIssues: 0,
    formSubmission: false,
    navigationTested: false,
    modalsTested: false,
    loginTested: false,
    errors: [],
    screenshots: [],
    notes: []
  };
  
  try {
    // Step 1: Load the website
    console.log("Loading website...");
    await page.goto(website.url, { timeout: 60000, waitUntil: 'networkidle' });
    testResults.loadSuccess = true;
    testResults.notes.push("Website loaded successfully");
    console.log("Website loaded successfully");
    
    // Take initial screenshot
    const initialScreenshotPath = path.join(resultsDir, `${website.name}_initial.png`);
    await page.screenshot({ path: initialScreenshotPath, fullPage: true });
    testResults.screenshots.push(initialScreenshotPath);
    
    // Step 2: Count all interactive elements
    console.log("Counting interactive elements...");
    testResults.interactiveElements = await countInteractiveElements(page);
    console.log(`Found: ${JSON.stringify(testResults.interactiveElements)}`);
    
    // Step 3: Test all clickable elements
    console.log("Testing all clickable elements...");
    await testClickableElements(page, testResults);
    
    // Step 4: Test all form fields
    console.log("Testing form fields...");
    await testFormFields(page, testResults);
    
    // Step 5: Test navigation
    console.log("Testing navigation...");
    await testNavigation(page, testResults);
    
    // Step 6: Test login if available
    console.log("Testing login functionality if available...");
    await testLogin(page, testResults);
    
    // Step 7: Final screenshot
    console.log("Taking final screenshot...");
    const finalScreenshotPath = path.join(resultsDir, `${website.name}_final.png`);
    await page.screenshot({ path: finalScreenshotPath, fullPage: true });
    testResults.screenshots.push(finalScreenshotPath);
    
    testResults.status = 'complete';
    console.log("Test completed successfully");
    
  } catch (error) {
    console.error(`Error testing ${website.name}: ${error.message}`);
    testResults.errors.push(`Testing error: ${error.message}`);
    testResults.status = 'error';
    
    // Take error screenshot
    try {
      const errorScreenshotPath = path.join(resultsDir, `${website.name}_error.png`);
      await page.screenshot({ path: errorScreenshotPath });
      testResults.screenshots.push(errorScreenshotPath);
    } catch (screenshotError) {
      console.error(`Failed to take error screenshot: ${screenshotError.message}`);
    }
  }
  
  // Save results
  const resultPath = path.join(resultsDir, `${website.name}_test_results.json`);
  fs.writeFileSync(resultPath, JSON.stringify(testResults, null, 2));
  console.log(`Results saved to ${resultPath}`);
  
  await browser.close();
  return testResults;
}

async function countInteractiveElements(page) {
  return await page.evaluate(() => {
    const counts = {
      buttons: document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]').length,
      inputFields: document.querySelectorAll('input:not([type="button"]):not([type="submit"]):not([type="radio"]):not([type="checkbox"]), textarea').length,
      dropdowns: document.querySelectorAll('select, [role="combobox"]').length,
      checkboxes: document.querySelectorAll('input[type="checkbox"]').length,
      radioButtons: document.querySelectorAll('input[type="radio"]').length,
      links: document.querySelectorAll('a[href]').length
    };
    return counts;
  });
}

async function testClickableElements(page, testResults) {
  try {
    // Get all clickable elements
    const buttons = await page.$$('button, [role="button"], input[type="button"], input[type="submit"]');
    console.log(`Found ${buttons.length} buttons to test`);
    
    // Test a sample of buttons (max 10 to avoid too many clicks)
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      try {
        console.log(`Testing button ${i+1}/${Math.min(buttons.length, 10)}`);
        
        // Get button text or description
        const buttonText = await buttons[i].evaluate(btn => {
          return btn.textContent || btn.value || btn.innerText || btn.getAttribute('aria-label') || 'Unknown button';
        }).catch(() => 'Unknown button');
        
        // Take screenshot before clicking
        const beforeClickPath = path.join(resultsDir, `${testResults.name}_before_button${i+1}.png`);
        await page.screenshot({ path: beforeClickPath });
        
        // Click the button
        await buttons[i].click({ force: true }).catch(() => {
          testResults.notes.push(`Button ${i+1} (${buttonText.trim()}) could not be clicked`);
        });
        
        // Wait for any potential navigation or network activity
        await page.waitForTimeout(1000);
        
        // Take screenshot after clicking
        const afterClickPath = path.join(resultsDir, `${testResults.name}_after_button${i+1}.png`);
        await page.screenshot({ path: afterClickPath });
        
        testResults.notes.push(`Button ${i+1} (${buttonText.trim()}) clicked successfully`);
        
        // Go back if navigation happened
        if (await page.evaluate(() => window.location.href) !== testResults.url) {
          await page.goBack().catch(() => {});
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        testResults.notes.push(`Error testing button ${i+1}: ${error.message}`);
      }
    }
    
    // Test links (max 5)
    const links = await page.$$('a[href]:not([href="#"]):not([href="javascript:void(0)"])');
    console.log(`Found ${links.length} links to test`);
    
    for (let i = 0; i < Math.min(links.length, 5); i++) {
      try {
        console.log(`Testing link ${i+1}/${Math.min(links.length, 5)}`);
        
        // Get link text
        const linkText = await links[i].evaluate(link => {
          return link.textContent || link.innerText || link.getAttribute('aria-label') || 'Unknown link';
        }).catch(() => 'Unknown link');
        
        // Get link URL
        const linkUrl = await links[i].evaluate(link => link.href).catch(() => '');
        
        // Click the link
        const [newPage] = await Promise.all([
          page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null),
          links[i].click({ force: true }).catch(() => {
            testResults.notes.push(`Link ${i+1} (${linkText.trim()}) could not be clicked`);
          })
        ]);
        
        // Wait for any potential navigation
        await page.waitForTimeout(1000);
        
        // If a new tab opened, close it
        if (newPage) {
          testResults.notes.push(`Link ${i+1} (${linkText.trim()}) opened new tab: ${await newPage.url()}`);
          await newPage.close();
        } else if (await page.evaluate(() => window.location.href) !== testResults.url) {
          // If we navigated in the same tab
          testResults.notes.push(`Link ${i+1} (${linkText.trim()}) navigated to: ${await page.url()}`);
          await page.goBack().catch(() => {});
          await page.waitForTimeout(1000);
        } else {
          testResults.notes.push(`Link ${i+1} (${linkText.trim()}) clicked but no navigation occurred`);
        }
      } catch (error) {
        testResults.notes.push(`Error testing link ${i+1}: ${error.message}`);
      }
    }
  } catch (error) {
    testResults.errors.push(`Error in testClickableElements: ${error.message}`);
  }
}

async function testFormFields(page, testResults) {
  try {
    // Get all form fields
    const textInputs = await page.$$('input[type="text"], input:not([type]), input[type="email"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"], textarea');
    const numberInputs = await page.$$('input[type="number"]');
    const selects = await page.$$('select');
    const checkboxes = await page.$$('input[type="checkbox"]');
    const radioButtons = await page.$$('input[type="radio"]');
    
    console.log(`Found ${textInputs.length} text inputs, ${numberInputs.length} number inputs, ${selects.length} selects, ${checkboxes.length} checkboxes, ${radioButtons.length} radio buttons`);
    
    // Fill text inputs
    for (let i = 0; i < Math.min(textInputs.length, 10); i++) {
      try {
        // Determine the type of input to fill with appropriate data
        const inputType = await textInputs[i].evaluate(input => {
          return input.type || input.getAttribute('placeholder') || 'text';
        }).catch(() => 'text');
        
        let testValue = '';
        
        if (inputType.includes('email') || inputType.includes('mail')) {
          testValue = testData.emails[i % testData.emails.length];
        } else if (inputType.includes('name') || inputType.includes('user')) {
          testValue = testData.names[i % testData.names.length];
        } else if (inputType.includes('phone') || inputType.includes('tel')) {
          testValue = testData.phones[i % testData.phones.length];
        } else if (inputType.includes('location') || inputType.includes('address') || inputType.includes('city')) {
          testValue = testData.locations[i % testData.locations.length];
        } else {
          testValue = testData.randomText[i % testData.randomText.length];
        }
        
        await textInputs[i].fill(testValue).catch(() => {
          testResults.notes.push(`Could not fill text input ${i+1}`);
        });
        
        testResults.notes.push(`Text input ${i+1} filled with: ${testValue}`);
      } catch (error) {
        testResults.notes.push(`Error filling text input ${i+1}: ${error.message}`);
      }
    }
    
    // Fill number inputs
    for (let i = 0; i < Math.min(numberInputs.length, 5); i++) {
      try {
        await numberInputs[i].fill(testData.hours[i % testData.hours.length]).catch(() => {
          testResults.notes.push(`Could not fill number input ${i+1}`);
        });
        
        testResults.notes.push(`Number input ${i+1} filled with: ${testData.hours[i % testData.hours.length]}`);
      } catch (error) {
        testResults.notes.push(`Error filling number input ${i+1}: ${error.message}`);
      }
    }
    
    // Select options in dropdowns
    for (let i = 0; i < Math.min(selects.length, 5); i++) {
      try {
        // Get available options
        const options = await selects[i].evaluate(select => {
          const opts = Array.from(select.options);
          return opts.map((opt, index) => ({ value: opt.value, text: opt.text, index }))
            .filter(opt => opt.value && opt.value !== '');
        });
        
        if (options.length > 0) {
          // Select a non-first option if available
          const optionIndex = options.length > 1 ? 1 : 0;
          
          await selects[i].selectOption({ index: options[optionIndex].index }).catch(() => {
            testResults.notes.push(`Could not select option in dropdown ${i+1}`);
          });
          
          testResults.notes.push(`Selected option in dropdown ${i+1}: ${options[optionIndex].text}`);
        }
      } catch (error) {
        testResults.notes.push(`Error selecting in dropdown ${i+1}: ${error.message}`);
      }
    }
    
    // Check some checkboxes
    for (let i = 0; i < Math.min(checkboxes.length, 3); i++) {
      try {
        await checkboxes[i].check().catch(() => {
          testResults.notes.push(`Could not check checkbox ${i+1}`);
        });
        
        testResults.notes.push(`Checkbox ${i+1} checked`);
      } catch (error) {
        testResults.notes.push(`Error checking checkbox ${i+1}: ${error.message}`);
      }
    }
    
    // Select some radio buttons
    for (let i = 0; i < Math.min(radioButtons.length, 3); i++) {
      try {
        await radioButtons[i].check().catch(() => {
          testResults.notes.push(`Could not select radio button ${i+1}`);
        });
        
        testResults.notes.push(`Radio button ${i+1} selected`);
      } catch (error) {
        testResults.notes.push(`Error selecting radio button ${i+1}: ${error.message}`);
      }
    }
    
    // Try to find and click submit buttons
    const submitButtons = await page.$$('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("save"), button:has-text("Send")');
    
    if (submitButtons.length > 0) {
      try {
        // Take screenshot before submission
        const beforeSubmitPath = path.join(resultsDir, `${testResults.name}_before_submit.png`);
        await page.screenshot({ path: beforeSubmitPath });
        
        // Click the first submit button
        await submitButtons[0].click().catch(() => {
          testResults.notes.push(`Could not click submit button`);
        });
        
        // Wait for any potential form submission
        await page.waitForTimeout(3000);
        
        // Take screenshot after submission
        const afterSubmitPath = path.join(resultsDir, `${testResults.name}_after_submit.png`);
        await page.screenshot({ path: afterSubmitPath });
        
        testResults.formSubmission = true;
        testResults.notes.push(`Form submitted successfully`);
      } catch (error) {
        testResults.notes.push(`Error submitting form: ${error.message}`);
      }
    } else {
      testResults.notes.push(`No submit buttons found`);
    }
  } catch (error) {
    testResults.errors.push(`Error in testFormFields: ${error.message}`);
  }
}

async function testNavigation(page, testResults) {
  try {
    // Test navigation elements
    const navElements = await page.$$('nav, .nav, .navbar, .navigation, header a, .menu a');
    console.log(`Found ${navElements.length} navigation elements`);
    
    if (navElements.length > 0) {
      testResults.navigationTested = true;
      
      // Click on at most 3 navigation elements
      for (let i = 0; i < Math.min(navElements.length, 3); i++) {
        try {
          // Get nav element text
          const navText = await navElements[i].evaluate(el => {
            return el.textContent || el.innerText || 'Unknown nav';
          }).catch(() => 'Unknown nav');
          
          // Click the nav element
          await navElements[i].click({ force: true }).catch(() => {
            testResults.notes.push(`Could not click navigation element ${i+1} (${navText.trim()})`);
          });
          
          // Wait for any potential navigation
          await page.waitForTimeout(1000);
          
          testResults.notes.push(`Navigation element ${i+1} (${navText.trim()}) clicked successfully`);
          
          // Go back if navigation happened
          if (await page.evaluate(() => window.location.href) !== testResults.url) {
            await page.goBack().catch(() => {});
            await page.waitForTimeout(1000);
          }
        } catch (error) {
          testResults.notes.push(`Error testing navigation element ${i+1}: ${error.message}`);
        }
      }
    } else {
      testResults.notes.push(`No navigation elements found`);
    }
  } catch (error) {
    testResults.errors.push(`Error in testNavigation: ${error.message}`);
  }
}

async function testLogin(page, testResults) {
  try {
    // Look for login forms or links
    const loginSelectors = [
      'form[action*="login"]',
      'form[action*="signin"]',
      'a:has-text("Login")',
      'a:has-text("Sign in")',
      'button:has-text("Login")',
      'button:has-text("Sign in")',
      'input[name="username"], input[name="email"]'
    ];
    
    const loginElements = await page.$$(loginSelectors.join(', '));
    
    if (loginElements.length > 0) {
      testResults.loginTested = true;
      testResults.notes.push(`Login functionality detected`);
      
      // If it's a login link, click it first
      const loginLink = await page.$('a:has-text("Login"), a:has-text("Sign in")');
      if (loginLink) {
        await loginLink.click().catch(() => {
          testResults.notes.push(`Could not click login link`);
        });
        await page.waitForTimeout(1000);
      }
      
      // Find username/email and password fields
      const usernameField = await page.$('input[name="username"], input[name="email"], input[type="email"], input[placeholder*="email"], input[placeholder*="username"]');
      const passwordField = await page.$('input[type="password"], input[name="password"], input[placeholder*="password"]');
      
      if (usernameField && passwordField) {
        // Fill login credentials
        await usernameField.fill('test@example.com').catch(() => {
          testResults.notes.push(`Could not fill username/email field`);
        });
        
        await passwordField.fill('password123').catch(() => {
          testResults.notes.push(`Could not fill password field`);
        });
        
        // Take screenshot before login
        const beforeLoginPath = path.join(resultsDir, `${testResults.name}_before_login.png`);
        await page.screenshot({ path: beforeLoginPath });
        
        // Find and click login button
        const loginButton = await page.$('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
        
        if (loginButton) {
          await loginButton.click().catch(() => {
            testResults.notes.push(`Could not click login button`);
          });
          
          // Wait for login response
          await page.waitForTimeout(3000);
          
          // Take screenshot after login attempt
          const afterLoginPath = path.join(resultsDir, `${testResults.name}_after_login.png`);
          await page.screenshot({ path: afterLoginPath });
          
          testResults.notes.push(`Login attempted with test credentials`);
        } else {
          testResults.notes.push(`Login form found but no submit button`);
        }
      } else {
        testResults.notes.push(`Login functionality detected but could not find username/password fields`);
      }
    } else {
      testResults.notes.push(`No login functionality detected`);
    }
  } catch (error) {
    testResults.errors.push(`Error in testLogin: ${error.message}`);
  }
}

// Main function to run tests on all websites
async function testAllWebsites() {
  console.log("===========================================");
  console.log("STARTING COMPREHENSIVE TESTS FOR ALL WEBSITES");
  console.log("===========================================");
  
  const startTime = new Date();
  const summary = {
    totalWebsites: websites.length,
    successfulTests: 0,
    failedTests: 0,
    startTime: startTime.toISOString(),
    endTime: null,
    testsCompleted: []
  };
  
  // Process each website
  for (let i = 0; i < websites.length; i++) {
    console.log(`\n[${i+1}/${websites.length}] Testing website: ${websites[i].name}`);
    
    try {
      const results = await comprehensiveTest(websites[i]);
      
      if (results.status === 'complete') {
        summary.successfulTests++;
      } else {
        summary.failedTests++;
      }
      
      summary.testsCompleted.push({
        name: websites[i].name,
        url: websites[i].url,
        status: results.status,
        interactiveElements: results.interactiveElements
      });
      
      console.log(`Completed testing of ${websites[i].name} (${i+1}/${websites.length})`);
    } catch (error) {
      console.error(`Failed to test ${websites[i].name}: ${error.message}`);
      summary.failedTests++;
      
      summary.testsCompleted.push({
        name: websites[i].name,
        url: websites[i].url,
        status: 'error',
        error: error.message
      });
    }
    
    // Small pause between tests
    if (i < websites.length - 1) {
      console.log("Pausing before next test...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Record end time
  const endTime = new Date();
  summary.endTime = endTime.toISOString();
  summary.totalDuration = (endTime - startTime) / 1000; // in seconds
  
  // Save summary report
  const summaryPath = path.join(resultsDir, `comprehensive_test_summary.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log("\n===========================================");
  console.log("COMPREHENSIVE TESTS COMPLETED");
  console.log(`Tested ${summary.totalWebsites} websites`);
  console.log(`Successful: ${summary.successfulTests}, Failed: ${summary.failedTests}`);
  console.log(`Total duration: ${summary.totalDuration} seconds`);
  console.log(`Summary saved to: ${summaryPath}`);
  console.log("===========================================");
  
  return summary;
}

// Run if executed directly
if (require.main === module) {
  testAllWebsites().catch(error => {
    console.error("Error in main execution:", error);
  });
}

module.exports = { testAllWebsites, comprehensiveTest }; 