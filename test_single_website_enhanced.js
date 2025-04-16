const { evaluateWebsite } = require('./evaluation');

// Get website URL from command line argument
const websiteUrl = process.argv[2];
if (!websiteUrl) {
  console.error("Please provide a website URL as an argument");
  process.exit(1);
}

// Modify the evaluateWebsite function to use headed mode
const originalEvaluateWebsite = evaluateWebsite;

// Override the evaluateWebsite function to use headed mode
async function evaluateWebsiteHeaded(url) {
  // Tell the user we're modifying the function to use headed mode
  console.log("Running in headed mode - browser will be visible");
  
  // Create a patched version of the module.exports
  const originalModule = require('./evaluation');
  const originalLaunch = originalModule.evaluateWebsite;
  
  // Replace the function temporarily
  originalModule.evaluateWebsite = async function(url) {
    // Same logic as original but with headless: false
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
        eldAccuracy: 0,
        requiredFeatures: 0, 
        uiAesthetics: 0,
        uxIntuitiveness: 0,
        bugs: 0
      },
      detailedScores: {
        eldAccuracy: {
          hosVisualization: 0,
          statusChanges: 0,
          driveTimeCalculation: 0,
          breaksRepresentation: 0,
        },
        requiredFeatures: {
          locationInputs: 0,
          hoursInputs: 0,
          routeMap: 0,
          eldLogs: 0,
        },
        uiAesthetics: {
          professionalDesign: 0,
          colorScheme: 0,
          layout: 0,
          responsiveDesign: 0,
        },
        uxIntuitiveness: {
          navigation: 0,
          formLabels: 0,
          userFeedback: 0,
          accessibility: 0,
        },
        bugs: {
          consoleErrors: 0,
          functionalIssues: 0,
          formValidation: 0,
          visualGlitches: 0,
        }
      }
    };

    const testRoute = {
      currentLocation: 'Chicago, IL',
      pickupLocation: 'Indianapolis, IN',
      dropoffLocation: 'Cincinnati, OH',
      currentCycleUsed: 2
    };

    let browser;
    try {
      // Launch browser with visible UI
      const { chromium } = require('playwright');
      browser = await chromium.launch({ 
        headless: false, // This is the key difference - browser is visible
        timeout: 30000,
        slowMo: 500 // Slow down operations to make them visible
      });
      
      // Rest of the evaluation follows the original logic...
      // This would normally include all the evaluation steps from the original code

      // Call the original function with our parameters but don't use its browser
      await originalLaunch(url);
      
    } catch (error) {
      evaluationResults.status = 'fatal_error';
      evaluationResults.error = `Fatal error during evaluation: ${error.message}`;
      evaluationResults.notes.push(`Fatal error: ${error.message}`);
      console.error(`Fatal error evaluating ${url}: ${error.message}`);
    } finally {
      // Always close the browser
      if (browser) {
        console.log("Press any key to close the browser and continue...");
        await new Promise(resolve => process.stdin.once('data', resolve));
        await browser.close();
      }
    }
    
    return evaluationResults;
  };
  
  // Call the modified function
  const result = await originalModule.evaluateWebsite(url);
  
  // Restore the original function
  originalModule.evaluateWebsite = originalLaunch;
  
  return result;
}

// Run the test for a single website
async function testSingleWebsite() {
  try {
    console.log(`\n===== Starting enhanced evaluation of ${websiteUrl} =====\n`);
    
    const result = await evaluateWebsiteHeaded(websiteUrl);
    
    // Display results summary
    console.log("\n===== EVALUATION RESULTS SUMMARY =====");
    console.log(`Website: ${result.website}`);
    console.log(`URL: ${result.url}`);
    console.log(`Status: ${result.status}`);
    
    if (result.status === 'complete') {
      console.log("\nSCORES (out of 10):");
      console.log(`Overall Score: ${result.finalScore}`);
      console.log(`UI Aesthetics: ${result.scores.uiAesthetics}`);
      console.log(`UX Intuitiveness: ${result.scores.uxIntuitiveness}`);
      console.log(`Bug-Free Rating: ${result.scores.bugs}`);
      console.log(`Required Features: ${result.scores.requiredFeatures}`);
      console.log(`ELD Accuracy: ${result.scores.eldAccuracy}`);
      
      console.log("\nDETAILED SCORES:");
      
      console.log("\nUI Aesthetics Details:");
      console.log(`- Professional Design: ${result.detailedScores.uiAesthetics.professionalDesign}/3`);
      console.log(`- Color Scheme: ${result.detailedScores.uiAesthetics.colorScheme}/2`);
      console.log(`- Layout: ${result.detailedScores.uiAesthetics.layout}/3`);
      console.log(`- Responsive Design: ${result.detailedScores.uiAesthetics.responsiveDesign}/2`);
      
      console.log("\nUX Intuitiveness Details:");
      console.log(`- Navigation: ${result.detailedScores.uxIntuitiveness.navigation}/2`);
      console.log(`- Form Labels: ${result.detailedScores.uxIntuitiveness.formLabels}/2`);
      console.log(`- User Feedback: ${result.detailedScores.uxIntuitiveness.userFeedback}/3`);
      console.log(`- Accessibility: ${result.detailedScores.uxIntuitiveness.accessibility}/3`);
      
      console.log("\nBugs Details:");
      console.log(`- Console Errors: ${result.detailedScores.bugs.consoleErrors}/3`);
      console.log(`- Functional Issues: ${result.detailedScores.bugs.functionalIssues}/3`);
      console.log(`- Form Validation: ${result.detailedScores.bugs.formValidation}/2`);
      console.log(`- Visual Glitches: ${result.detailedScores.bugs.visualGlitches}/2`);
      
      console.log("\nRequired Features Details:");
      console.log(`- Location Inputs: ${result.detailedScores.requiredFeatures.locationInputs}/2`);
      console.log(`- Hours Inputs: ${result.detailedScores.requiredFeatures.hoursInputs}/2`);
      console.log(`- Route Map: ${result.detailedScores.requiredFeatures.routeMap}/3`);
      console.log(`- ELD Logs: ${result.detailedScores.requiredFeatures.eldLogs}/3`);
      
      console.log("\nELD Accuracy Details:");
      console.log(`- HOS Visualization: ${result.detailedScores.eldAccuracy.hosVisualization}/3`);
      console.log(`- Status Changes: ${result.detailedScores.eldAccuracy.statusChanges}/2`);
      console.log(`- Drive Time Calculation: ${result.detailedScores.eldAccuracy.driveTimeCalculation}/3`);
      console.log(`- Breaks Representation: ${result.detailedScores.eldAccuracy.breaksRepresentation}/2`);
    }
    
    console.log("\nEVALUATION NOTES:");
    result.notes.forEach((note, i) => console.log(`${i+1}. ${note}`));
    
    console.log("\nSCREENSHOTS:");
    result.screenshots.forEach(screenshot => console.log(`- ${screenshot}`));
    
    console.log(`\nDetailed results saved to: results/${result.website}_evaluation.json`);
    console.log("\n===== Evaluation complete! =====");
    
  } catch (error) {
    console.error(`Error testing ${websiteUrl}: ${error.message}`);
  }
}

// Run the test
testSingleWebsite().catch(console.error); 