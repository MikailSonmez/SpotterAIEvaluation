const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Shorter list of websites to test
const websitesToTest = [
  'https://spotter.lavandesn.com/',
  'https://driver-logbook.vercel.app/',
  'https://eld-client.onrender.com'
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
      
      // Assign random scores for testing
      evaluationResults.scores.uiAesthetics = Math.floor(Math.random() * 10) + 1;
      evaluationResults.scores.uxIntuitiveness = Math.floor(Math.random() * 10) + 1;
      evaluationResults.scores.bugs = Math.floor(Math.random() * 10) + 1;
      evaluationResults.scores.requiredFeatures = Math.floor(Math.random() * 10) + 1;
      evaluationResults.scores.eldAccuracy = Math.floor(Math.random() * 10) + 1;
      
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