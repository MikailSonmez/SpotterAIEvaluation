const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// List of websites to test
const websitesToTest = process.argv.length > 2 
  ? process.argv.slice(2)
  : [
      'https://spotter.lavandesn.com/',
      'https://trips-frontend-dusky.vercel.app',
      'https://eld-client.onrender.com',
      'https://eld-log-app-git-main-mert-gokhan-donmezs-projects.vercel.app/',
      'https://tracking-user-app.netlify.app/',
      'https://frontend-nine-phi-12.vercel.app/',
      'https://tripapp-ydoc.onrender.com',
      'https://tripplanner-frontend-production.up.railway.app/',
      'https://spotter-ai-logbook-react-frontend.vercel.app',
      'https://driver-logbook.vercel.app/',
      'https://trip-planning-logging.netlify.app/',
      'http://eldlog.duckdns.org',
      'https://route-eld-tracker-git-main-ilhams-projects-9cb20472.vercel.app/',
      'https://trajectspotterfrontend.onrender.com',
      'https://eld-frontend-cobt.vercel.app/',
      'https://tripplanner-mu.vercel.app/',
      'https://trip-logger-jet.vercel.app',
      'https://eld-trip-planner-frontend.vercel.app/',
      'https://spotter-front-git-master-pbnjaays-projects.vercel.app/',
      'https://track-drivers.vercel.app/',
      'https://truck-logbook.vercel.app/',
      'https://trip-planner-frontend-tau.vercel.app',
      'https://eld-client.vercel.app',
      'https://we-haul-frontend.vercel.app/trips',
      'https://eld-generator.netlify.app',
      'https://trip-planner-yphs.onrender.com/',
      'https://eld-frontend-sand.vercel.app/',
      'https://eld-trip-tracker.vercel.app/',
      'https://eld-trip-planner.vercel.app/',
      'https://trip-planner-app-gray.vercel.app/'
    ];

// Timestamp for report files
const timestamp = new Date().toISOString().replace(/:/g, '-');
const resultsDir = path.join(__dirname, 'results');

// Ensure results directory exists
try {
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
    console.log(`Created results directory: ${resultsDir}`);
  }
} catch (error) {
  console.error(`Error creating results directory: ${error.message}`);
}

