import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';
import { CVResponse } from '../../modules/cvs/dto.js';
import { CVTemplateService } from '../../modules/cv-templates/service.js';

export interface PDFGenerationOptions {
  template?: string; // Template slug or ID (from database) or legacy name (default, modern, harvard)
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
  private cvTemplateService: CVTemplateService;

  constructor() {
    this.templatesPath = join(process.cwd(), 'src', 'templates', 'cv');
    this.cvTemplateService = new CVTemplateService();
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
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${year}`;
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
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${year}`;
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

    // Translate skill level to Vietnamese
    Handlebars.registerHelper('translateSkillLevel', (level: string) => {
      const skillLevelMap: Record<string, string> = {
        'BEGINNER': 'Mới bắt đầu',
        'INTERMEDIATE': 'Trung bình',
        'ADVANCED': 'Nâng cao',
        'EXPERT': 'Chuyên gia'
      };
      return skillLevelMap[level] || level;
    });

    // Translate language proficiency to Vietnamese
    Handlebars.registerHelper('translateLanguageLevel', (level: string) => {
      const languageLevelMap: Record<string, string> = {
        'BASIC': 'Cơ bản',
        'CONVERSATIONAL': 'Giao tiếp',
        'PROFESSIONAL': 'Chuyên nghiệp',
        'NATIVE': 'Bản ngữ'
      };
      return languageLevelMap[level] || level;
    });

    // Translate gender to Vietnamese
    Handlebars.registerHelper('translateGender', (gender: string) => {
      const genderMap: Record<string, string> = {
        'MALE': 'Nam',
        'FEMALE': 'Nữ',
        'OTHER': 'Khác',
        'PREFER_NOT_TO_SAY': 'Không muốn nói'
      };
      return genderMap[gender] || gender;
    });

    // Translate education level to Vietnamese
    Handlebars.registerHelper('translateEducationLevel', (level: string) => {
      const educationLevelMap: Record<string, string> = {
        'HIGH_SCHOOL': 'Trung học phổ thông',
        'ASSOCIATE': 'Cao đẳng',
        'BACHELOR': 'Cử nhân',
        'MASTER': 'Thạc sĩ',
        'DOCTORATE': 'Tiến sĩ',
        'CERTIFICATE': 'Chứng chỉ',
        'DIPLOMA': 'Bằng tốt nghiệp'
      };
      return educationLevelMap[level] || level;
    });

    // Translate employment type to Vietnamese
    Handlebars.registerHelper('translateEmploymentType', (type: string) => {
      const employmentTypeMap: Record<string, string> = {
        'FULL_TIME': 'Toàn thời gian',
        'PART_TIME': 'Bán thời gian',
        'CONTRACT': 'Hợp đồng',
        'INTERNSHIP': 'Thực tập',
        'FREELANCE': 'Tự do',
        'VOLUNTEER': 'Tình nguyện'
      };
      return employmentTypeMap[type] || type;
    });

    // Translate project status to Vietnamese
    Handlebars.registerHelper('translateProjectStatus', (status: string) => {
      const projectStatusMap: Record<string, string> = {
        'PLANNING': 'Lập kế hoạch',
        'IN_PROGRESS': 'Đang thực hiện',
        'COMPLETED': 'Hoàn thành',
        'ON_HOLD': 'Tạm dừng',
        'CANCELLED': 'Đã hủy'
      };
      return projectStatusMap[status] || status;
    });

    // Translate certification status to Vietnamese
    Handlebars.registerHelper('translateCertificationStatus', (status: string) => {
      const certificationStatusMap: Record<string, string> = {
        'ACTIVE': 'Còn hiệu lực',
        'EXPIRED': 'Hết hạn',
        'PENDING': 'Chờ xử lý',
        'REVOKED': 'Bị thu hồi'
      };
      return certificationStatusMap[status] || status;
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
   * Load template từ database
   */
  private async loadTemplateFromDatabase(templateIdOrSlug: string): Promise<string> {
    try {
      const template = await this.cvTemplateService.getTemplateContent(templateIdOrSlug);
      return template.htmlContent;
    } catch (error) {
      console.error('Error loading template from database:', error);
      throw error;
    }
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
   * Render HTML từ database template
   */
  private async renderHTMLFromDatabase(templateIdOrSlug: string, data: CVData): Promise<string> {
    const htmlContent = await this.loadTemplateFromDatabase(templateIdOrSlug);
    const template = Handlebars.compile(htmlContent);
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
      
      let html: string;
      
      // Kiểm tra nếu template là ID hoặc slug (database template)
      if (this.isTemplateIdOrSlug(templateName)) {
        html = await this.renderHTMLFromDatabase(templateName, preparedData);
      } else {
        // Fallback to file system template
        html = this.renderHTML(templateName, preparedData);
      }
      
      return await this.generatePDFFromHTML(html, options);
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Kiểm tra xem template có phải là ID hoặc slug không
   */
  private isTemplateIdOrSlug(template: string): boolean {
    // Kiểm tra nếu là CUID (24 ký tự) hoặc UUID (36 ký tự) hoặc slug (chứa dấu gạch ngang)
    return template.length > 10 || template.includes('-');
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
   * Lấy danh sách templates có sẵn từ database
   */
  public async getAvailableTemplates(): Promise<Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    isDefault: boolean;
    isPremium: boolean;
    previewUrl?: string;
  }>> {
    try {
      const result = await this.cvTemplateService.getTemplates({
        page: 1,
        limit: 100,
        isActive: true,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      return result.templates.map(template => ({
        id: template.id,
        name: template.name,
        slug: template.slug,
        category: template.category,
        isDefault: template.isDefault,
        isPremium: template.isPremium,
        previewUrl: template.previewUrl || undefined,
      }));
    } catch (error) {
      console.error('Error getting templates from database:', error);
      // Fallback to file system templates
      return [
        { id: 'default', name: 'Default', slug: 'default', category: 'professional', isDefault: true, isPremium: false },
        { id: 'modern', name: 'Modern', slug: 'modern', category: 'modern', isDefault: false, isPremium: false },
        { id: 'harvard', name: 'Harvard', slug: 'harvard', category: 'academic', isDefault: false, isPremium: false },
      ];
    }
  }

  /**
   * Kiểm tra template có tồn tại không
   * Check filesystem templates (default, modern, harvard) và database templates
   */
  public async templateExists(templateName: string): Promise<boolean> {
    // Check filesystem templates (legacy)
    const filesystemTemplates = ['default', 'modern', 'harvard'];
    if (filesystemTemplates.includes(templateName)) {
      return true;
    }
    
    // Check database templates (by ID or slug)
    try {
      const dbTemplates = await this.getAvailableTemplates();
      return dbTemplates.some(t => t.id === templateName || t.slug === templateName);
    } catch (error) {
      console.error('Error checking template existence:', error);
      return false;
    }
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
