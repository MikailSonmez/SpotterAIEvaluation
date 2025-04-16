const fs = require('fs');
const path = require('path');

// Ensure results directory exists
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  console.error('Results directory not found!');
  process.exit(1);
}

function generateSummaryReport() {
  try {
    console.log("Generating summary report from existing evaluations...");
    
    // Read all evaluation files
    const files = fs.readdirSync(resultsDir);
    const evaluationFiles = files.filter(file => file.endsWith('_evaluation.json'));
    
    if (evaluationFiles.length === 0) {
      console.error('No evaluation files found in results directory!');
      return;
    }
    
    console.log(`Found ${evaluationFiles.length} website evaluations`);
    
    const websiteResults = [];
    
    // Parse all evaluation files
    for (const file of evaluationFiles) {
      try {
        const data = fs.readFileSync(path.join(resultsDir, file), 'utf8');
        const result = JSON.parse(data);
        
        if (result.status === 'complete' || (result.scores && result.scores.finalScore)) {
          websiteResults.push({
            name: result.name,
            url: result.url,
            status: result.status,
            finalScore: result.scores.finalScore || 0,
            uiScore: result.scores.uiAesthetics || 0,
            uxScore: result.scores.uxIntuitiveness || 0,
            bugsScore: result.scores.bugs || 0,
            featuresScore: result.scores.requiredFeatures || 0,
            eldScore: result.scores.eldAccuracy || 0
          });
        } else {
          websiteResults.push({
            name: result.name,
            url: result.url,
            status: result.status,
            error: result.notes ? result.notes[0] : 'Unknown error'
          });
        }
      } catch (err) {
        console.error(`Error reading file ${file}: ${err.message}`);
      }
    }
    
    // Sort websites by score
    const rankedWebsites = websiteResults
      .filter(site => site.finalScore !== undefined)
      .sort((a, b) => b.finalScore - a.finalScore);
    
    // Calculate averages
    const completeEvals = websiteResults.filter(site => site.finalScore !== undefined);
    const avgScore = completeEvals.reduce((sum, site) => sum + site.finalScore, 0) / completeEvals.length || 0;
    const avgUI = completeEvals.reduce((sum, site) => sum + site.uiScore, 0) / completeEvals.length || 0;
    const avgUX = completeEvals.reduce((sum, site) => sum + site.uxScore, 0) / completeEvals.length || 0;
    const avgBugs = completeEvals.reduce((sum, site) => sum + site.bugsScore, 0) / completeEvals.length || 0;
    const avgFeatures = completeEvals.reduce((sum, site) => sum + site.featuresScore, 0) / completeEvals.length || 0;
    const avgEld = completeEvals.reduce((sum, site) => sum + site.eldScore, 0) / completeEvals.length || 0;
    
    // Create summary report
    const summaryReportPath = path.join(resultsDir, `summary_report_${new Date().toISOString().replace(/:/g, '-')}.txt`);
    let summaryReport = "=== WEBSITE EVALUATION SUMMARY REPORT ===\n\n";
    summaryReport += `Date: ${new Date().toISOString()}\n`;
    summaryReport += `Total websites evaluated: ${evaluationFiles.length}\n`;
    summaryReport += `Successful evaluations: ${completeEvals.length}\n`;
    summaryReport += `Failed evaluations: ${websiteResults.length - completeEvals.length}\n\n`;
    
    summaryReport += "=== WEBSITE RANKINGS ===\n\n";
    rankedWebsites.forEach((site, i) => {
      summaryReport += `${i+1}. ${site.name} - Final Score: ${site.finalScore.toFixed(1)}/10\n`;
      summaryReport += `   URL: ${site.url}\n`;
      summaryReport += `   UI: ${site.uiScore}/10 | UX: ${site.uxScore}/10 | Bugs: ${site.bugsScore}/10\n`;
      summaryReport += `   Features: ${site.featuresScore}/10 | ELD: ${site.eldScore}/10\n\n`;
    });
    
    summaryReport += "=== AVERAGE SCORES ===\n\n";
    summaryReport += `Overall Average: ${avgScore.toFixed(1)}/10\n`;
    summaryReport += `UI Aesthetics Average: ${avgUI.toFixed(1)}/10\n`;
    summaryReport += `UX Intuitiveness Average: ${avgUX.toFixed(1)}/10\n`;
    summaryReport += `Bug-Free Score Average: ${avgBugs.toFixed(1)}/10\n`;
    summaryReport += `Required Features Average: ${avgFeatures.toFixed(1)}/10\n`;
    summaryReport += `ELD Accuracy Average: ${avgEld.toFixed(1)}/10\n\n`;
    
    // Category winners
    const bestUI = rankedWebsites.slice().sort((a, b) => b.uiScore - a.uiScore)[0];
    const bestUX = rankedWebsites.slice().sort((a, b) => b.uxScore - a.uxScore)[0];
    const bestBugs = rankedWebsites.slice().sort((a, b) => b.bugsScore - a.bugsScore)[0];
    const bestFeatures = rankedWebsites.slice().sort((a, b) => b.featuresScore - a.featuresScore)[0];
    const bestELD = rankedWebsites.slice().sort((a, b) => b.eldScore - a.eldScore)[0];
    
    summaryReport += "=== CATEGORY WINNERS ===\n\n";
    if (bestUI) summaryReport += `Best UI Design: ${bestUI.name} (${bestUI.uiScore}/10)\n`;
    if (bestUX) summaryReport += `Best UX Design: ${bestUX.name} (${bestUX.uxScore}/10)\n`;
    if (bestBugs) summaryReport += `Most Bug-Free: ${bestBugs.name} (${bestBugs.bugsScore}/10)\n`;
    if (bestFeatures) summaryReport += `Most Complete Features: ${bestFeatures.name} (${bestFeatures.featuresScore}/10)\n`;
    if (bestELD) summaryReport += `Best ELD Implementation: ${bestELD.name} (${bestELD.eldScore}/10)\n\n`;
    
    // Failed evaluations
    const failedEvals = websiteResults.filter(site => site.finalScore === undefined);
    if (failedEvals.length > 0) {
      summaryReport += "=== FAILED EVALUATIONS ===\n\n";
      failedEvals.forEach(site => {
        summaryReport += `${site.name} (${site.url}): ${site.status}\n`;
        if (site.error) summaryReport += `   Error: ${site.error}\n\n`;
      });
    }
    
    // Write to file
    fs.writeFileSync(summaryReportPath, summaryReport);
    console.log(`Summary report saved to: ${summaryReportPath}`);
    
    // Create a CSV file
    const csvPath = path.join(resultsDir, `website_scores_${new Date().toISOString().replace(/:/g, '-')}.csv`);
    let csvContent = "Name,URL,Status,Final Score,UI Score,UX Score,Bugs Score,Features Score,ELD Score\n";
    
    websiteResults.forEach(site => {
      csvContent += `"${site.name}","${site.url}","${site.status || 'incomplete'}",` +
        `${site.finalScore !== undefined ? site.finalScore : "N/A"},` +
        `${site.uiScore !== undefined ? site.uiScore : "N/A"},` +
        `${site.uxScore !== undefined ? site.uxScore : "N/A"},` +
        `${site.bugsScore !== undefined ? site.bugsScore : "N/A"},` +
        `${site.featuresScore !== undefined ? site.featuresScore : "N/A"},` +
        `${site.eldScore !== undefined ? site.eldScore : "N/A"}\n`;
    });
    
    fs.writeFileSync(csvPath, csvContent);
    console.log(`CSV report saved to: ${csvPath}`);
    
    // Print top sites to console
    console.log("\nTOP 5 WEBSITES:");
    rankedWebsites.slice(0, 5).forEach((site, i) => {
      console.log(`${i+1}. ${site.name}: ${site.finalScore.toFixed(1)}/10`);
    });
    
    console.log("\nSUMMARY:");
    console.log(`Average score: ${avgScore.toFixed(1)}/10`);
    if (bestUI) console.log(`Best UI: ${bestUI.name} (${bestUI.uiScore}/10)`);
    if (bestELD) console.log(`Best ELD: ${bestELD.name} (${bestELD.eldScore}/10)`);
    
  } catch (error) {
    console.error(`Error generating summary report: ${error.message}`);
  }
}

// Generate the summary report
generateSummaryReport(); 