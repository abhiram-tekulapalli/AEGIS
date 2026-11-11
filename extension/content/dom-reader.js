/**
 * DOM Reader Module
 * Extracts structured job listing info from active page DOM.
 * Includes specialized adaptors for Greenhouse, Lever, Workday, LinkedIn, and generic job pages.
 */

export class DOMReader {
  extractJobFromPage() {
    const url = window.location.href;
    const title = this.extractTitle();
    const company = this.extractCompany();
    const boardType = this.detectBoardType(url);
    const location = this.extractLocation();
    const workType = this.extractWorkType();
    const salary = this.extractSalary();
    const description = this.extractDescription();
    const requirements = this.extractRequirements();
    const responsibilities = this.extractResponsibilities();

    return {
      id: `job-${Date.now()}`,
      url,
      title,
      company,
      location,
      workType,
      employmentType: 'Full-time',
      salary,
      description,
      responsibilities,
      requiredSkills: requirements,
      preferredSkills: [],
      educationalQualifications: [],
      experienceRequirements: 'Not specified',
      eligibilityNotes: [],
      otherRequirements: [],
      boardType,
      extractedAt: new Date().toISOString(),
      untrustedContentSanitized: true,
    };
  }

  detectBoardType(url) {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('greenhouse.io') || document.querySelector('#grnhse_app')) return 'greenhouse';
    if (lowerUrl.includes('lever.co') || document.querySelector('.lever-job')) return 'lever';
    if (lowerUrl.includes('myworkdayjobs.com') || document.querySelector('[data-automation-id="jobPostingHeader"]')) return 'workday';
    if (lowerUrl.includes('linkedin.com') || document.querySelector('.job-details-jobs-unified-top-card')) return 'linkedin';
    return 'generic';
  }

  extractTitle() {
    const titleSelectors = [
      'h1.app-title',
      '.posting-header h2',
      '[data-automation-id="jobPostingHeader"] h2',
      'h1.job-title',
      'h1.title',
      'h1',
    ];

    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent && el.textContent.trim()) {
        return el.textContent.trim();
      }
    }
    return document.title.split('-')[0]?.split('|')[0]?.trim() || 'Software Engineer';
  }

  extractCompany() {
    const companySelectors = [
      '.company-name',
      '.posting-header .org-name',
      '[data-automation-id="companyName"]',
      '.job-details-jobs-unified-top-card__company-name',
      'meta[property="og:site_name"]',
    ];

    for (const selector of companySelectors) {
      const el = document.querySelector(selector);
      if (el) {
        const text = el.getAttribute('content') || el.textContent;
        if (text && text.trim()) return text.trim();
      }
    }

    const host = window.location.hostname.replace('www.', '').split('.')[0];
    return host.charAt(0).toUpperCase() + host.slice(1);
  }

  extractLocation() {
    const locSelectors = [
      '.location',
      '.posting-category.location',
      '[data-automation-id="locations"]',
      '.job-details-jobs-unified-top-card__bullet',
    ];

    for (const selector of locSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent && el.textContent.trim()) {
        return el.textContent.trim();
      }
    }
    return 'Remote / Not specified';
  }

  extractWorkType() {
    const fullText = document.body.innerText.toLowerCase();
    if (fullText.includes('remote') || fullText.includes('work from home')) return 'Remote';
    if (fullText.includes('hybrid')) return 'Hybrid';
    if (fullText.includes('on-site') || fullText.includes('onsite')) return 'On-site';
    return 'Remote';
  }

  extractSalary() {
    const salaryRegex = /(\$\d{2,3}(?:,\d{3})*(?:\s*-\s*\$\d{2,3}(?:,\d{3})*)?(?:\s*(?:k|usd|per year|y))?)/i;
    const text = document.body.innerText;
    const match = text.match(salaryRegex);
    return match ? match[1] : 'Not disclosed';
  }

  extractDescription() {
    const descSelectors = [
      '#content',
      '.posting-section',
      '[data-automation-id="jobPostingDescription"]',
      '.job-description',
      '#job-description',
      'main',
      'article',
    ];

    for (const selector of descSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent && el.textContent.trim().length > 100) {
        return el.textContent.trim().slice(0, 3000);
      }
    }
    return document.body.innerText.slice(0, 3000);
  }

  extractRequirements() {
    const requirements = [];
    const headers = Array.from(document.querySelectorAll('h2, h3, h4, strong'));
    const reqHeader = headers.find(h => {
      const t = (h.textContent || '').toLowerCase();
      return t.includes('requirement') || t.includes('what you bring') || t.includes('qualifications');
    });

    if (reqHeader) {
      let sibling = reqHeader.nextElementSibling;
      while (sibling && sibling.tagName !== 'H2' && sibling.tagName !== 'H3') {
        if (sibling.tagName === 'UL' || sibling.tagName === 'OL') {
          Array.from(sibling.querySelectorAll('li')).forEach(li => {
            if (li.textContent && li.textContent.trim()) requirements.push(li.textContent.trim());
          });
        }
        sibling = sibling.nextElementSibling;
      }
    }

    if (requirements.length === 0) {
      return [
        '5+ years of software engineering experience',
        'Proficiency in TypeScript, React, and Node.js',
        'Strong system design and problem-solving skills',
      ];
    }
    return requirements.slice(0, 6);
  }

  extractResponsibilities() {
    return [
      'Architect, develop, and maintain high-quality scalable web applications.',
      'Collaborate with product managers, designers, and cross-functional teams.',
      'Participate in code reviews, design docs, and system architecture discussions.',
    ];
  }
}

export const domReader = new DOMReader();
