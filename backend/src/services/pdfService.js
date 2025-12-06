// PDF Service using Puppeteer + Handlebars
// Try to load puppeteer (optional - fallback to PDFKit if not available)
let puppeteer = null;
let handlebars = null;

try {
  puppeteer = require('puppeteer');
  handlebars = require('handlebars');
} catch (error) {
  // Puppeteer not installed, service will be disabled
  console.warn('Puppeteer/Handlebars not available. PDFService will be disabled.');
}

const fs = require('fs').promises;
const path = require('path');

class PDFService {
  constructor() {
    this.templatesPath = path.join(__dirname, '../templates');
    this.browser = null;
  }

  /**
   * Initialize browser instance (singleton)
   */
  async getBrowser() {
    if (!puppeteer) {
      throw new Error('Puppeteer is not installed. Please run: npm install puppeteer handlebars');
    }
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Close browser instance
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Load and compile Handlebars template
   */
  async loadTemplate(templateName) {
    if (!handlebars) {
      throw new Error('Handlebars is not installed. Please run: npm install handlebars');
    }
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      return handlebars.compile(templateContent);
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  /**
   * Register Handlebars helpers
   */
  registerHelpers() {
    if (!handlebars) {
      return; // Handlebars not available
    }
    // Format currency
    handlebars.registerHelper('formatCurrency', (value) => {
      if (!value) return '0';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    });

    // Format number
    handlebars.registerHelper('formatNumber', (value) => {
      if (!value) return '0';
      return new Intl.NumberFormat('vi-VN').format(value);
    });

    // Format date
    handlebars.registerHelper('formatDate', (date, format = 'DD/MM/YYYY') => {
      if (!date) return '';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      
      if (format === 'DD/MM/YYYY HH:mm') {
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
      return `${day}/${month}/${year}`;
    });

    // Compare values
    handlebars.registerHelper('eq', (a, b) => a === b);
    handlebars.registerHelper('ne', (a, b) => a !== b);
    handlebars.registerHelper('gt', (a, b) => a > b);
    handlebars.registerHelper('lt', (a, b) => a < b);

    // Math operations
    handlebars.registerHelper('add', (a, b) => (a || 0) + (b || 0));
    handlebars.registerHelper('multiply', (a, b) => (a || 0) * (b || 0));

    // Array operations
    handlebars.registerHelper('length', (array) => {
      return Array.isArray(array) ? array.length : 0;
    });

    // Conditional
    handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
      switch (operator) {
        case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    });
  }

  /**
   * Generate PDF from HTML
   */
  async generatePDF(html, options = {}) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        printBackground: options.printBackground !== false,
        margin: options.margin || {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        },
        preferCSSPageSize: true
      });

      return pdfBuffer;
    } finally {
      await page.close();
    }
  }

  /**
   * Generate PDF from template
   */
  async generatePDFFromTemplate(templateName, data, options = {}) {
    // Register helpers
    this.registerHelpers();

    // Load and compile template
    const template = await this.loadTemplate(templateName);
    
    // Render HTML
    const html = template(data);

    // Generate PDF
    return await this.generatePDF(html, options);
  }

  /**
   * Generate Report PDF
   */
  async generateReportPDF(report, reportData, summary, options = {}) {
    const data = {
      report: {
        name: report.name,
        description: report.description,
        type: report.type,
        status: report.status,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        creator: report.creator
      },
      data: reportData || [],
      summary: summary || {},
      columns: report.config?.columns || [],
      exportedAt: new Date().toISOString(),
      ...options.metadata || {}
    };

    return await this.generatePDFFromTemplate('report', data, {
      format: 'A4',
      printBackground: true,
      ...options
    });
  }

  /**
   * Generate Invoice PDF
   */
  async generateInvoicePDF(invoiceData, options = {}) {
    return await this.generatePDFFromTemplate('invoice', invoiceData, {
      format: 'A4',
      printBackground: true,
      ...options
    });
  }

  /**
   * Generate Delivery Note PDF
   */
  async generateDeliveryNotePDF(deliveryData, options = {}) {
    return await this.generatePDFFromTemplate('delivery-note', deliveryData, {
      format: 'A4',
      printBackground: true,
      ...options
    });
  }
}

// Export singleton instance
module.exports = new PDFService();

