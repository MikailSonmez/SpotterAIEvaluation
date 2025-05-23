// Results Compiler for ELD Trip Planner Evaluations
const fs = require('fs');
const path = require('path');

// Function to compile all evaluation results
function compileResults() {
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
  
  // Generate detailed report
  generateDetailedReport(results);
  
  // Generate summary spreadsheet data
  generateSpreadsheetData(results);
  
  console.log(`Compiled results for ${results.length} websites.`);
  return results;
}

// Function to generate a detailed report
function generateDetailedReport(results) {
  let report = '# ELD Trip Planner Evaluation Report\n\n';
  report += `Evaluation Date: ${new Date().toLocaleDateString()}\n\n`;
  report += `## Overall Rankings\n\n`;
  
  report += '| Rank | Website | Overall Score | ELD Accuracy | Required Features | UI Aesthetics | UX Intuitiveness | Bugs |\n';
  report += '|------|---------|---------------|--------------|-------------------|--------------|-----------------|------|\n';
  
  results.forEach((result, index) => {
    if (!result.finalScores) return;
    
    report += `| ${index + 1} | [${result.url}](${result.url}) | ${result.finalScores.overall.toFixed(1)} | ${result.finalScores.eldAccuracy} | ${result.finalScores.requiredFeatures} | ${result.finalScores.uiAesthetics} | ${result.finalScores.uxIntuitiveness} | ${result.finalScores.bugs} |\n`;
  });
  
  report += '\n## Top 3 Websites Detailed Review\n\n';
  
  // Detailed review of top 3
  for (let i = 0; i < Math.min(3, results.length); i++) {
    const result = results[i];
    if (!result.finalScores) continue;
    
    report += `### ${i + 1}. ${result.url}\n\n`;
    report += `**Overall Score:** ${result.finalScores.overall.toFixed(1)}/5\n\n`;
    
    report += '#### Strengths:\n';
    // Identify strengths
    const strengths = [];
    if (result.finalScores.eldAccuracy >= 4) strengths.push('Excellent ELD log accuracy and representation');
    if (result.finalScores.requiredFeatures >= 4) strengths.push('Complete implementation of required features');
    if (result.finalScores.uiAesthetics >= 4) strengths.push('Outstanding UI design and visual appeal');
    if (result.finalScores.uxIntuitiveness >= 4) strengths.push('Highly intuitive user experience');
    if (result.finalScores.bugs >= 4) strengths.push('Very few bugs or technical issues');
    
    // Add some general strengths if specific ones are lacking
    if (strengths.length < 2) {
      if (result.finalScores.overall >= 3.5) strengths.push('Good overall implementation of requirements');
      strengths.push('Functional core features');
    }
    
    strengths.forEach(strength => {
      report += `- ${strength}\n`;
    });
    
    report += '\n#### Weaknesses:\n';
    // Identify weaknesses
    const weaknesses = [];
    if (result.finalScores.eldAccuracy <= 3) weaknesses.push('ELD log accuracy needs improvement');
    if (result.finalScores.requiredFeatures <= 3) weaknesses.push('Missing some required features');
    if (result.finalScores.uiAesthetics <= 3) weaknesses.push('UI design could be more polished');
    if (result.finalScores.uxIntuitiveness <= 3) weaknesses.push('User experience could be more intuitive');
    if (result.finalScores.bugs <= 3) weaknesses.push('Contains noticeable bugs or technical issues');
    
    // Add some general weaknesses if specific ones are lacking
    if (weaknesses.length < 2) {
      weaknesses.push('Could benefit from additional optimization');
      weaknesses.push('Further refinement needed for production readiness');
    }
    
    weaknesses.forEach(weakness => {
      report += `- ${weakness}\n`;
    });
    
    report += '\n#### Improvement Suggestions:\n';
    // Generate improvement suggestions based on scores
    const improvements = [];
    
    if (result.finalScores.eldAccuracy < 5) 
      improvements.push('Enhance ELD log visualization accuracy to better represent Hours of Service regulations');
    
    if (result.finalScores.requiredFeatures < 5) 
      improvements.push('Complete implementation of all required features, especially route visualization and daily log sheets');
    
    if (result.finalScores.uiAesthetics < 5) 
      improvements.push('Refine UI design with consistent styling, better color schemes, and professional visual elements');
    
    if (result.finalScores.uxIntuitiveness < 5) 
      improvements.push('Improve user experience with clearer navigation, better form validation, and helpful guidance');
    
    if (result.finalScores.bugs < 5) 
      improvements.push('Fix identified bugs and perform thorough testing to ensure application stability');
    
    // Add some general improvements
    improvements.push('Implement user feedback collection to guide future improvements');
    improvements.push('Add advanced features like trip history, driver profiles, or weather integration');
    
    improvements.forEach(improvement => {
      report += `- ${improvement}\n`;
    });
    
    report += '\n#### Notes:\n';
    result.notes.forEach(note => {
      report += `- ${note}\n`;
    });
    
    report += '\n';
  }
  
  report += '## Testing Methodology\n\n';
  report += 'Each application was evaluated using automated and manual testing techniques with the following focus areas:\n\n';
  report += '1. **Input Field Verification**: Checking for required input fields (current location, pickup location, dropoff location, current cycle hours)\n';
  report += '2. **Route Generation Testing**: Submitting trip details and verifying route calculation and visualization\n';
  report += '3. **ELD Log Generation**: Verifying accuracy and completeness of generated Electronic Logging Device records\n';
  report += '4. **UI/UX Assessment**: Evaluating design quality, intuitiveness, and user experience\n';
  report += '5. **Bug Detection**: Identifying technical issues and functional problems\n\n';
  report += 'Each category was scored on a scale of 1-5, with 5 being excellent and 1 being poor. The overall score is an average of all categories.\n';
  
  // Write report to file
  fs.writeFileSync('evaluation_report.md', report);
  console.log('Detailed report generated: evaluation_report.md');
}

// Function to generate spreadsheet data
function generateSpreadsheetData(results) {
  let csv = 'Website URL,Overall Score,ELD Accuracy,Required Features,UI Aesthetics,UX Intuitiveness,Bugs,Rank\n';
  
  results.forEach((result, index) => {
    if (!result.finalScores) return;
    
    csv += `${result.url},${result.finalScores.overall.toFixed(1)},${result.finalScores.eldAccuracy},${result.finalScores.requiredFeatures},${result.finalScores.uiAesthetics},${result.finalScores.uxIntuitiveness},${result.finalScores.bugs},${index + 1}\n`;
  });
  
  // Write CSV to file
  fs.writeFileSync('evaluation_spreadsheet.csv', csv);
  console.log('Spreadsheet data generated: evaluation_spreadsheet.csv');
}

// Run the compiler
compileResults();
