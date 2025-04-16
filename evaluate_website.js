const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure results directory exists
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

async function evaluateWebsite(websiteConfig) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Initialize evaluation results
  const evaluationResults = {
    name: websiteConfig.name,
    url: websiteConfig.url,
    notes: [],
    screenshots: [],
    status: 'incomplete',
    scores: {
      uiAesthetics: 0,
      uxIntuitiveness: 0,
      bugs: 0,
      requiredFeatures: 0,
      eldAccuracy: 0,  // New score for ELD/logbook accuracy
      finalScore: 0
    }
  };
  
  try {
    console.log(`Starting evaluation of ${websiteConfig.name} at ${websiteConfig.url}`);
    
    // Navigate to website
    await page.goto(websiteConfig.url, { timeout: 60000 });
    console.log(`Successfully loaded ${websiteConfig.url}`);
    
    // Take initial screenshot
    const screenshotPath = path.join(resultsDir, `${websiteConfig.name}_initial.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    evaluationResults.screenshots.push(screenshotPath);
    
    // Evaluate UI Aesthetics (Score 0-10)
    await evaluateUIAesthetics(page, websiteConfig, evaluationResults);
    
    // Evaluate UX Intuitiveness (Score 0-10)
    await evaluateUXIntuitiveness(page, websiteConfig, evaluationResults);
    
    // Check for bugs and issues (Score 0-10)
    await checkForBugs(page, websiteConfig, evaluationResults);
    
    // Check for required features (Score 0-10)
    await checkRequiredFeatures(page, websiteConfig, evaluationResults);
    
    // Check for ELD/Logbook accuracy (Score 0-10)
    await checkEldAccuracy(page, websiteConfig, evaluationResults);
    
    // Calculate final score
    calculateFinalScore(evaluationResults);
    
    evaluationResults.status = 'complete';
    console.log(`Evaluation complete for ${websiteConfig.name}`);
  } catch (error) {
    evaluationResults.status = 'error';
    evaluationResults.notes.push(`Fatal error during evaluation: ${error.message}`);
    console.error(`Error evaluating ${websiteConfig.name}:`, error);
  } finally {
    // Save evaluation results
    const resultsPath = path.join(resultsDir, `${websiteConfig.name}_evaluation.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(evaluationResults, null, 2));
    console.log(`Results saved to ${resultsPath}`);
    
    // Close browser
    await browser.close();
    return evaluationResults;
  }
}

async function evaluateUIAesthetics(page, website, evaluationResults) {
  console.log("Evaluating UI aesthetics...");
  let score = 0;
  
  try {
    // Check for professional UI elements
    const professionalUI = await checkProfessionalUI(page);
    if (professionalUI.score > 0) {
      score += professionalUI.score;
      evaluationResults.notes.push(`Professional UI: ${professionalUI.notes}`);
    }
    
    // Check for visual consistency
    const visualConsistency = await checkVisualConsistency(page);
    if (visualConsistency.score > 0) {
      score += visualConsistency.score;
      evaluationResults.notes.push(`Visual consistency: ${visualConsistency.notes}`);
    }
    
    // Check for responsive design
    const responsiveDesign = await checkResponsiveDesign(page);
    if (responsiveDesign.score > 0) {
      score += responsiveDesign.score;
      evaluationResults.notes.push(`Responsive design: ${responsiveDesign.notes}`);
    }
    
    // Normalize score to be out of 10
    score = Math.min(Math.round(score / 3), 10);
    evaluationResults.scores.uiAesthetics = score;
    console.log(`UI aesthetics score: ${score}/10`);
  } catch (error) {
    evaluationResults.notes.push(`Error during UI aesthetics evaluation: ${error.message}`);
    console.error("Error during UI aesthetics evaluation:", error);
  }
}

async function checkProfessionalUI(page) {
  const result = { score: 0, notes: '' };
  
  try {
    // Check for logo presence
    const hasLogo = await page.$$('img[alt*="logo"], a.logo, div.logo').then(elements => elements.length > 0);
    
    // Check for proper heading structure
    const hasHeadings = await page.$$('h1, h2, h3').then(elements => elements.length > 0);
    
    // Check for proper contrast
    const hasGoodContrast = await page.evaluate(() => {
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const textElements = document.querySelectorAll('p, h1, h2, h3, span, a');
      return Array.from(textElements).some(el => {
        const color = window.getComputedStyle(el).color;
        return color !== bodyBg;
      });
    });
    
    if (hasLogo) result.score += 1;
    if (hasHeadings) result.score += 1;
    if (hasGoodContrast) result.score += 1;
    
    result.notes = `Logo: ${hasLogo ? 'Yes' : 'No'}, Headings: ${hasHeadings ? 'Yes' : 'No'}, Good contrast: ${hasGoodContrast ? 'Yes' : 'No'}`;
  } catch (error) {
    result.notes = `Error checking professional UI: ${error.message}`;
  }
  
  return result;
}

