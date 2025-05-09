// In-Depth Evaluation of Top 3 ELD Trip Planner Applications
const { test, expect } = require('@playwright/test');

// Define our top 3 sites based on preliminary evaluation
const topSites = [
  {
    name: 'DriverLogbook',
    url: 'https://driver-logbook.vercel.app/',
    strengths: [
      'Exceptional ELD log visualization',
      'Professional UI design',
      'Intuitive user experience',
      'Accurate HOS calculations'
    ],
    weaknesses: [
      'No fueling stops for long routes',
      'Occasional performance lag with complex routes'
    ]
  },
  {
    name: 'SpotterLavandesn',
    url: 'https://spotter.lavandesn.com/',
    strengths: [
      'Comprehensive route planning',
      'Detailed log sheet generation',
      'Good usability',
      'Strong validation'
    ],
    weaknesses: [
      'Slightly less polished UI',
      'Some mobile responsiveness issues'
    ]
  },
  {
    name: 'EldGenerator',
    url: 'https://eld-generator.netlify.app',
    strengths: [
      'Accurate ELD calculations',
      'Clean interface',
      'Fast performance',
      'Good user guidance'
    ],
    weaknesses: [
      'Limited route visualization options',
      'Fewer advanced features'
    ]
  }
];

// Test Data
const testRoutes = [
  {
    scenario: 'Short Route',
    currentLocation: 'Chicago, IL',
    pickupLocation: 'Indianapolis, IN',
    dropoffLocation: 'Cincinnati, OH',
    currentCycleUsed: 2,
    expectedDriveTime: '5-6',  // hours
    expectedTotalDistance: '300-350'  // miles
  },
  {
    scenario: 'Medium Route',
    currentLocation: 'Seattle, WA',
    pickupLocation: 'Portland, OR',
    dropoffLocation: 'San Francisco, CA',
    currentCycleUsed: 4,
    expectedDriveTime: '12-15',  // hours
    expectedTotalDistance: '800-900'  // miles
  },
  {
    scenario: 'Long Route',
    currentLocation: 'New York, NY',
    pickupLocation: 'Chicago, IL',
    dropoffLocation: 'Denver, CO',
    currentCycleUsed: 6,
    expectedDriveTime: '24-30',  // hours
    expectedTotalDistance: '1800-2000'  // miles
  }
];

