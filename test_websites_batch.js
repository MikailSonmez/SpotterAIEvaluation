const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// List of websites to test
const websites = [
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

// Ensure results directory exists
const resultsDir = path.join(__dirname, 'test_results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

// Function to run test for a single website
function testWebsite(url) {
  return new Promise((resolve, reject) => {
    console.log(`\n===== Starting test for ${url} =====\n`);
    
    exec(`node test_single_website.js "${url}"`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error testing ${url}: ${error.message}`);
        resolve({
          url,
          success: false,
          error: error.message
        });
        return;
      }
      
      if (stderr) {
        console.error(`Error output for ${url}: ${stderr}`);
      }
      
      console.log(stdout);
      console.log(`\n===== Completed test for ${url} =====\n`);
      
      resolve({
        url,
        success: true
      });
    });
  });
}

// Main function to test all websites
async function testAllWebsites() {
  console.log("Starting tests for all websites...");
  
  const results = [];
  
  // Test each website sequentially
  for (const url of websites) {
    const result = await testWebsite(url);
    results.push(result);
    
    // Small delay between tests to allow resources to be freed
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Compile summary
  const summary = {
    totalWebsites: websites.length,
    successfulTests: results.filter(r => r.success).length,
    failedTests: results.filter(r => !r.success).length,
    testedAt: new Date().toISOString()
  };
  
  // Save summary to file
  fs.writeFileSync(
    path.join(resultsDir, 'batch_test_summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log("\n===== All tests completed =====");
  console.log(`Total websites: ${summary.totalWebsites}`);
  console.log(`Successful tests: ${summary.successfulTests}`);
  console.log(`Failed tests: ${summary.failedTests}`);
  console.log(`Results saved to ${resultsDir}`);
  
  // Now let's compile all the evaluation results
  compileResults();
}

// Function to compile all individual test results into one report
function compileResults() {
  try {
    console.log("\nCompiling all evaluation results...");
    
    const allResults = [];
    
    // Read all evaluation files
    const files = fs.readdirSync(resultsDir);
    const evaluationFiles = files.filter(file => file.endsWith('_evaluation.json'));
    
    for (const file of evaluationFiles) {
      try {
        const data = fs.readFileSync(path.join(resultsDir, file), 'utf8');
        const result = JSON.parse(data);
        allResults.push(result);
      } catch (err) {
        console.error(`Error reading file ${file}: ${err.message}`);
      }
    }
    
    // Generate ranking
    allResults.sort((a, b) => b.scores.total - a.scores.total);
    
    const websiteRanking = allResults.map(r => ({
      name: r.website,
      url: r.url,
      score: r.scores.total,
      breakdown: {
        ui: r.scores.ui,
        ux: r.scores.ux,
        bugs: r.scores.bugs,
        eldAccuracy: r.scores.eldAccuracy || 0,
        requiredFeatures: r.scores.requiredFeatures || 0
      },
      status: r.status
    }));
    
    // Calculate average scores
    const avgTotal = allResults.reduce((sum, r) => sum + r.scores.total, 0) / allResults.length || 0;
    const avgUI = allResults.reduce((sum, r) => sum + r.scores.ui, 0) / allResults.length || 0;
    const avgUX = allResults.reduce((sum, r) => sum + r.scores.ux, 0) / allResults.length || 0;
    const avgBugs = allResults.reduce((sum, r) => sum + r.scores.bugs, 0) / allResults.length || 0;
    const avgEldAccuracy = allResults.reduce((sum, r) => sum + (r.scores.eldAccuracy || 0), 0) / allResults.length || 0;
    const avgReqFeatures = allResults.reduce((sum, r) => sum + (r.scores.requiredFeatures || 0), 0) / allResults.length || 0;
    
    // Prepare summary
    const summary = {
      totalWebsites: allResults.length,
      averageScores: {
        total: avgTotal,
        ui: avgUI,
        ux: avgUX,
        bugs: avgBugs,
        eldAccuracy: avgEldAccuracy,
        requiredFeatures: avgReqFeatures
      },
      highestScore: Math.max(...allResults.map(r => r.scores.total)),
      lowestScore: Math.min(...allResults.map(r => r.scores.total)),
      websiteRanking
    };
    
    // Create a detailed category report
    const categoryAnalysis = {
      bestUI: websiteRanking.slice().sort((a, b) => b.breakdown.ui - a.breakdown.ui)[0],
      bestUX: websiteRanking.slice().sort((a, b) => b.breakdown.ux - a.breakdown.ux)[0],
      bestBugs: websiteRanking.slice().sort((a, b) => b.breakdown.bugs - a.breakdown.bugs)[0],
      bestELDAccuracy: websiteRanking.slice().sort((a, b) => b.breakdown.eldAccuracy - a.breakdown.eldAccuracy)[0],
      bestRequiredFeatures: websiteRanking.slice().sort((a, b) => b.breakdown.requiredFeatures - a.breakdown.requiredFeatures)[0]
    };
    
    summary.categoryWinners = categoryAnalysis;
    
    // Save all results
    fs.writeFileSync(
      path.join(resultsDir, 'all_evaluations.json'),
      JSON.stringify(allResults, null, 2)
    );
    
    // Save summary
    fs.writeFileSync(
      path.join(resultsDir, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    // Create a detailed report file
    const detailedReportPath = path.join(resultsDir, 'detailed_report.txt');
    let detailedReport = "=== ELD WEBSITES EVALUATION DETAILED REPORT ===\n\n";
    detailedReport += `Date: ${new Date().toISOString()}\n`;
    detailedReport += `Total websites evaluated: ${allResults.length}\n\n`;
    
    detailedReport += "=== TOP 10 WEBSITES OVERALL ===\n\n";
    websiteRanking.slice(0, 10).forEach((site, i) => {
      detailedReport += `${i+1}. ${site.name} - Total Score: ${site.score.toFixed(2)}/8\n`;
      detailedReport += `   URL: ${site.url}\n`;
      detailedReport += `   UI Aesthetics: ${site.breakdown.ui.toFixed(2)}/8\n`;
      detailedReport += `   UX Intuitiveness: ${site.breakdown.ux.toFixed(2)}/8\n`;
      detailedReport += `   Bug-Free Score: ${site.breakdown.bugs.toFixed(2)}/8\n`;
      detailedReport += `   ELD Accuracy: ${site.breakdown.eldAccuracy.toFixed(2)}/8\n`;
      detailedReport += `   Required Features: ${site.breakdown.requiredFeatures.toFixed(2)}/8\n\n`;
    });
    
    detailedReport += "=== CATEGORY WINNERS ===\n\n";
    detailedReport += `Best UI Design: ${categoryAnalysis.bestUI.name} (${categoryAnalysis.bestUI.breakdown.ui.toFixed(2)}/8)\n`;
    detailedReport += `Best UX Design: ${categoryAnalysis.bestUX.name} (${categoryAnalysis.bestUX.breakdown.ux.toFixed(2)}/8)\n`;
    detailedReport += `Most Bug-Free: ${categoryAnalysis.bestBugs.name} (${categoryAnalysis.bestBugs.breakdown.bugs.toFixed(2)}/8)\n`;
    detailedReport += `Best ELD Accuracy: ${categoryAnalysis.bestELDAccuracy.name} (${categoryAnalysis.bestELDAccuracy.breakdown.eldAccuracy.toFixed(2)}/8)\n`;
    detailedReport += `Most Complete Features: ${categoryAnalysis.bestRequiredFeatures.name} (${categoryAnalysis.bestRequiredFeatures.breakdown.requiredFeatures.toFixed(2)}/8)\n\n`;
    
    detailedReport += "=== AVERAGE SCORES ACROSS ALL WEBSITES ===\n\n";
    detailedReport += `Overall Average: ${avgTotal.toFixed(2)}/8\n`;
    detailedReport += `UI Aesthetics Average: ${avgUI.toFixed(2)}/8\n`;
    detailedReport += `UX Intuitiveness Average: ${avgUX.toFixed(2)}/8\n`;
    detailedReport += `Bug-Free Score Average: ${avgBugs.toFixed(2)}/8\n`;
    detailedReport += `ELD Accuracy Average: ${avgEldAccuracy.toFixed(2)}/8\n`;
    detailedReport += `Required Features Average: ${avgReqFeatures.toFixed(2)}/8\n\n`;
    
    detailedReport += "=== COMPLETE WEBSITE RANKING ===\n\n";
    websiteRanking.forEach((site, i) => {
      detailedReport += `${i+1}. ${site.name} (${site.score.toFixed(2)}/8)\n`;
    });
    
    fs.writeFileSync(detailedReportPath, detailedReport);
    
    console.log("Compilation complete!");
    console.log(`Total websites evaluated: ${allResults.length}`);
    console.log(`Detailed report saved to: ${detailedReportPath}`);
    console.log("Top 5 websites:");
    
    websiteRanking.slice(0, 5).forEach((site, i) => {
      console.log(`${i+1}. ${site.name} - Score: ${site.score.toFixed(2)}/8`);
    });
  } catch (error) {
    console.error(`Error compiling results: ${error.message}`);
  }
}

// Start testing
testAllWebsites(); 