async function checkVisualConsistency(page) {
  const result = { score: 0, notes: '' };
  
  try {
    // Check for consistent fonts
    const consistentFonts = await page.evaluate(() => {
      const textElements = document.querySelectorAll('p, h1, h2, h3, span, a');
      const fonts = new Set();
      Array.from(textElements).forEach(el => {
        fonts.add(window.getComputedStyle(el).fontFamily);
      });
      return fonts.size <= 3; // Allow up to 3 different font families
    });
    
    // Check for consistent color scheme
    const consistentColors = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const bgColors = new Set();
      const textColors = new Set();
      
      Array.from(elements).forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          bgColors.add(style.backgroundColor);
        }
        if (style.color) {
          textColors.add(style.color);
        }
      });
      
      return bgColors.size <= 5 && textColors.size <= 5;
    });
    
    if (consistentFonts) result.score += 1.5;
    if (consistentColors) result.score += 1.5;
    
    result.notes = `Consistent fonts: ${consistentFonts ? 'Yes' : 'No'}, Consistent colors: ${consistentColors ? 'Yes' : 'No'}`;
  } catch (error) {
    result.notes = `Error checking visual consistency: ${error.message}`;
  }
  
  return result;
}

async function checkResponsiveDesign(page) {
  const result = { score: 0, notes: '' };
  
  try {
    // Check viewport responsiveness by testing different sizes
    const initialViewport = page.viewportSize();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    const mobileOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    const tabletOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    
    // Restore original viewport
    await page.setViewportSize(initialViewport);
    
    if (!mobileOverflow && !tabletOverflow) {
      result.score = 3;
      result.notes = 'Site properly adjusts to different viewport sizes';
    } else if (!mobileOverflow || !tabletOverflow) {
      result.score = 1.5;
      result.notes = 'Site partially adjusts to different viewport sizes';
    } else {
      result.score = 0;
      result.notes = 'Site does not adjust to different viewport sizes';
    }
  } catch (error) {
    result.notes = `Error checking responsive design: ${error.message}`;
  }
  
  return result;
}

async function evaluateUXIntuitiveness(page, website, evaluationResults) {
  console.log("Evaluating UX intuitiveness...");
  let score = 0;
  
  try {
    // Check navigation elements
    const navigation = await checkNavigation(page);
    if (navigation.score > 0) {
      score += navigation.score;
      evaluationResults.notes.push(`Navigation: ${navigation.notes}`);
    }
    
    // Check form usability
    const formUsability = await checkFormUsability(page);
    if (formUsability.score > 0) {
      score += formUsability.score;
      evaluationResults.notes.push(`Form usability: ${formUsability.notes}`);
    }
    
    // Check feedback and help
    const feedbackAndHelp = await checkFeedbackAndHelp(page);
    if (feedbackAndHelp.score > 0) {
      score += feedbackAndHelp.score;
      evaluationResults.notes.push(`Feedback and help: ${feedbackAndHelp.notes}`);
    }
    
    // Normalize score to be out of 10
    score = Math.min(Math.round(score / 3), 10);
    evaluationResults.scores.uxIntuitiveness = score;
    console.log(`UX intuitiveness score: ${score}/10`);
  } catch (error) {
    evaluationResults.notes.push(`Error during UX intuitiveness evaluation: ${error.message}`);
    console.error("Error during UX intuitiveness evaluation:", error);
  }
}

async function checkNavigation(page) {
  const result = { score: 0, notes: '' };
  
  try {
    // Check for navigation menu
    const hasNavMenu = await page.$$('nav, [role="navigation"], .navigation, .menu, .nav').then(elements => elements.length > 0);
    
    // Check for clear call-to-action buttons
    const hasCTA = await page.$$('button, .btn, .button, a.cta, [role="button"]').then(elements => elements.length > 0);
    
    // Check for breadcrumbs or other location indicators
    const hasLocationIndicators = await page.$$('.breadcrumb, .breadcrumbs, .path, .location').then(elements => elements.length > 0);
    
    if (hasNavMenu) result.score += 1.5;
    if (hasCTA) result.score += 1;
    if (hasLocationIndicators) result.score += 0.5;
    
    result.notes = `Navigation menu: ${hasNavMenu ? 'Yes' : 'No'}, CTAs: ${hasCTA ? 'Yes' : 'No'}, Location indicators: ${hasLocationIndicators ? 'Yes' : 'No'}`;
  } catch (error) {
    result.notes = `Error checking navigation: ${error.message}`;
  }
  
  return result;
}

