const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Check for command line argument
if (process.argv.length < 3) {
  console.error("Please provide a website URL as an argument");
  process.exit(1);
}

// Get website URL from command line argument
const websiteUrl = process.argv[2];

// Main function to test a website with a visible browser
async function testWebsiteVisible(url) {
  const websiteName = url.replace(/https?:\/\//, '')
                         .replace(/\/$/, '')
                         .replace(/[^\w.-]/g, '_');
  
  console.log(`\n===== Testing ${websiteName} (${url}) =====`);
  
  const evaluationResults = {
    website: websiteName,
    url: url,
    status: 'not_tested',
    finalScore: 0,
    scores: {
      uiAesthetics: 0,
      uxIntuitiveness: 0,
      bugs: 0,
      requiredFeatures: 0,
      eldAccuracy: 0
    }
  };
  
  // Ensure results directory exists
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }

  const browser = await chromium.launch({ 
    headless: false,   // Show the browser UI
    timeout: 60000,    // Longer timeout for manual observation
    slowMo: 500        // Add delay so actions are easier to see
  });
  
  const page = await browser.newPage();
  
  try {
    // Load the website
    console.log(`Loading ${url}...`);
    await page.goto(url, { timeout: 30000 });
    
    // Wait for network activity to settle
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial page
    const screenshotPath = path.join(resultsDir, `${websiteName}_initial.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    // Test data for form filling
    const testRoute = {
      currentLocation: 'Chicago, IL',
      pickupLocation: 'Indianapolis, IN',
      dropoffLocation: 'Cincinnati, OH',
      currentCycleUsed: 2
    };
    
    // Try to fill form fields
    console.log("Attempting to fill form fields...");
    
    // Look for location inputs
    const locationInputs = await page.$$('input[type="text"], [placeholder*="location"], [placeholder*="origin"], [placeholder*="destination"]');
    
    if (locationInputs.length >= 3) {
      await locationInputs[0].fill(testRoute.currentLocation);
      await page.waitForTimeout(1000);
      await locationInputs[1].fill(testRoute.pickupLocation);
      await page.waitForTimeout(1000);
      await locationInputs[2].fill(testRoute.dropoffLocation);
      await page.waitForTimeout(1000);
    }
    
    // Look for hours/cycle input
    const hoursInput = await page.$('input[type="number"], [placeholder*="hour"], [placeholder*="cycle"]');
    if (hoursInput) {
      await hoursInput.fill(testRoute.currentCycleUsed.toString());
      await page.waitForTimeout(1000);
    }
    
    // Try to submit form
    console.log("Attempting to submit form...");
    const submitButton = await page.$('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Calculate"), button');
    
    if (submitButton) {
      await submitButton.click();
      console.log("Form submitted");
      
      // Wait for results to load
      await page.waitForTimeout(5000);
      
      // Take screenshot of results
      const resultsScreenshot = path.join(resultsDir, `${websiteName}_results.png`);
      await page.screenshot({ path: resultsScreenshot, fullPage: true });
      console.log(`Results screenshot saved to ${resultsScreenshot}`);
    }
    
    // Wait for user to review
    console.log("\n------------------------------");
    console.log("MANUAL REVIEW: Please examine the website and evaluate:");
    console.log("1. UI Aesthetics (0-10): Professional design, color scheme, layout, responsive design");
    console.log("2. UX Intuitiveness (0-10): Navigation, form labels, user feedback, accessibility");
    console.log("3. Bug-Free Rating (0-10): Console errors, functional issues, form validation, visual glitches");
    console.log("4. Required Features (0-10): Location inputs, hours inputs, route map, ELD logs");
    console.log("5. ELD Accuracy (0-10): HOS visualization, status changes, drive time, breaks representation");
    console.log("------------------------------");
    
    // Allow user to enter scores manually
    console.log("\nEnter scores (0-10) for each category when you're ready:");
    
    process.stdout.write("UI Aesthetics (0-10): ");
    let uiScore = await new Promise(resolve => process.stdin.once('data', data => resolve(parseInt(data.toString()))));
    
    process.stdout.write("UX Intuitiveness (0-10): ");
    let uxScore = await new Promise(resolve => process.stdin.once('data', data => resolve(parseInt(data.toString()))));
    
    process.stdout.write("Bug-Free Rating (0-10): ");
    let bugsScore = await new Promise(resolve => process.stdin.once('data', data => resolve(parseInt(data.toString()))));
    
    process.stdout.write("Required Features (0-10): ");
    let featuresScore = await new Promise(resolve => process.stdin.once('data', data => resolve(parseInt(data.toString()))));
    
    process.stdout.write("ELD Accuracy (0-10): ");
    let eldScore = await new Promise(resolve => process.stdin.once('data', data => resolve(parseInt(data.toString()))));
    
    // Set scores in results
    evaluationResults.scores.uiAesthetics = uiScore;
    evaluationResults.scores.uxIntuitiveness = uxScore;
    evaluationResults.scores.bugs = bugsScore;
    evaluationResults.scores.requiredFeatures = featuresScore;
    evaluationResults.scores.eldAccuracy = eldScore;
    
    // Calculate final score
    evaluationResults.finalScore = parseFloat(((uiScore + uxScore + bugsScore + featuresScore + eldScore) / 5).toFixed(1));
    evaluationResults.status = 'complete';
    
    // Save results to JSON file
    const resultsFile = path.join(resultsDir, `${websiteName}_evaluation.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(evaluationResults, null, 2));
    
    console.log("\n===== EVALUATION RESULTS =====");
    console.log(`Website: ${websiteName}`);
    console.log(`URL: ${url}`);
    console.log(`Final Score: ${evaluationResults.finalScore}/10`);
    console.log(`UI: ${uiScore}/10 | UX: ${uxScore}/10 | Bugs: ${bugsScore}/10`);
    console.log(`Features: ${featuresScore}/10 | ELD: ${eldScore}/10`);
    console.log(`Results saved to ${resultsFile}`);
    
  } catch (error) {
    console.error(`Error evaluating ${url}: ${error.message}`);
    evaluationResults.status = 'error';
    evaluationResults.error = error.message;
  } finally {
    // Close browser
    await browser.close();
  }
  
  return evaluationResults;
}

// Run the test
testWebsiteVisible(websiteUrl)
  .then(() => console.log("Evaluation complete"))
  .catch(console.error); 