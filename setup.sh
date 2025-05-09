#!/bin/bash

echo "======================================================"
echo "SpotterAI ELD Trip Planner Evaluation Setup"
echo "======================================================"
echo

echo "Checking for Node.js installation..."
if ! command -v node &> /dev/null; then
  echo "Node.js is not installed or not in PATH."
  echo "Please install Node.js from https://nodejs.org/"
  echo "Then run this script again."
  exit 1
fi

echo "Node.js found. Installing dependencies..."
npm install

echo "Installing Playwright browsers..."
npx playwright install

echo
echo "Setup complete! You can now run the following commands:"
echo
echo "  npm test                - Run all tests"
echo "  npm run test:headed     - Run tests with browser UI visible"
echo "  npm run test:site       - Test specific sites"
echo "  npm run compile-results - Compile evaluation results"
echo "  npm run sheets-export   - Create Google Sheets export"
echo
echo "For detailed usage instructions, see the README.md file."
echo
