# SpotterAI ELD Trip Planner Evaluations

This repository contains a comprehensive testing and evaluation framework for assessing ELD (Electronic Logging Device) Trip Planner applications. The framework is designed to systematically evaluate multiple applications based on predefined criteria to identify the best implementations.

## Project Purpose

The framework tests and evaluates trip planning applications that take the following inputs:
- Current location
- Pickup location
- Dropoff location
- Current Cycle Used (Hours)

And produce the following outputs:
- Map showing route and information regarding stops and rests
- Daily Log Sheets filled out with proper ELD regulations

## Evaluation Criteria

Each application is evaluated on a scale of 1-5 in the following categories:

1. **Accuracy of ELD Drawings**
   - Proper HOS (Hours of Service) representation
   - Accurate status changes
   - Correct calculation of available drive time
   - Proper representation of breaks and rest periods

2. **Required Inputs and Outputs**
   - Implementation of all required input fields
   - Route map output
   - Stop and rest information output
   - Daily log sheets output

3. **UI Aesthetics**
   - Visual design quality
   - Color scheme and readability
   - Layout and organization
   - Responsive design

4. **UX Intuitiveness**
   - Ease of navigation
   - Clear workflow
   - Predictable behavior
   - Helpful feedback and error messages

5. **Bugs**
   - Form validation issues
   - Calculation errors
   - Visual glitches
   - Functional problems
   - API integration issues

## Project Structure

- `eld_test_suite.js` - Main test suite for automated evaluation
- `individual_site_tests.js` - Detailed tests for specific websites
- `compile_results.js` - Script to compile evaluation results
- `google_sheets_export.js` - Script to export results in Google Sheets format
- `evaluation_framework.md` - Detailed description of the evaluation criteria
- `manual_testing_template.md` - Template for conducting manual assessments
- `playwright.config.js` - Configuration for Playwright testing

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm

### Installation

1. Clone this repository
2. Install dependencies:
```
npm install
```
3. Install Playwright browsers:
```
npx playwright install
```

### Running Tests

To run the automated test suite across all websites:
```
npm test
```

To run tests with browser UI visible:
```
npm run test:headed
```

To run tests for specific sites:
```
npm run test:site
```

### Generating Reports

To compile evaluation results:
```
npm run compile-results
```

To generate Google Sheets export:
```
npm run sheets-export
```

## Testing Methodology

The evaluation combines both automated and manual testing:

1. **Automated Testing**
   - Verification of required input fields
   - Route generation testing
   - ELD log presence and format checking
   - UI/UX assessment
   - Bug detection

2. **Manual Testing**
   - Detailed evaluation of ELD compliance
   - HOS regulation accuracy assessment
   - Detailed UI/UX assessment
   - Edge case testing

## Results

After running the evaluation, the following outputs are generated:

1. `evaluation_report.md` - Comprehensive evaluation report
2. `evaluation_spreadsheet.csv` - Tabular results for all websites
3. `eld_evaluations_for_sheets.tsv` - Google Sheets compatible format
4. `top3_detailed_analysis.md` - In-depth analysis of the top 3 websites
5. Individual JSON files for each website with detailed results

## Manual Site Testing

For manual testing of individual sites, use the `manual_testing_template.md` file as a guide.

## Troubleshooting

If you encounter issues:

1. Check that the website is still operational
2. Ensure all dependencies are installed
3. Try with different browsers
4. Increase timeouts for slow-loading sites

## License

This project is proprietary and not licensed for public use.

# Website Evaluation Tools

A set of tools for automatically evaluating trucker ELD/HOS websites with comprehensive scoring and detailed reports.

## Features

- Automated testing of multiple websites
- Detailed scoring across 5 key categories:
  - UI Aesthetics (10 points)
  - UX Intuitiveness (10 points)
  - Bug-Free Rating (10 points)
  - Required Features (10 points)
  - ELD Accuracy (10 points)
- Screenshot capture for visual verification
- Comprehensive reports in multiple formats (JSON, CSV, plain text)
- Ranking system to compare websites
- Category winners identification

## Requirements

- Node.js 14+ 
- Playwright (`npm install playwright`)

## Scripts

### Test Multiple Websites

```bash
node test_multiple_websites.js [url1] [url2] [url3] ...
```

This script tests multiple websites and generates:
- Individual JSON evaluation files for each website
- A CSV report with scores for all websites
- A summary text report with rankings and category winners

If no URLs are provided, it will use a default list of websites.

### Test Single Website (Enhanced)

```bash
node test_single_website_enhanced.js https://example.com
```

Tests a single website using the enhanced evaluation system and provides a detailed console report.

## Evaluation Criteria

### UI Aesthetics (10 points)
- Professional Design (3 points)
- Color Scheme (2 points)
- Layout (3 points)
- Responsive Design (2 points)

### UX Intuitiveness (10 points)
- Navigation (2 points)
- Form Labels (2 points)
- User Feedback (3 points)
- Accessibility (3 points)

### Bug-Free Rating (10 points)
- Console Errors (3 points)
- Functional Issues (3 points)
- Form Validation (2 points)
- Visual Glitches (2 points)

### Required Features (10 points)
- Location Inputs (2 points)
- Hours Inputs (2 points)
- Route Map (3 points)
- ELD Logs (3 points)

### ELD Accuracy (10 points)
- HOS Visualization (3 points)
- Status Changes (2 points)
- Drive Time Calculation (3 points)
- Breaks Representation (2 points)

## Output Files

All output files are saved in the `results` directory:
- `website_scores_[timestamp].csv` - CSV report with scores for all websites
- `summary_report_[timestamp].txt` - Text summary with rankings and category winners
- `[website_name]_evaluation.json` - Detailed JSON evaluation for each website
- `[website_name]_initial.png` - Screenshot of initial page load
- `[website_name]_mobile.png` - Screenshot of mobile view
- `[website_name]_results.png` - Screenshot after form submission (if successful)

## Example Usage

To test the top 5 websites from a previous evaluation:

```bash
node test_multiple_websites.js https://driver-logbook.vercel.app/ https://spotter.lavandesn.com/ https://tripapp-ydoc.onrender.com https://eld-log-app-git-main-mert-gokhan-donmezs-projects.vercel.app/ https://tracking-user-app.netlify.app/
```

To test a single website with detailed output:

```bash
node test_single_website_enhanced.js https://driver-logbook.vercel.app/
```
