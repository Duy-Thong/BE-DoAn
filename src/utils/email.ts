/**
 * Email utility functions
 */

export class EmailUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Normalize email (lowercase, trim)
   */
  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Extract domain from email
   */
  static extractDomain(email: string): string | null {
    if (!this.isValidEmail(email)) return null;
    return email.split('@')[1];
  }

  /**
   * Extract local part from email
   */
  static extractLocalPart(email: string): string | null {
    if (!this.isValidEmail(email)) return null;
    return email.split('@')[0];
  }

  /**
   * Mask email for display
   */
  static maskEmail(email: string): string {
    if (!this.isValidEmail(email)) return email;
    
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return email;
    
    const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Generate email verification token
   */
  static generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Check if email is from disposable email service
   */
  static isDisposableEmail(email: string): boolean {
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'yopmail.com',
      'temp-mail.org',
      'throwaway.email',
      'getnada.com',
      'maildrop.cc',
      'sharklasers.com',
    ];

    const domain = this.extractDomain(email);
    return domain ? disposableDomains.includes(domain) : false;
  }

  /**
   * Check if email is from corporate domain
   */
  static isCorporateEmail(email: string): boolean {
    const corporateDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'live.com',
      'icloud.com',
      'aol.com',
    ];

    const domain = this.extractDomain(email);
    return domain ? !corporateDomains.includes(domain) : false;
  }

  /**
   * Generate email template for verification
   */
  static generateVerificationEmailTemplate(
    name: string,
    verificationLink: string
  ): { subject: string; html: string; text: string } {
    const subject = 'Xác thực email của bạn';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Xác thực email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Xác thực email</h1>
          </div>
          <div class="content">
            <h2>Xin chào ${name}!</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng xác thực email của bạn bằng cách nhấp vào nút bên dưới:</p>
            <a href="${verificationLink}" class="button">Xác thực email</a>
            <p>Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
            <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
          </div>
          <div class="footer">
            <p>Nếu bạn không yêu cầu xác thực email này, vui lòng bỏ qua thư này.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Xin chào ${name}!
      
      Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng xác thực email của bạn bằng cách truy cập liên kết sau:
      
      ${verificationLink}
      
      Liên kết này sẽ hết hạn sau 24 giờ.
      
      Nếu bạn không yêu cầu xác thực email này, vui lòng bỏ qua thư này.
    `;

    return { subject, html, text };
  }

  /**
   * Generate email template for password reset
   */
  static generatePasswordResetEmailTemplate(
    name: string,
    resetLink: string
  ): { subject: string; html: string; text: string } {
    const subject = 'Đặt lại mật khẩu';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Đặt lại mật khẩu</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Đặt lại mật khẩu</h1>
          </div>
          <div class="content">
            <h2>Xin chào ${name}!</h2>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Để đặt lại mật khẩu, vui lòng nhấp vào nút bên dưới:</p>
            <a href="${resetLink}" class="button">Đặt lại mật khẩu</a>
            <p>Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
            <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
            <p><strong>Lưu ý:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua thư này và mật khẩu của bạn sẽ không thay đổi.</p>
          </div>
          <div class="footer">
            <p>Để bảo mật tài khoản, vui lòng không chia sẻ liên kết này với bất kỳ ai.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Xin chào ${name}!
      
      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Để đặt lại mật khẩu, vui lòng truy cập liên kết sau:
      
      ${resetLink}
      
      Liên kết này sẽ hết hạn sau 1 giờ.
      
      Lưu ý: Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua thư này và mật khẩu của bạn sẽ không thay đổi.
      
      Để bảo mật tài khoản, vui lòng không chia sẻ liên kết này với bất kỳ ai.
    `;

    return { subject, html, text };
  }

  /**
   * Generate email template for welcome
   */
  static generateWelcomeEmailTemplate(
    name: string,
    loginLink: string
  ): { subject: string; html: string; text: string } {
    const subject = 'Chào mừng bạn đến với JobPortal!';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Chào mừng</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Chào mừng đến với JobPortal!</h1>
          </div>
          <div class="content">
            <h2>Xin chào ${name}!</h2>
            <p>Chúc mừng! Tài khoản của bạn đã được tạo thành công. Bây giờ bạn có thể:</p>
            <ul>
              <li>Tìm kiếm và ứng tuyển các công việc phù hợp</li>
              <li>Tạo và quản lý CV của bạn</li>
              <li>Nhận thông báo về các cơ hội việc làm mới</li>
              <li>Kết nối với các nhà tuyển dụng</li>
            </ul>
            <a href="${loginLink}" class="button">Bắt đầu ngay</a>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
          </div>
          <div class="footer">
            <p>Cảm ơn bạn đã tham gia JobPortal!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Xin chào ${name}!
      
      Chúc mừng! Tài khoản của bạn đã được tạo thành công. Bây giờ bạn có thể:
      
      - Tìm kiếm và ứng tuyển các công việc phù hợp
      - Tạo và quản lý CV của bạn
      - Nhận thông báo về các cơ hội việc làm mới
      - Kết nối với các nhà tuyển dụng
      
      Bắt đầu ngay: ${loginLink}
      
      Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.
      
      Cảm ơn bạn đã tham gia JobPortal!
    `;

    return { subject, html, text };
  }

  /**
   * Generate email template for job application
   */
  static generateJobApplicationEmailTemplate(
    candidateName: string,
    jobTitle: string,
    companyName: string,
    applicationLink: string
  ): { subject: string; html: string; text: string } {
    const subject = `Ứng tuyển thành công - ${jobTitle} tại ${companyName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ứng tuyển thành công</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f8f9fa; }
          .button { display: inline-block; padding: 12px 24px; background-color: #17a2b8; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ứng tuyển thành công!</h1>
          </div>
          <div class="content">
            <h2>Xin chào ${candidateName}!</h2>
            <p>Chúc mừng! Bạn đã ứng tuyển thành công vào vị trí <strong>${jobTitle}</strong> tại <strong>${companyName}</strong>.</p>
            <p>Thông tin ứng tuyển của bạn đã được gửi đến nhà tuyển dụng. Họ sẽ xem xét hồ sơ của bạn và liên hệ với bạn trong thời gian sớm nhất.</p>
            <a href="${applicationLink}" class="button">Xem chi tiết ứng tuyển</a>
            <p><strong>Lưu ý:</strong></p>
            <ul>
              <li>Bạn có thể theo dõi trạng thái ứng tuyển trong tài khoản của mình</li>
              <li>Nhà tuyển dụng có thể liên hệ với bạn qua email hoặc điện thoại</li>
              <li>Vui lòng chuẩn bị sẵn sàng cho các cuộc phỏng vấn</li>
            </ul>
          </div>
          <div class="footer">
            <p>Chúc bạn may mắn trong quá trình ứng tuyển!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Xin chào ${candidateName}!
      
      Chúc mừng! Bạn đã ứng tuyển thành công vào vị trí ${jobTitle} tại ${companyName}.
      
      Thông tin ứng tuyển của bạn đã được gửi đến nhà tuyển dụng. Họ sẽ xem xét hồ sơ của bạn và liên hệ với bạn trong thời gian sớm nhất.
      
      Xem chi tiết ứng tuyển: ${applicationLink}
      
      Lưu ý:
      - Bạn có thể theo dõi trạng thái ứng tuyển trong tài khoản của mình
      - Nhà tuyển dụng có thể liên hệ với bạn qua email hoặc điện thoại
      - Vui lòng chuẩn bị sẵn sàng cho các cuộc phỏng vấn
      
      Chúc bạn may mắn trong quá trình ứng tuyển!
    `;

    return { subject, html, text };
  }
}