async function checkFormUsability(page) {
  const result = { score: 0, notes: '' };
  
  try {
    // Check for labeled form elements
    const formElements = await page.$$('input, select, textarea');
    let labeledCount = 0;
    
    for (const el of formElements) {
      const hasLabel = await page.evaluate(element => {
        const id = element.id;
        if (id) {
          return document.querySelector(`label[for="${id}"]`) !== null;
        }
        return false;
      }, el);
      
      const hasPlaceholder = await el.evaluate(element => element.hasAttribute('placeholder'));
      const hasAriaLabel = await el.evaluate(element => element.hasAttribute('aria-label'));
      
      if (hasLabel || hasPlaceholder || hasAriaLabel) {
        labeledCount++;
      }
    }
    
    // Check for form validation
    const hasValidation = await page.$$('input[required], [data-validate], [aria-required="true"]').then(elements => elements.length > 0);
    
    // Calculate form usability score
    const labelRatio = formElements.length > 0 ? labeledCount / formElements.length : 0;
    
    if (labelRatio > 0.8) result.score += 2;
    else if (labelRatio > 0.5) result.score += 1;
    
    if (hasValidation) result.score += 1;
    
    result.notes = `Labeled form elements: ${labeledCount}/${formElements.length}, Form validation: ${hasValidation ? 'Yes' : 'No'}`;
  } catch (error) {
    result.notes = `Error checking form usability: ${error.message}`;
  }
  
  return result;
}

async function checkFeedbackAndHelp(page) {
  const result = { score: 0, notes: '' };
  
  try {
    // Check for error messages
    const hasErrorMessages = await page.$$('.error, .alert, .notification, [role="alert"]').then(elements => elements.length > 0);
    
    // Check for help text
    const hasHelpText = await page.$$('.help, .tooltip, .info, [data-tooltip], [title], [aria-describedby]').then(elements => elements.length > 0);
    
    // Check for contact information or support
    const hasSupport = await page.$$('a[href^="mailto:"], a[href*="contact"], a[href*="support"], .contact, .support').then(elements => elements.length > 0);
    
    if (hasErrorMessages) result.score += 1;
    if (hasHelpText) result.score += 1;
    if (hasSupport) result.score += 1;
    
    result.notes = `Error messages: ${hasErrorMessages ? 'Yes' : 'No'}, Help text: ${hasHelpText ? 'Yes' : 'No'}, Support/Contact: ${hasSupport ? 'Yes' : 'No'}`;
  } catch (error) {
    result.notes = `Error checking feedback and help: ${error.message}`;
  }
  
  return result;
}

async function checkForBugs(page, website, evaluationResults) {
  console.log("Checking for bugs and issues...");
  let score = 10; // Start with perfect score and deduct for issues
  
  try {
    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Interact with the page to trigger potential errors
    await randomPageInteractions(page);
    
    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let broken = 0;
      images.forEach(img => {
        if (!img.complete || img.naturalWidth === 0) {
          broken++;
        }
      });
      return broken;
    });
    
    // Check for broken links by checking a sample
    const links = await page.$$('a[href]');
    let brokenLinks = 0;
    
    // Test a sample of links (max 5)
    const linksToTest = links.slice(0, Math.min(5, links.length));
    for (const link of linksToTest) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('javascript:') && !href.startsWith('#') && !href.startsWith('mailto:')) {
        try {
          const response = await page.context().request.head(href).catch(e => null);
          if (!response || response.status() >= 400) {
            brokenLinks++;
          }
        } catch (error) {
          brokenLinks++;
        }
      }
    }
    
    // Deduct points based on issues found
    if (consoleErrors.length > 0) {
      score -= Math.min(consoleErrors.length, 3);
      evaluationResults.notes.push(`Console errors detected: ${consoleErrors.length}`);
    }
    
    if (brokenImages > 0) {
      score -= Math.min(brokenImages, 3);
      evaluationResults.notes.push(`Broken images detected: ${brokenImages}`);
    }
    
    if (brokenLinks > 0) {
      score -= Math.min(brokenLinks, 2);
      evaluationResults.notes.push(`Broken links detected: ${brokenLinks}/${linksToTest.length} tested`);
    }
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(score, 10));
    evaluationResults.scores.bugs = score;
    console.log(`Bug check score: ${score}/10`);
  } catch (error) {
    evaluationResults.notes.push(`Error during bug checking: ${error.message}`);
    console.error("Error during bug checking:", error);
    evaluationResults.scores.bugs = 5; // Default mid-score on error
  }
}

