import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';
import { CVResponse } from '../../modules/cvs/dto.js';

export interface PDFGenerationOptions {
  template?: 'default' | 'modern' | 'harvard';
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  displayHeaderFooter?: boolean;
  printBackground?: boolean;
}

// CV with nested data for PDF generation
export interface CVWithNestedData extends CVResponse {
  workExperience?: any[];
  education?: any[];
  languages?: any[];
  certifications?: any[];
  projects?: any[];
  achievements?: any[];
  references?: any[];
  skills?: any[];
  activities?: any[];
}

export interface CVData {
  cv: CVWithNestedData;
  workExperience: any[];
  education: any[];
  skills: any[];
  projects: any[];
  certifications: any[];
  languages: any[];
  activities: any[];
  achievements: any[];
  references: any[];
}

export class PDFGeneratorService {
  private templatesPath: string;
  private browser: any = null;

  constructor() {
    this.templatesPath = join(process.cwd(), 'src', 'templates', 'cv');
    this.registerHandlebarsHelpers();
  }

  /**
   * Đăng ký các helper functions cho Handlebars
   */
  private registerHandlebarsHelpers(): void {
    // Format date helper
    Handlebars.registerHelper('formatDate', (date: string | Date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('vi-VN', {
        month: '2-digit',
        year: 'numeric'
      });
    });

    // Get skill progress percentage
    Handlebars.registerHelper('getSkillProgress', (level: string) => {
      const progressMap: Record<string, number> = {
        'BEGINNER': 25,
        'INTERMEDIATE': 50,
        'ADVANCED': 75,
        'EXPERT': 100
      };
      return progressMap[level] || 0;
    });

    // Conditional helper
    Handlebars.registerHelper('if_eq', function(this: any, a: any, b: any, options: any) {
      if (a === b) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });

    // Format date for Harvard template (MM/YYYY format)
    Handlebars.registerHelper('formatDateHarvard', (date: string | Date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        month: '2-digit',
        year: 'numeric'
      });
    });

    // Format phone number
    Handlebars.registerHelper('formatPhone', (phone: string) => {
      if (!phone) return '';
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    });

    // Truncate text
    Handlebars.registerHelper('truncate', (str: string, len: number) => {
      if (!str || str.length <= len) return str;
      return str.substring(0, len) + '...';
    });
  }

  /**
   * Khởi tạo browser instance
   */
  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
  }

  /**
   * Đóng browser instance
   */
  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Load template từ file
   */
  private loadTemplate(templateName: string): string {
    const templatePath = join(this.templatesPath, `${templateName}.html`);
    try {
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(`Template not found: ${templateName}`);
    }
  }

  /**
   * Chuẩn bị dữ liệu cho template
   */
  private prepareCVData(cvData: CVWithNestedData): CVData {
    return {
      cv: cvData,
      workExperience: cvData.workExperience || [],
      education: cvData.education || [],
      skills: cvData.skills || [],
      projects: cvData.projects || [],
      certifications: cvData.certifications || [],
      languages: cvData.languages || [],
      activities: cvData.activities || [],
      achievements: cvData.achievements || [],
      references: cvData.references || []
    };
  }

  /**
   * Render HTML từ template và data
   */
  private renderHTML(templateName: string, data: CVData): string {
    const templateSource = this.loadTemplate(templateName);
    const template = Handlebars.compile(templateSource);
    return template(data);
  }

  /**
   * Tạo PDF từ HTML
   */
  private async generatePDFFromHTML(
    html: string, 
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    await this.initBrowser();
    
    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        margin: {
          top: options.margin?.top || '20mm',
          right: options.margin?.right || '20mm',
          bottom: options.margin?.bottom || '20mm',
          left: options.margin?.left || '20mm'
        },
        displayHeaderFooter: options.displayHeaderFooter || false,
        printBackground: options.printBackground !== false,
        preferCSSPageSize: true
      });

      return pdfBuffer;
    } finally {
      await page.close();
    }
  }

  /**
   * Tạo PDF từ CV data
   */
  public async generateCVPDF(
    cvData: CVWithNestedData,
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    try {
      const templateName = options.template || 'default';
      const preparedData = this.prepareCVData(cvData);
      const html = this.renderHTML(templateName, preparedData);
      
      return await this.generatePDFFromHTML(html, options);
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Tạo PDF từ HTML string
   */
  public async generatePDFFromHTMLString(
    html: string,
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    try {
      return await this.generatePDFFromHTML(html, options);
    } catch (error) {
      throw new Error(`Failed to generate PDF from HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lấy danh sách templates có sẵn
   */
  public getAvailableTemplates(): string[] {
    return ['default', 'modern', 'harvard'];
  }

  /**
   * Kiểm tra template có tồn tại không
   */
  public templateExists(templateName: string): boolean {
    return this.getAvailableTemplates().includes(templateName);
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    await this.closeBrowser();
  }
}

// Singleton instance
export const pdfGeneratorService = new PDFGeneratorService();
