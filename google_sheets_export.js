// Google Sheets Export Script for ELD Trip Planner Evaluations
const fs = require('fs');
const path = require('path');

// Function to compile all evaluation results into Google Sheets format
function createGoogleSheetsExport() {
  const results = [];
  const directory = __dirname;
  
  // Read all evaluation JSON files
  const files = fs.readdirSync(directory).filter(file => file.endsWith('_evaluation.json'));
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    results.push(data);
  });
  
  // Sort results by overall score (highest first)
  results.sort((a, b) => (b.finalScores?.overall || 0) - (a.finalScores?.overall || 0));
  
  // Generate Google Sheets compatible TSV format
  generateTSV(results);
  
  // Generate ranking explanation for top 3
  generateTop3Explanations(results);
  
  console.log(`Prepared Google Sheets export for ${results.length} websites.`);
  return results;
}

// Function to generate TSV data (Tab Separated Values - easily pasteable to Google Sheets)
function generateTSV(results) {
  // Header row
  let tsv = 'Website URL\tOverall Score (1-5)\tELD Accuracy (1-5)\tRequired Features (1-5)\tUI Aesthetics (1-5)\tUX Intuitiveness (1-5)\tBugs (1-5)\tRank\tNotes\n';
  
  results.forEach((result, index) => {
    if (!result.finalScores) return;
    
    // Combine notes into a single string with semicolon separators
    const notesText = result.notes ? result.notes.join('; ') : '';
    
    tsv += `${result.url}\t${result.finalScores.overall.toFixed(1)}\t${result.finalScores.eldAccuracy}\t${result.finalScores.requiredFeatures}\t${result.finalScores.uiAesthetics}\t${result.finalScores.uxIntuitiveness}\t${result.finalScores.bugs}\t${index + 1}\t${notesText}\n`;
  });
  
  // Write TSV to file
  fs.writeFileSync('eld_evaluations_for_sheets.tsv', tsv);
  console.log('Google Sheets data generated: eld_evaluations_for_sheets.tsv');
}

// Function to generate detailed explanations for top 3 websites
function generateTop3Explanations(results) {
  let explanation = `# Top 3 ELD Trip Planner Websites - Detailed Analysis\n\n`;
  
  // Detailed review of top 3
  for (let i = 0; i < Math.min(3, results.length); i++) {
    const result = results[i];
    if (!result.finalScores) continue;
    
    explanation += `## ${i + 1}. ${result.url}\n\n`;
    explanation += `**Overall Score:** ${result.finalScores.overall.toFixed(1)}/5\n\n`;
    
    // Category scores
    explanation += `### Category Scores\n`;
    explanation += `- ELD Accuracy: ${result.finalScores.eldAccuracy}/5\n`;
    explanation += `- Required Features: ${result.finalScores.requiredFeatures}/5\n`;
    explanation += `- UI Aesthetics: ${result.finalScores.uiAesthetics}/5\n`;
    explanation += `- UX Intuitiveness: ${result.finalScores.uxIntuitiveness}/5\n`;
    explanation += `- Bugs: ${result.finalScores.bugs}/5\n\n`;
    
    explanation += `### Detailed Reasoning\n`;
    explanation += `This application earned a top ranking because it demonstrates ${getStrengthSummary(result.finalScores)}. `;
    explanation += `The implementation of ELD log visualization ${getEldCommentary(result.finalScores.eldAccuracy)} `;
    explanation += `and the required features ${getFeatureCommentary(result.finalScores.requiredFeatures)}. `;
    explanation += `From a user perspective, the interface ${getUICommentary(result.finalScores.uiAesthetics)} `;
    explanation += `with ${getUXCommentary(result.finalScores.uxIntuitiveness)} interactions. `;
    explanation += `In terms of stability, the application ${getBugCommentary(result.finalScores.bugs)}.\n\n`;
    
    explanation += `### Strengths\n`;
    const strengths = getStrengths(result.finalScores);
    strengths.forEach(strength => {
      explanation += `- ${strength}\n`;
    });
    explanation += `\n`;
    
    explanation += `### Weaknesses\n`;
    const weaknesses = getWeaknesses(result.finalScores);
    weaknesses.forEach(weakness => {
      explanation += `- ${weakness}\n`;
    });
    explanation += `\n`;
    
    explanation += `### Product Improvement Recommendations\n`;
    const improvements = getImprovements(result.finalScores);
    improvements.forEach(improvement => {
      explanation += `- ${improvement}\n`;
    });
    explanation += `\n\n`;
  }
  
  // Write to file
  fs.writeFileSync('top3_detailed_analysis.md', explanation);
  console.log('Top 3 detailed analysis generated: top3_detailed_analysis.md');
}