async function randomPageInteractions(page) {
  try {
    // Scroll the page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 500);
      setTimeout(() => window.scrollTo(0, 0), 1000);
    });
    await page.waitForTimeout(1500);
    
    // Click some buttons (non-submit)
    const buttons = await page.$$('button:not([type="submit"]), [role="button"]');
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      try {
        await buttons[i].click({ force: true }).catch(() => {});
        await page.waitForTimeout(500);
      } catch (e) {
        // Ignore click errors
      }
    }
    
    // Hover over menu items
    const menuItems = await page.$$('nav a, .menu a, .navigation a');
    for (let i = 0; i < Math.min(menuItems.length, 3); i++) {
      try {
        await menuItems[i].hover().catch(() => {});
        await page.waitForTimeout(300);
      } catch (e) {
        // Ignore hover errors
      }
    }
  } catch (error) {
    console.error("Error during random page interactions:", error);
  }
}

async function checkRequiredFeatures(page, website, evaluationResults) {
  console.log("Checking for required features...");
  let score = 0;
  
  try {
    // Check for a login/authentication system
    const hasAuth = await checkForAuthentication(page);
    if (hasAuth) {
      score += 2;
      evaluationResults.notes.push('Authentication system: Present');
    } else {
      evaluationResults.notes.push('Authentication system: Not found');
    }
    
    // Check for search functionality
    const hasSearch = await checkForSearch(page);
    if (hasSearch) {
      score += 2;
      evaluationResults.notes.push('Search functionality: Present');
    } else {
      evaluationResults.notes.push('Search functionality: Not found');
    }
    
    // Check for contact/support options
    const hasContact = await checkForContact(page);
    if (hasContact) {
      score += 2;
      evaluationResults.notes.push('Contact/Support options: Present');
    } else {
      evaluationResults.notes.push('Contact/Support options: Not found');
    }
    
    // Check for mobile friendliness
    const isMobileFriendly = await checkMobileFriendliness(page);
    if (isMobileFriendly) {
      score += 2;
      evaluationResults.notes.push('Mobile friendliness: Good');
    } else {
      evaluationResults.notes.push('Mobile friendliness: Poor');
    }
    
    // Check for terms/privacy policy
    const hasLegalInfo = await checkForLegalInfo(page);
    if (hasLegalInfo) {
      score += 2;
      evaluationResults.notes.push('Legal information: Present');
    } else {
      evaluationResults.notes.push('Legal information: Not found');
    }
    
    // Normalize score to be out of 10
    score = Math.min(score, 10);
    evaluationResults.scores.requiredFeatures = score;
    console.log(`Required features score: ${score}/10`);
  } catch (error) {
    evaluationResults.notes.push(`Error during required features check: ${error.message}`);
    console.error("Error during required features check:", error);
  }
}

async function checkForAuthentication(page) {
  try {
    const authElements = await page.$$([
      'input[type="password"]',
      'form[action*="login"]',
      'form[action*="signin"]',
      'a[href*="login"]',
      'a[href*="signin"]',
      'button:has-text("Log in")',
      'button:has-text("Sign in")',
      '.login',
      '.signin'
    ].join(', '));
    
    return authElements.length > 0;
  } catch (error) {
    console.error("Error checking for authentication:", error);
    return false;
  }
}

async function checkForSearch(page) {
  try {
    const searchElements = await page.$$([
      'input[type="search"]',
      'input[name="search"]',
      'input[placeholder*="search" i]',
      'form[action*="search"]',
      'button:has-text("Search")',
      '.search',
      '[aria-label*="search" i]'
    ].join(', '));
    
    return searchElements.length > 0;
  } catch (error) {
    console.error("Error checking for search:", error);
    return false;
  }
}

async function checkForContact(page) {
  try {
    const contactElements = await page.$$([
      'a[href^="mailto:"]',
      'a[href*="contact"]',
      'a[href*="support"]',
      'form[action*="contact"]',
      'form[action*="support"]',
      '.contact',
      '.support',
      'button:has-text("Contact")',
      'button:has-text("Support")'
    ].join(', '));
    
    return contactElements.length > 0;
  } catch (error) {
    console.error("Error checking for contact:", error);
    return false;
  }
}