// Test each top site in detail
for (const site of topSites) {
  test.describe(`In-depth evaluation of ${site.name}`, () => {
    
    // Test all route scenarios
    for (const route of testRoutes) {
      test(`Testing ${route.scenario} scenario`, async ({ page }) => {
        // Navigate to the site
        await page.goto(site.url);
        await page.waitForLoadState('networkidle');
        
        // Take initial screenshot
        await page.screenshot({ path: `${site.name}_${route.scenario.replace(' ', '_')}_initial.png`, fullPage: true });
        
        // Fill out the form using our helper function
        await fillTripForm(page, route);
        
        // Wait for results to load
        await page.waitForTimeout(5000);
        
        // Take results screenshot
        await page.screenshot({ path: `${site.name}_${route.scenario.replace(' ', '_')}_results.png`, fullPage: true });
        
        // Perform detailed evaluation of results
        await evaluateResults(page, site, route);
      });
    }
    
    // Special tests for each site based on unique features or concerns
    
    // Test for DriverLogbook - Test multiple day log generation
    if (site.name === 'DriverLogbook') {
      test('Testing multiple day log generation', async ({ page }) => {
        await page.goto(site.url);
        await page.waitForLoadState('networkidle');
        
        // Use the long route for this test
        const longRoute = testRoutes.find(r => r.scenario === 'Long Route');
        await fillTripForm(page, longRoute);
        
        // Wait for results
        await page.waitForTimeout(5000);
        
        // Check for multiple day logs
        const hasDayHeaders = await page.evaluate(() => {
          const text = document.body.innerText;
          return text.includes('Day 1') && text.includes('Day 2');
        });
        
        console.log(`${site.name} has multiple day logs: ${hasDayHeaders}`);
        
        // Check for proper HOS reset periods
        const hasResetPeriods = await page.evaluate(() => {
          const text = document.body.innerText.toLowerCase();
          return text.includes('reset') || 
                 text.includes('10 hour') || 
                 text.includes('rest period') ||
                 text.includes('off duty');
        });
        
        console.log(`${site.name} shows proper HOS reset periods: ${hasResetPeriods}`);
      });
    }
    
    // Test for SpotterLavandesn - Test mobile responsiveness
    if (site.name === 'SpotterLavandesn') {
      test('Testing mobile responsiveness', async ({ page }) => {
        await page.goto(site.url);
        await page.waitForLoadState('networkidle');
        
        // Test various screen sizes
        const screenSizes = [
          { width: 375, height: 667, name: 'mobile' },
          { width: 768, height: 1024, name: 'tablet' },
          { width: 1280, height: 800, name: 'desktop' }
        ];
        
        for (const size of screenSizes) {
          await page.setViewportSize({ width: size.width, height: size.height });
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `${site.name}_${size.name}.png` });
          
          // Check for horizontal scrolling (a common responsive design issue)
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });
          
          console.log(`${site.name} on ${size.name} has horizontal scroll: ${hasHorizontalScroll}`);
          
          // Check if form inputs are accessible
          const formInputsAccessible = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input');
            for (const input of inputs) {
              const rect = input.getBoundingClientRect();
              if (rect.left < 0 || rect.right > window.innerWidth) {
                return false;
              }
            }
            return true;
          });
          
          console.log(`${site.name} on ${size.name} has accessible form inputs: ${formInputsAccessible}`);
        }
      });
    }
    
    // Test for EldGenerator - Test performance with complex routes
    if (site.name === 'EldGenerator') {
      test('Testing performance with complex routes', async ({ page }) => {
        await page.goto(site.url);
        await page.waitForLoadState('networkidle');
        
        // Use long route for performance testing
        const longRoute = testRoutes.find(r => r.scenario === 'Long Route');
        
        // Measure time to fill form and submit
        const startTime = Date.now();
        await fillTripForm(page, longRoute);
        
        // Wait for results with longer timeout
        await page.waitForTimeout(10000);
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        console.log(`${site.name} processing time for complex route: ${processingTime}ms`);
        
        // Check if the result appears to be accurate despite complexity
        const pageContent = await page.content();
        const hasTripDetails = pageContent.includes('Denver') && 
                              (pageContent.includes('distance') || 
                               pageContent.includes('mile') || 
                               pageContent.includes('km'));
        
        console.log(`${site.name} generated accurate results for complex route: ${hasTripDetails}`);
      });
    }
    
    // Accessibility testing for all sites
    test('Testing accessibility features', async ({ page }) => {
      await page.goto(site.url);
      await page.waitForLoadState('networkidle');
      
      // Check for proper semantic HTML
      const hasSemanticHTML = await page.evaluate(() => {
        const hasHeader = document.querySelector('header') !== null;
        const hasMain = document.querySelector('main') !== null;
        const hasFooter = document.querySelector('footer') !== null;
        const hasNav = document.querySelector('nav') !== null;
        
        return {
          hasHeader,
          hasMain,
          hasFooter,
          hasNav,
          overall: hasHeader || hasMain || hasFooter || hasNav
        };
      });
      
      console.log(`${site.name} semantic HTML status:`, hasSemanticHTML);
      
      // Check for ARIA attributes
      const hasARIA = await page.evaluate(() => {
        const elements = document.querySelectorAll('[aria-label], [aria-describedby], [aria-labelledby], [role]');
        return elements.length > 0;
      });
      
      console.log(`${site.name} has ARIA attributes: ${hasARIA}`);
      
      // Check for alt text on images
      const imagesWithoutAlt = await page.evaluate(() => {
        const images = document.querySelectorAll('img:not([alt]), img[alt=""]');
        return images.length;
      });
      
      console.log(`${site.name} images without alt text: ${imagesWithoutAlt}`);
    });
  });
}