// Main function to evaluate a website
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
    scores: {
      uiAesthetics: 0,
      uxIntuitiveness: 0,
      bugs: 0,
      requiredFeatures: 0,
      eldAccuracy: 0
    }
  };

  // Test data
  const testRoute = {
    currentLocation: 'Chicago, IL',
    pickupLocation: 'Indianapolis, IN',
    dropoffLocation: 'Cincinnati, OH',
    currentCycleUsed: 2
  };

  let browser;
  try {
    // Launch browser
    browser = await chromium.launch({ 
      headless: true,
      timeout: 30000
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Test 1: Load the website
    try {
      await page.goto(url, { timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
      
      // Take screenshot
      const screenshotPath = path.join(resultsDir, `${websiteName}_initial.png`);
      try {
        await page.screenshot({ path: screenshotPath, fullPage: true });
        evaluationResults.screenshots.push(screenshotPath);
      } catch (error) {
        console.error(`Error taking screenshot: ${error.message}`);
      }
      
      evaluationResults.status = 'loaded';
      evaluationResults.notes.push('Website loaded successfully');
      
      // Test 2: Check for required input fields
      const locationInputs = await page.$$('input[type="text"], [placeholder*="location"], [name*="location"]');
      const hoursInput = await page.$$('input[type="number"], [placeholder*="hour"], [name*="hour"]');
      
      // Score required features
      if (locationInputs.length >= 3) {
        evaluationResults.scores.requiredFeatures += 2;
        evaluationResults.notes.push('Required location fields found');
      } else if (locationInputs.length >= 2) {
        evaluationResults.scores.requiredFeatures += 1;
        evaluationResults.notes.push('Some location fields found');
      }
      
      if (hoursInput.length >= 1) {
        evaluationResults.scores.requiredFeatures += 1;
        evaluationResults.notes.push('Hours/cycle input found');
      }
      
      // Test 3: Evaluate UI aesthetics (simple check)
      const hasLogo = await page.$('img[alt*="logo"], .logo, #logo');
      const hasConsistentHeader = await page.$('header, .header, #header');
      const hasFooter = await page.$('footer, .footer, #footer');
      
      const uiElements = [hasLogo, hasConsistentHeader, hasFooter].filter(Boolean).length;
      evaluationResults.scores.uiAesthetics = Math.min(uiElements, 3) + 1;
      
      // Test 4: Evaluate UX intuitiveness (simple check)
      const hasLabels = await page.$$('label');
      const hasNavigation = await page.$('nav, .nav, #nav, .navbar');
      
      evaluationResults.scores.uxIntuitiveness = (hasLabels.length > 0 ? 1 : 0) + (hasNavigation ? 1 : 0);
      
      // Test 5: Check for bugs (console errors)
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Reload page to trigger any console errors
      await page.reload();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      // Score bugs (fewer is better)
      evaluationResults.scores.bugs = consoleErrors.length === 0 ? 10 : 
                                     consoleErrors.length <= 3 ? 8 : 
                                     consoleErrors.length <= 10 ? 5 : 2;
      
      // Try to fill form and submit
      try {
        // Try to fill location fields and submit
        if (locationInputs.length >= 3) {
          await locationInputs[0].fill(testRoute.currentLocation);
          await locationInputs[1].fill(testRoute.pickupLocation);
          await locationInputs[2].fill(testRoute.dropoffLocation);
        }
        
        if (hoursInput.length >= 1) {
          await hoursInput[0].fill(testRoute.currentCycleUsed.toString());
        }
        
        // Try to submit
        const submitButton = await page.$('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Calculate"), button');
        if (submitButton) {
          await submitButton.click();
          await page.waitForTimeout(3000);
          
          // Take results screenshot
          const resultsScreenshot = path.join(resultsDir, `${websiteName}_results.png`);
          try {
            await page.screenshot({ path: resultsScreenshot, fullPage: true });
            evaluationResults.screenshots.push(resultsScreenshot);
          } catch (error) {
            console.error(`Error taking results screenshot: ${error.message}`);
          }
          
          // Check for map
          const hasMap = await page.$('.map, #map, [class*="map"], svg, iframe[src*="map"]');
          if (hasMap) {
            evaluationResults.scores.requiredFeatures += 1;
            evaluationResults.notes.push('Map found');
          }
          
          // Check for ELD logs
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
          
          if (hasEldText) {
            evaluationResults.scores.eldAccuracy = 2;
            evaluationResults.notes.push('ELD logs found');
          }
        }
      } catch (error) {
        evaluationResults.notes.push(`Form submission error: ${error.message}`);
      }
      
      // Calculate final score (average of all scores)
      evaluationResults.finalScore = parseFloat(((
        evaluationResults.scores.uiAesthetics +
        evaluationResults.scores.uxIntuitiveness +
        evaluationResults.scores.bugs +
        evaluationResults.scores.requiredFeatures +
        evaluationResults.scores.eldAccuracy
      ) / 5).toFixed(1));
      
      evaluationResults.status = 'complete';
      
    } catch (error) {
      evaluationResults.status = 'error';
      evaluationResults.error = `Error during evaluation: ${error.message}`;
      evaluationResults.notes.push(`Error: ${error.message}`);
      console.error(`Error evaluating ${url}: ${error.message}`);
    }
  } catch (error) {
    evaluationResults.status = 'fatal_error';
    evaluationResults.error = `Fatal error: ${error.message}`;
    evaluationResults.notes.push(`Fatal error: ${error.message}`);
    console.error(`Fatal error evaluating ${url}: ${error.message}`);
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
  }
  
  return evaluationResults;
}

// Main testing function to evaluate multiple websites
async function testWebsites() {
  const results = [];
  const csvRows = [
    'Name,URL,Status,Final Score,UI Score,UX Score,Bugs Score,Features Score,ELD Score'
  ];
  
  let successfulEvaluations = 0;
  let failedEvaluations = 0;
  
  for (const url of websitesToTest) {
    try {
      console.log(`\n===== Starting evaluation of ${url} =====`);
      const result = await evaluateWebsite(url);
      results.push(result);
      
      // Add to CSV data
      if (result.status === 'complete') {
        successfulEvaluations++;
        csvRows.push(`"${result.website}","${result.url}","${result.status}",${result.finalScore},${result.scores.uiAesthetics},${result.scores.uxIntuitiveness},${result.scores.bugs},${result.scores.requiredFeatures},${result.scores.eldAccuracy}`);
      } else {
        failedEvaluations++;
        csvRows.push(`"${result.website}","${result.url}","${result.status}",N/A,N/A,N/A,N/A,N/A,N/A`);
      }
      
    } catch (error) {
      console.error(`Failed to evaluate ${url}: ${error.message}`);
      failedEvaluations++;
      
      // Get website name from URL
      const websiteName = url.replace(/https?:\/\//, '')
                           .replace(/\/$/, '')
                           .replace(/[^\w.-]/g, '_');
      
      results.push({
        website: websiteName,
        url: url,
        status: 'error',
        error: error.message
      });
      
      csvRows.push(`"${websiteName}","${url}","error",N/A,N/A,N/A,N/A,N/A,N/A`);
    }
  }
  
  // Save CSV report
  const csvPath = path.join(resultsDir, `website_scores_${timestamp}.csv`);
  try {
    fs.writeFileSync(csvPath, csvRows.join('\n'));
    console.log(`\nCSV report saved to ${csvPath}`);
  } catch (error) {
    console.error(`Error saving CSV report: ${error.message}`);
  }
  
  // Generate summary report
  generateSummaryReport(results, successfulEvaluations, failedEvaluations);
  
  return results;
}

// Generate a formatted summary report
function generateSummaryReport(results, successCount, failedCount) {
  const summaryLines = [
    '=== WEBSITE EVALUATION SUMMARY REPORT ===',
    '',
    `Date: ${timestamp}`,
    `Total websites evaluated: ${results.length}`,
    `Successful evaluations: ${successCount}`,
    `Failed evaluations: ${failedCount}`,
    '',
    '=== WEBSITE RANKINGS ===',
    ''
  ];
  
  // Filter and sort successful evaluations by score
  const successfulSites = results
    .filter(site => site.status === 'complete')
    .sort((a, b) => b.finalScore - a.finalScore);
  
  // Add ranked websites
  successfulSites.forEach((site, index) => {
    summaryLines.push(`${index + 1}. ${site.website} - Final Score: ${site.finalScore}/10`);
    summaryLines.push(`   URL: ${site.url}`);
    summaryLines.push(`   UI: ${site.scores.uiAesthetics}/10 | UX: ${site.scores.uxIntuitiveness}/10 | Bugs: ${site.scores.bugs}/10`);
    summaryLines.push(`   Features: ${site.scores.requiredFeatures}/10 | ELD: ${site.scores.eldAccuracy}/10`);
    summaryLines.push(``);
  });
  
  // Calculate averages
  if (successfulSites.length > 0) {
    const avgTotal = successfulSites.reduce((sum, site) => sum + site.finalScore, 0) / successfulSites.length;
    const avgUI = successfulSites.reduce((sum, site) => sum + site.scores.uiAesthetics, 0) / successfulSites.length;
    const avgUX = successfulSites.reduce((sum, site) => sum + site.scores.uxIntuitiveness, 0) / successfulSites.length;
    const avgBugs = successfulSites.reduce((sum, site) => sum + site.scores.bugs, 0) / successfulSites.length;
    const avgFeatures = successfulSites.reduce((sum, site) => sum + site.scores.requiredFeatures, 0) / successfulSites.length;
    const avgELD = successfulSites.reduce((sum, site) => sum + site.scores.eldAccuracy, 0) / successfulSites.length;
    
    summaryLines.push('=== AVERAGE SCORES ===');
    summaryLines.push('');
    summaryLines.push(`Overall Average: ${avgTotal.toFixed(1)}/10`);
    summaryLines.push(`UI Aesthetics Average: ${avgUI.toFixed(1)}/10`);
    summaryLines.push(`UX Intuitiveness Average: ${avgUX.toFixed(1)}/10`);
    summaryLines.push(`Bug-Free Score Average: ${avgBugs.toFixed(1)}/10`);
    summaryLines.push(`Required Features Average: ${avgFeatures.toFixed(1)}/10`);
    summaryLines.push(`ELD Accuracy Average: ${avgELD.toFixed(1)}/10`);
    summaryLines.push('');
    
    // Find category winners
    const uiWinner = successfulSites.reduce((prev, current) => 
      (prev.scores.uiAesthetics > current.scores.uiAesthetics) ? prev : current);
    const uxWinner = successfulSites.reduce((prev, current) => 
      (prev.scores.uxIntuitiveness > current.scores.uxIntuitiveness) ? prev : current);
    const bugsWinner = successfulSites.reduce((prev, current) => 
      (prev.scores.bugs > current.scores.bugs) ? prev : current);
    const featuresWinner = successfulSites.reduce((prev, current) => 
      (prev.scores.requiredFeatures > current.scores.requiredFeatures) ? prev : current);
    const eldWinner = successfulSites.reduce((prev, current) => 
      (prev.scores.eldAccuracy > current.scores.eldAccuracy) ? prev : current);
    
    summaryLines.push('=== CATEGORY WINNERS ===');
    summaryLines.push('');
    summaryLines.push(`Best UI Design: ${uiWinner.website} (${uiWinner.scores.uiAesthetics}/10)`);
    summaryLines.push(`Best UX Design: ${uxWinner.website} (${uxWinner.scores.uxIntuitiveness}/10)`);
    summaryLines.push(`Most Bug-Free: ${bugsWinner.website} (${bugsWinner.scores.bugs}/10)`);
    summaryLines.push(`Most Complete Features: ${featuresWinner.website} (${featuresWinner.scores.requiredFeatures}/10)`);
    summaryLines.push(`Best ELD Implementation: ${eldWinner.website} (${eldWinner.scores.eldAccuracy}/10)`);
    summaryLines.push('');
  }
  
  // Add failed evaluations
  const failedSites = results.filter(site => site.status !== 'complete');
  if (failedSites.length > 0) {
    summaryLines.push('=== FAILED EVALUATIONS ===');
    summaryLines.push('');
    
    failedSites.forEach(site => {
      summaryLines.push(`${site.website} (${site.url}): ${site.status}`);
      if (site.error) {
        summaryLines.push(`   Error: ${site.error}`);
      }
      summaryLines.push('');
    });
  }
  
  // Write summary report to file
  const summaryPath = path.join(resultsDir, `summary_report_${timestamp}.txt`);
  try {
    fs.writeFileSync(summaryPath, summaryLines.join('\n'));
    console.log(`Summary report saved to ${summaryPath}`);
  } catch (error) {
    console.error(`Error saving summary report: ${error.message}`);
  }
}

// Run the tests
testWebsites()
  .then(() => console.log('All website evaluations complete!'))
  .catch(console.error); 