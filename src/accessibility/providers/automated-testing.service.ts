import { Injectable } from '@nestjs/common';
import { AxeTestingProvider } from '../providers/axe-testing.provider';
import { PuppeteerProvider } from '../providers/puppeteer.provider';
import { RunAutomatedTestDto } from '../dto/run-automated-test.dto';

@Injectable()
export class AutomatedTestingService {
  constructor(
    private axeTestingProvider: AxeTestingProvider,
    private puppeteerProvider: PuppeteerProvider,
  ) {}

  async runTests(runAutomatedTestDto: RunAutomatedTestDto) {
    const { url, testTypes = ['wcag2aa'], includeShadowDom = true } = runAutomatedTestDto;
    
    // Get a browser instance
    const browser = await this.puppeteerProvider.getBrowser();
    const page = await browser.newPage();
    
    try {
      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Run axe tests
      const axeResults = await this.axeTestingProvider.runAxeTests(page, {
        runOnly: testTypes,
        includeShadowDom,
      });
      
      // Transform axe results into a standardized format
      const issues = axeResults.violations.flatMap(violation => {
        return violation.nodes.map(node => ({
          wcagCriterion: violation.id,
          description: violation.help,
          impact: violation.impact,
          url,
          htmlSnippet: node.html,
          elementPath: node.target.join(' > '),
          recommendations: node.failureSummary,
        }));
      });
      
      return issues;
    } finally {
      await page.close();
    }
  }

  async checkKeyboardNavigation(url: string) {
    const browser = await this.puppeteerProvider.getBrowser();
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Test tab navigation and focus visibility
      const focusableElements = await page.evaluate(() => {
        const tabIndexElements = Array.from(document.querySelectorAll('[tabindex]'));
        const interactiveElements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"]'));
        
        return [...tabIndexElements, ...interactiveElements].map(el => {
          const computedStyle = window.getComputedStyle(el);
          return {
            tagName: el.tagName,
            id: el.id,
            classNames: el.className,
            tabIndex: el.tabIndex,
            hasVisibleFocusStyles: computedStyle.outlineStyle !== 'none' || computedStyle.outlineWidth !== '0px',
          };
        });
      });
      
      // Test for keyboard traps
      const keyboardTraps = await page.evaluate(() => {
        // This is a simplified check - real keyboard trap detection is more complex
        return Array.from(document.querySelectorAll('*')).filter(el => {
          return el.addEventListener && el.hasAttribute('onkeydown') && 
                 el.getAttribute('onkeydown').includes('preventDefault()') &&
                 (el.getAttribute('onkeydown').includes('keyCode === 9') || 
                  el.getAttribute('onkeydown').includes('key === "Tab"'));
        }).map(el => ({
          tagName: el.tagName,
          id: el.id,
          classNames: el.className,
        }));
      });
      
      return {
        focusableElements,
        keyboardTraps,
        hasKeyboardTraps: keyboardTraps.length > 0,
      };
    } finally {
      await page.close();
    }
  }

  async checkColorContrast(url: string) {
    const browser = await this.puppeteerProvider.getBrowser();
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // This leverages axe's color contrast tests
      const axeResults = await this.axeTestingProvider.runAxeTests(page, {
        runOnly: ['color-contrast'],
      });
      
      return axeResults.violations;
    } finally {
      await page.close();
    }
  }
}
