const { evaluateWebsite } = require('./evaluate_website');
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
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

// Main function to test all websites
async function evaluateAllWebsites() {
  console.log("Starting evaluation of all websites...");
  
  const startTime = new Date();
  console.log(`Test batch started at: ${startTime.toISOString()}`);
  
  const batchResults = {
    startTime: startTime.toISOString(),
    endTime: null,
    totalWebsites: websites.length,
    successfulEvaluations: 0,
    failedEvaluations: 0,
    websiteScores: []
  };
  
  // Process websites one by one to avoid overwhelming the system
  for (let i = 0; i < websites.length; i++) {
    const website = websites[i];
    console.log(`\n[${i+1}/${websites.length}] Evaluating ${website.name} (${website.url})`);
    
    try {
      const results = await evaluateWebsite(website);
      
      // Add to batch results
      batchResults.websiteScores.push({
        name: website.name,
        url: website.url,
        status: results.status,
        finalScore: results.scores.finalScore,
        uiScore: results.scores.uiAesthetics,
        uxScore: results.scores.uxIntuitiveness,
        bugsScore: results.scores.bugs,
        featuresScore: results.scores.requiredFeatures
      });
      
      if (results.status === 'complete') {
        batchResults.successfulEvaluations++;
      } else {
        batchResults.failedEvaluations++;
      }
      
      console.log(`Evaluation complete: Score ${results.scores.finalScore}/10`);
    } catch (error) {
      console.error(`Failed to evaluate ${website.name}: ${error.message}`);
      batchResults.failedEvaluations++;
      batchResults.websiteScores.push({
        name: website.name,
        url: website.url,
        status: 'error',
        error: error.message
      });
    }
    
    // Small pause between tests
    if (i < websites.length - 1) {
      console.log("Pausing before next evaluation...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Record end time and save batch results
  const endTime = new Date();
  batchResults.endTime = endTime.toISOString();
  batchResults.totalDuration = (endTime - startTime) / 1000; // in seconds
  
  const batchResultsPath = path.join(resultsDir, `batch_results_${startTime.toISOString().replace(/:/g, '-')}.json`);
  fs.writeFileSync(batchResultsPath, JSON.stringify(batchResults, null, 2));
  
  // Generate a summary report
  await generateSummaryReport(batchResults);
  
  console.log(`\nAll evaluations completed in ${batchResults.totalDuration} seconds`);
  console.log(`Successful: ${batchResults.successfulEvaluations}, Failed: ${batchResults.failedEvaluations}`);
  console.log(`Batch results saved to: ${batchResultsPath}`);
}

async function generateSummaryReport(batchResults) {
  try {
    // Sort websites by score
    const rankedWebsites = [...batchResults.websiteScores]
      .filter(site => site.status === 'complete' && site.finalScore)
      .sort((a, b) => b.finalScore - a.finalScore);
    
    // Calculate averages
    const completeEvals = batchResults.websiteScores.filter(site => site.status === 'complete' && site.finalScore);
    const avgScore = completeEvals.reduce((sum, site) => sum + site.finalScore, 0) / completeEvals.length || 0;
    const avgUI = completeEvals.reduce((sum, site) => sum + site.uiScore, 0) / completeEvals.length || 0;
    const avgUX = completeEvals.reduce((sum, site) => sum + site.uxScore, 0) / completeEvals.length || 0;
    const avgBugs = completeEvals.reduce((sum, site) => sum + site.bugsScore, 0) / completeEvals.length || 0;
    const avgFeatures = completeEvals.reduce((sum, site) => sum + site.featuresScore, 0) / completeEvals.length || 0;
    
    // Create a detailed report file
    const summaryReportPath = path.join(resultsDir, `summary_report_${new Date().toISOString().replace(/:/g, '-')}.txt`);
    let summaryReport = "=== WEBSITE EVALUATION SUMMARY REPORT ===\n\n";
    summaryReport += `Date: ${new Date().toISOString()}\n`;
    summaryReport += `Total websites evaluated: ${batchResults.totalWebsites}\n`;
    summaryReport += `Successful evaluations: ${batchResults.successfulEvaluations}\n`;
    summaryReport += `Failed evaluations: ${batchResults.failedEvaluations}\n`;
    summaryReport += `Total duration: ${batchResults.totalDuration} seconds\n\n`;
    
    summaryReport += "=== TOP 10 WEBSITES ===\n\n";
    rankedWebsites.slice(0, 10).forEach((site, i) => {
      summaryReport += `${i+1}. ${site.name} - Final Score: ${site.finalScore.toFixed(1)}/10\n`;
      summaryReport += `   URL: ${site.url}\n`;
      summaryReport += `   UI Score: ${site.uiScore}/10 | UX Score: ${site.uxScore}/10 | Bugs Score: ${site.bugsScore}/10 | Features Score: ${site.featuresScore}/10\n\n`;
    });
    
    summaryReport += "=== AVERAGE SCORES ===\n\n";
    summaryReport += `Overall Average: ${avgScore.toFixed(1)}/10\n`;
    summaryReport += `UI Aesthetics Average: ${avgUI.toFixed(1)}/10\n`;
    summaryReport += `UX Intuitiveness Average: ${avgUX.toFixed(1)}/10\n`;
    summaryReport += `Bug-Free Score Average: ${avgBugs.toFixed(1)}/10\n`;
    summaryReport += `Required Features Average: ${avgFeatures.toFixed(1)}/10\n\n`;
    
    summaryReport += "=== COMPLETE RANKING ===\n\n";
    rankedWebsites.forEach((site, i) => {
      summaryReport += `${i+1}. ${site.name} (${site.finalScore.toFixed(1)}/10)\n`;
    });
    
    summaryReport += "\n=== FAILED EVALUATIONS ===\n\n";
    batchResults.websiteScores
      .filter(site => site.status !== 'complete')
      .forEach((site) => {
        summaryReport += `${site.name} (${site.url}): ${site.status}\n`;
        if (site.error) summaryReport += `   Error: ${site.error}\n`;
      });
    
    fs.writeFileSync(summaryReportPath, summaryReport);
    console.log(`Summary report saved to: ${summaryReportPath}`);
    
    // Create a CSV for easy import to spreadsheets
    const csvPath = path.join(resultsDir, `website_scores_${new Date().toISOString().replace(/:/g, '-')}.csv`);
    let csvContent = "Name,URL,Status,Final Score,UI Score,UX Score,Bugs Score,Features Score\n";
    
    batchResults.websiteScores.forEach(site => {
      csvContent += `"${site.name}","${site.url}","${site.status}",` +
        `${site.finalScore || "N/A"},${site.uiScore || "N/A"},${site.uxScore || "N/A"},` +
        `${site.bugsScore || "N/A"},${site.featuresScore || "N/A"}\n`;
    });
    
    fs.writeFileSync(csvPath, csvContent);
    console.log(`CSV report saved to: ${csvPath}`);
    
  } catch (error) {
    console.error(`Error generating summary report: ${error.message}`);
  }
}

// Start the process if this module is run directly
if (require.main === module) {
  evaluateAllWebsites().catch(err => {
    console.error("Error in batch evaluation:", err);
  });
}

module.exports = { evaluateAllWebsites }; 