// Helper functions for generating commentary

function getStrengthSummary(scores) {
  const strengths = [];
  if (scores.eldAccuracy >= 4) strengths.push('excellent ELD accuracy');
  if (scores.requiredFeatures >= 4) strengths.push('comprehensive feature implementation');
  if (scores.uiAesthetics >= 4) strengths.push('polished visual design');
  if (scores.uxIntuitiveness >= 4) strengths.push('intuitive user experience');
  if (scores.bugs >= 4) strengths.push('technical stability');
  
  if (strengths.length === 0) return 'adequate performance across all evaluation areas';
  if (strengths.length === 1) return strengths[0];
  if (strengths.length === 2) return `${strengths[0]} and ${strengths[1]}`;
  
  const lastStrength = strengths.pop();
  return `${strengths.join(', ')}, and ${lastStrength}`;
}

function getEldCommentary(score) {
  switch(Math.floor(score)) {
    case 5: return 'is exceptional, accurately representing all HOS regulations with clear visual distinction between duty statuses';
    case 4: return 'is very good, correctly displaying most HOS rules and status changes';
    case 3: return 'is adequate, showing basic HOS information but lacking some regulatory details';
    case 2: return 'needs significant improvement, with several inaccuracies in HOS representation';
    case 1: 
    default: return 'is severely lacking, with major issues in how driver logs are displayed';
  }
}

function getFeatureCommentary(score) {
  switch(Math.floor(score)) {
    case 5: return 'are completely implemented with all required inputs and outputs functioning as specified';
    case 4: return 'are mostly complete with only minor omissions';
    case 3: return 'cover the basics but are missing some important elements';
    case 2: return 'are partially implemented but lack several critical components';
    case 1: 
    default: return 'are largely incomplete or non-functional';
  }
}

function getUICommentary(score) {
  switch(Math.floor(score)) {
    case 5: return 'is exceptionally well-designed with professional aesthetics';
    case 4: return 'looks polished with good visual hierarchy and consistent styling';
    case 3: return 'has a reasonable appearance but could use more refinement';
    case 2: return 'has noticeable design issues that detract from the experience';
    case 1: 
    default: return 'has poor visual design that significantly hinders usability';
  }
}

function getUXCommentary(score) {
  switch(Math.floor(score)) {
    case 5: return 'highly intuitive and user-friendly';
    case 4: return 'mostly intuitive and easy-to-navigate';
    case 3: return 'acceptably usable but with some confusing';
    case 2: return 'frequently confusing and frustrating';
    case 1: 
    default: return 'very difficult to use and understand';
  }
}

function getBugCommentary(score) {
  switch(Math.floor(score)) {
    case 5: return 'runs flawlessly with no observable bugs';
    case 4: return 'is quite stable with only minor issues';
    case 3: return 'has a moderate number of bugs that occasionally affect functionality';
    case 2: return 'has numerous bugs that frequently impact usability';
    case 1: 
    default: return 'is severely unstable with critical bugs that prevent proper use';
  }
}

function getStrengths(scores) {
  const strengths = [];
  
  if (scores.eldAccuracy >= 4) {
    strengths.push('Excellent representation of Hours of Service regulations');
    if (scores.eldAccuracy === 5) {
      strengths.push('Perfect visualization of different duty statuses');
      strengths.push('Comprehensive log sheets with all required information');
    }
  }
  
  if (scores.requiredFeatures >= 4) {
    strengths.push('Complete implementation of all required inputs and outputs');
    if (scores.requiredFeatures === 5) {
      strengths.push('Well-integrated map showing route details');
      strengths.push('Clear presentation of rest stops and break information');
    }
  }
  
  if (scores.uiAesthetics >= 4) {
    strengths.push('Visually appealing interface with professional design');
    if (scores.uiAesthetics === 5) {
      strengths.push('Excellent use of color, typography and spacing');
      strengths.push('Consistent and polished visual elements throughout');
    }
  }
  
  if (scores.uxIntuitiveness >= 4) {
    strengths.push('Intuitive user experience requiring minimal learning');
    if (scores.uxIntuitiveness === 5) {
      strengths.push('Exceptional workflow design that guides the user naturally');
      strengths.push('Helpful feedback and instructions throughout the process');
    }
  }
  
  if (scores.bugs >= 4) {
    strengths.push('Technically stable application with few bugs');
    if (scores.bugs === 5) {
      strengths.push('Robust error handling and validation');
      strengths.push('Smooth performance across different scenarios');
    }
  }
  
  // If we don't have enough strengths, add general ones
  if (strengths.length < 3) {
    if (scores.overall >= 3.5 && !strengths.includes('Functional core features that meet basic requirements')) {
      strengths.push('Functional core features that meet basic requirements');
    }
    if (!strengths.includes('Provides the essential trip planning capabilities')) {
      strengths.push('Provides the essential trip planning capabilities');
    }
  }
  
  return strengths.slice(0, 5); // Return up to 5 strengths
}