async function checkMobileFriendliness(page) {
  try {
    // Check for viewport meta tag
    const hasViewportMeta = await page.evaluate(() => {
      return document.querySelector('meta[name="viewport"]') !== null;
    });
    
    // Check for media queries
    const hasMediaQueries = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets);
      for (const sheet of styles) {
        try {
          if (sheet.cssRules) {
            for (const rule of sheet.cssRules) {
              if (rule.type === CSSRule.MEDIA_RULE && rule.conditionText.includes('max-width')) {
                return true;
              }
            }
          }
        } catch (e) {
          // CORS issue with external stylesheet
        }
      }
      return false;
    });
    
    // Check touch-friendly elements (larger click targets)
    const originalViewport = page.viewportSize();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const touchFriendly = await page.evaluate(() => {
      const clickableElements = document.querySelectorAll('button, a, [role="button"], input[type="submit"]');
      let goodSizeCount = 0;
      
      for (const el of clickableElements) {
        const rect = el.getBoundingClientRect();
        // Check if element is at least 44x44px (Apple's recommended minimum touch target size)
        if (rect.width >= 44 && rect.height >= 44) {
          goodSizeCount++;
        }
      }
      
      return clickableElements.length > 0 ? 
        (goodSizeCount / clickableElements.length) >= 0.7 : false;
    });
    
    // Restore original viewport
    await page.setViewportSize(originalViewport);
    
    return hasViewportMeta && (hasMediaQueries || touchFriendly);
  } catch (error) {
    console.error("Error checking for mobile friendliness:", error);
    return false;
  }
}

async function checkForLegalInfo(page) {
  try {
    const legalElements = await page.$$([
      'a[href*="terms"]',
      'a[href*="privacy"]',
      'a[href*="legal"]',
      'footer a[href*="terms"]',
      'footer a[href*="privacy"]',
      '.terms',
      '.privacy',
      '.legal'
    ].join(', '));
    
    return legalElements.length > 0;
  } catch (error) {
    console.error("Error checking for legal info:", error);
    return false;
  }
}

async function checkEldAccuracy(page, website, evaluationResults) {
  console.log("Checking for ELD/Logbook accuracy...");
  let score = 0;
  
  try {
    // Check for ELD logs
    const hasEldLogs = await checkForEldLogs(page);
    if (hasEldLogs) {
      score += 2;
      evaluationResults.notes.push('ELD logs found on the page');
    } else {
      // Try to fill the form and submit to see if logs are displayed
      await tryToGenerateLogs(page);
      
      // Check again after form submission
      const hasEldLogsAfterSubmit = await checkForEldLogs(page);
      if (hasEldLogsAfterSubmit) {
        score += 2;
        evaluationResults.notes.push('ELD logs found after form submission');
      } else {
        evaluationResults.notes.push('No ELD logs found, even after form submission');
      }
    }
    
    // Check for Hours of Service representation
    const hasHosDisplay = await page.$$eval('*', elements => {
      return elements.some(el => {
        const text = el.textContent;
        return text && (
          text.includes('Hours of Service') || 
          text.includes('HOS') || 
          text.includes('Driving Time') ||
          text.includes('Drive Time') ||
          text.includes('On Duty') ||
          text.includes('Off Duty')
        );
      });
    });
    
    if (hasHosDisplay) {
      score += 2;
      evaluationResults.notes.push('Hours of Service information displayed');
    }
    
    // Check for status changes (driving, on-duty, off-duty)
    const hasStatusChanges = await page.$$eval('*', elements => {
      return elements.some(el => {
        const text = el.textContent;
        return text && (
          (text.includes('Status') && (text.includes('Change') || text.includes('Update'))) ||
          text.includes('Duty Status') ||
          (text.includes('On') && text.includes('Off') && (text.includes('Duty') || text.includes('Status')))
        );
      });
    });
    
    if (hasStatusChanges) {
      score += 2;
      evaluationResults.notes.push('Status change capability detected');
    }
    
    // Check for breaks representation
    const hasBreaksRepresentation = await page.$$eval('*', elements => {
      return elements.some(el => {
        const text = el.textContent;
        return text && (
          text.includes('Break') || 
          text.includes('Rest') || 
          text.includes('Sleeper')
        );
      });
    });
    
    if (hasBreaksRepresentation) {
      score += 2;
      evaluationResults.notes.push('Break time representation found');
    }
    
    // Check for time calculations
    const hasTimeCalculations = await page.$$eval('*', elements => {
      return elements.some(el => {
        const text = el.textContent;
        return text && (
          text.includes('Remaining') || 
          text.includes('Available') || 
          (text.includes('Time') && text.includes('Left'))
        );
      });
    });
    
    if (hasTimeCalculations) {
      score += 2;
      evaluationResults.notes.push('Driving time calculations present');
    }
    
    // Normalize score to be out of 10
    score = Math.min(score, 10);
    evaluationResults.scores.eldAccuracy = score;
    console.log(`ELD accuracy score: ${score}/10`);
  } catch (error) {
    evaluationResults.notes.push(`Error during ELD accuracy check: ${error.message}`);
    console.error("Error during ELD accuracy check:", error);
  }
}