// Helper function to fill trip planning form
async function fillTripForm(page, route) {
  try {
    // Try to find and fill location fields
    // Current Location
    await fillField(page, 
      'input[placeholder*="current"], input[placeholder*="start"], input[name*="current"], input[name*="start"], input[id*="current"], input[id*="start"]', 
      route.currentLocation);
    
    // Pickup Location
    await fillField(page,
      'input[placeholder*="pickup"], input[name*="pickup"], input[id*="pickup"]',
      route.pickupLocation);
    
    // Dropoff Location
    await fillField(page,
      'input[placeholder*="drop"], input[placeholder*="destination"], input[name*="drop"], input[name*="destination"], input[id*="drop"], input[id*="destination"]',
      route.dropoffLocation);
    
    // Hours
    await fillField(page,
      'input[type="number"], input[placeholder*="hour"], input[placeholder*="cycle"], input[name*="hour"], input[name*="cycle"], input[id*="hour"], input[id*="cycle"]',
      route.currentCycleUsed.toString());
    
    // Wait for any autocomplete suggestions
    await page.waitForTimeout(1000);
    
    // Submit the form
    await submitForm(page);
    
  } catch (error) {
    console.error('Error filling trip form:', error);
  }
}

// Helper function to fill a specific field
async function fillField(page, selector, value) {
  const field = await page.$(selector);
  if (field) {
    await field.fill(value);
    return true;
  }
  
  // If we can't find by specific selectors, try using the first few text inputs
  if (selector.includes('location') || selector.includes('pickup') || selector.includes('drop')) {
    const textInputs = await page.$$('input[type="text"]');
    if (textInputs.length >= 3) {
      if (selector.includes('current')) {
        await textInputs[0].fill(value);
        return true;
      } else if (selector.includes('pickup')) {
        await textInputs[1].fill(value);
        return true;
      } else if (selector.includes('drop') || selector.includes('destination')) {
        await textInputs[2].fill(value);
        return true;
      }
    }
  }
  
  // For hours input, try the first number input
  if (selector.includes('number') || selector.includes('hour') || selector.includes('cycle')) {
    const numberInputs = await page.$$('input[type="number"]');
    if (numberInputs.length > 0) {
      await numberInputs[0].fill(value);
      return true;
    }
  }
  
  return false;
}

// Helper function to submit the form
async function submitForm(page) {
  // Try different submit button selectors
  const submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Plan")',
    'button:has-text("Calculate")',
    'button:has-text("Generate")',
    'button:has-text("Submit")',
    'button:has-text("Create")',
    '.submit',
    '#submit'
  ];
  
  for (const selector of submitSelectors) {
    const button = await page.$(selector);
    if (button) {
      await button.click();
      return true;
    }
  }
  
  // If no specific button found, try the first button
  const buttons = await page.$$('button');
  if (buttons.length > 0) {
    await buttons[0].click();
    return true;
  }
  
  return false;
}

// Helper function to evaluate results
async function evaluateResults(page, site, route) {
  const results = {
    hasMap: false,
    hasEldLogs: false,
    hasRouteDetails: false,
    hasRestStops: false,
    hasFuelingStops: false,
    hasMultipleDays: false
  };
  
  // Check for map
  results.hasMap = await page.isVisible('.map, #map, [class*="map"], canvas, svg, iframe[src*="map"], iframe[src*="google"]');
  
  // Check for ELD logs
  results.hasEldLogs = await page.isVisible('.eld, #eld, [class*="log"], .log, #log, table, svg, canvas');
  
  // Check for route details
  results.hasRouteDetails = await page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    return text.includes('distance') || 
           text.includes('duration') || 
           text.includes('mile') || 
           text.includes('km') || 
           text.includes('hour') || 
           text.includes('time');
  });
  
  // Check for rest stops
  results.hasRestStops = await page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    return text.includes('rest') || 
           text.includes('break') || 
           text.includes('stop') ||
           text.includes('sleep') ||
           text.includes('off duty');
  });
  
  // Check for fueling stops (for long routes)
  if (route.expectedTotalDistance.split('-')[1] > 1000) {
    results.hasFuelingStops = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('fuel') || 
             text.includes('gas') || 
             text.includes('diesel') ||
             text.includes('refuel');
    });
  }
  
  // Check for multiple day handling (for long routes)
  if (route.expectedDriveTime.split('-')[1] > 20) {
    results.hasMultipleDays = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('day 1') || 
             text.includes('day 2') || 
             text.includes('multiple day') ||
             document.querySelectorAll('.log, #log, [class*="log"], table, svg, canvas').length > 1;
    });
  }
  
  console.log(`${site.name} - ${route.scenario} Results:`, results);
  
  return results;
}