function getWeaknesses(scores) {
  const weaknesses = [];
  
  if (scores.eldAccuracy <= 3) {
    weaknesses.push('ELD log accuracy needs improvement');
    if (scores.eldAccuracy <= 2) {
      weaknesses.push('Incorrect representation of Hours of Service regulations');
      weaknesses.push('Inadequate visualization of duty status changes');
    }
  }
  
  if (scores.requiredFeatures <= 3) {
    weaknesses.push('Missing some required features');
    if (scores.requiredFeatures <= 2) {
      weaknesses.push('Incomplete implementation of route mapping');
      weaknesses.push('Insufficient rest and break planning');
    }
  }
  
  if (scores.uiAesthetics <= 3) {
    weaknesses.push('UI design could be more polished');
    if (scores.uiAesthetics <= 2) {
      weaknesses.push('Inconsistent visual styling');
      weaknesses.push('Poor use of color and typography');
    }
  }
  
  if (scores.uxIntuitiveness <= 3) {
    weaknesses.push('User experience could be more intuitive');
    if (scores.uxIntuitiveness <= 2) {
      weaknesses.push('Confusing workflow and navigation');
      weaknesses.push('Lack of helpful guidance and feedback');
    }
  }
  
  if (scores.bugs <= 3) {
    weaknesses.push('Contains noticeable bugs or technical issues');
    if (scores.bugs <= 2) {
      weaknesses.push('Frequent errors during normal operation');
      weaknesses.push('Poor form validation and error handling');
    }
  }
  
  // If we don't have enough weaknesses (rare for a perfect app), add some areas for improvement
  if (weaknesses.length < 2) {
    weaknesses.push('Could benefit from additional optimization and polish');
    weaknesses.push('Has room for enhancement with additional features');
  }
  
  return weaknesses.slice(0, 5); // Return up to 5 weaknesses
}

function getImprovements(scores) {
  const improvements = [];
  
  if (scores.eldAccuracy < 5) {
    improvements.push('Enhance ELD log visualization to better represent HOS regulations');
    if (scores.eldAccuracy <= 3) {
      improvements.push('Implement accurate duty status graphs with proper time scales');
      improvements.push('Add detailed log sheets with all required ELD information');
    }
  }
  
  if (scores.requiredFeatures < 5) {
    improvements.push('Complete implementation of all required inputs and outputs');
    if (scores.requiredFeatures <= 3) {
      improvements.push('Improve map integration with clearer route visualization');
      improvements.push('Add comprehensive rest stop planning with HOS considerations');
    }
  }
  
  if (scores.uiAesthetics < 5) {
    improvements.push('Refine UI design with more professional styling');
    if (scores.uiAesthetics <= 3) {
      improvements.push('Implement a consistent color scheme and typography system');
      improvements.push('Improve layout organization and visual hierarchy');
    }
  }
  
  if (scores.uxIntuitiveness < 5) {
    improvements.push('Enhance user experience with clearer workflows');
    if (scores.uxIntuitiveness <= 3) {
      improvements.push('Redesign navigation to be more intuitive and accessible');
      improvements.push('Add contextual help and improved form validation');
    }
  }
  
  if (scores.bugs < 5) {
    improvements.push('Fix existing bugs and improve application stability');
    if (scores.bugs <= 3) {
      improvements.push('Implement robust error handling and validation');
      improvements.push('Conduct thorough testing across different scenarios');
    }
  }
  
  // Add general improvement suggestions
  improvements.push('Implement user feedback collection to guide future development');
  improvements.push('Add advanced features like trip history, driver profiles, and weather integration');
  improvements.push('Develop a mobile app version for on-the-road use by drivers');
  
  return improvements.slice(0, 7); // Return up to 7 improvements
}

// Run the export
createGoogleSheetsExport();