async function checkForEldLogs(page) {
  try {
    // Look for common elements that would indicate ELD logs
    const eldIndicators = await page.$$([
      '.log',
      '#log',
      '[class*="log"]',
      '[class*="eld"]',
      '[id*="log"]',
      '[id*="eld"]',
      'svg',
      'canvas',
      'table',
      '.chart',
      '#chart',
      '[class*="chart"]',
      '[class*="graph"]'
    ].join(', '));
    
    if (eldIndicators.length > 0) {
      return true;
    }
    
    // Look for text that would indicate ELD logs
    const hasEldText = await page.$$eval('*', elements => {
      return elements.some(el => {
        const text = el.textContent;
        return text && (
          text.includes('ELD') || 
          text.includes('Electronic Log') || 
          text.includes('Driver Log') || 
          text.includes('Duty Status') || 
          text.includes('Hours of Service') || 
          text.includes('HOS')
        );
      });
    });
    
    return hasEldText;
  } catch (error) {
    console.error("Error checking for ELD logs:", error);
    return false;
  }
}

async function tryToGenerateLogs(page) {
  try {
    // Try to fill location fields
    const locationFields = await page.$$('input[type="text"]');
    if (locationFields.length >= 2) {
      // Fill origin and destination
      await locationFields[0].fill('Chicago, IL');
      await locationFields[1].fill('Indianapolis, IN');
    }
    
    // Look for a number input for hours/cycles
    const hoursField = await page.$('input[type="number"], input[placeholder*="hour"], input[placeholder*="cycle"]');
    if (hoursField) {
      await hoursField.fill('8');
    }
    
    // Try to click a submit/calculate/generate button
    const buttonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Calculate")',
      'button:has-text("Generate")',
      'button:has-text("Plan")',
      '.submit',
      '#submit'
    ];
    
    for (const selector of buttonSelectors) {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        // Wait for results to load
        await page.waitForTimeout(5000);
        return true;
      }
    }
    
    // If no specific button found, try any button
    const buttons = await page.$$('button');
    if (buttons.length > 0) {
      await buttons[0].click();
      await page.waitForTimeout(5000);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error trying to generate logs:", error);
    return false;
  }
}

function calculateFinalScore(evaluationResults) {
  // Updated weights to include ELD accuracy
  const weights = {
    uiAesthetics: 0.20,
    uxIntuitiveness: 0.25,
    bugs: 0.20,
    requiredFeatures: 0.15,
    eldAccuracy: 0.20
  };
  
  // Calculate weighted average
  const weightedScore = 
    (evaluationResults.scores.uiAesthetics * weights.uiAesthetics) +
    (evaluationResults.scores.uxIntuitiveness * weights.uxIntuitiveness) +
    (evaluationResults.scores.bugs * weights.bugs) +
    (evaluationResults.scores.requiredFeatures * weights.requiredFeatures) +
    (evaluationResults.scores.eldAccuracy * weights.eldAccuracy);
  
  // Round to one decimal place
  evaluationResults.scores.finalScore = Math.round(weightedScore * 10) / 10;
  
  console.log(`Final evaluation score: ${evaluationResults.scores.finalScore}/10`);
}

// Example website configuration
const exampleWebsite = {
  name: 'Example',
  url: 'https://example.com',
  requiredFields: ['origin', 'destination', 'date']
};

// Module exports for use in other scripts
module.exports = {
  evaluateWebsite,
  exampleWebsite
};

// If run directly, evaluate the example website
if (require.main === module) {
  (async () => {
    try {
      const results = await evaluateWebsite(exampleWebsite);
      console.log('Evaluation complete!');
    } catch (error) {
      console.error('Evaluation failed:', error);
    }
  })();
} 