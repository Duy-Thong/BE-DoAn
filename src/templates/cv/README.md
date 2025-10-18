# CV Template System

## 📋 Quy định Class Names và Structure

### **🎯 1. Cấu trúc HTML cơ bản:**

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>{{cv.title}} - {{cv.fullName}}</title>
    <style>
        /* CSS styles */
    </style>
</head>
<body>
    <div class="cv-container">
        <!-- CV content -->
    </div>
</body>
</html>
```

### **🏗️ 2. Class Names Convention:**

#### **Container Classes:**
- `.cv-container` - Main container cho toàn bộ CV
- `.cv-header` - Header section (tên, title, contact)
- `.cv-sidebar` - Sidebar (cho modern template)
- `.cv-main` - Main content area (cho modern template)

#### **Section Classes:**
- `.cv-section` - Wrapper cho mỗi section
- `.section-title` - Tiêu đề section
- `.section-content` - Nội dung section

#### **Header Classes:**
- `.cv-name` - Tên ứng viên
- `.cv-title` - Chức vụ hiện tại
- `.cv-avatar` - Ảnh đại diện
- `.cv-contact` - Container cho thông tin liên hệ
- `.contact-item` - Mỗi item liên hệ

#### **Content Item Classes:**
- `.work-item` - Work experience item
- `.education-item` - Education item
- `.project-item` - Project item
- `.cert-item` - Certification item
- `.skill-item` - Skill item
- `.language-item` - Language item

#### **Header Classes cho Items:**
- `.work-header` - Header của work experience
- `.education-header` - Header của education
- `.project-header` - Header của project
- `.cert-header` - Header của certification

#### **Content Classes:**
- `.work-title` - Job title
- `.work-company` - Company name
- `.work-dates` - Work dates
- `.work-description` - Work description
- `.education-degree` - Degree name
- `.education-institution` - Institution name
- `.education-dates` - Education dates
- `.project-name` - Project name
- `.project-url` - Project URL
- `.project-dates` - Project dates
- `.cert-name` - Certification name
- `.cert-issuer` - Certification issuer
- `.cert-date` - Certification date
- `.skill-name` - Skill name
- `.skill-level` - Skill level
- `.skill-bar` - Skill progress bar
- `.skill-progress` - Skill progress fill

#### **Utility Classes:**
- `.text-center` - Text align center
- `.text-right` - Text align right
- `.mb-0` - Margin bottom 0
- `.mt-10` - Margin top 10px
- `.hidden` - Display none

### **📊 3. Data Structure cho Templates:**

```typescript
interface CVData {
  cv: {
    id: string;
    title: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: Date;
    gender: Gender;
    nationality: string;
    address: string;
    avatarUrl: string;
    currentPosition: string;
    summary: string;
    objective: string;
    isMain: boolean;
    // ... other CV fields
  };
  workExperience: Array<{
    title: string;
    company: string;
    startDate: Date;
    endDate: Date;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    startDate: Date;
    endDate: Date;
    description: string;
  }>;
  skills: Array<{
    skillName: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    yearsOfExperience: number;
    description: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    url: string;
    role: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate: Date;
    credentialId: string;
    credentialUrl: string;
    description: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  activities: Array<any>;
  achievements: Array<any>;
  references: Array<any>;
}
```

### **🔧 4. Handlebars Helpers:**

#### **Available Helpers:**
- `{{formatDate date}}` - Format date to Vietnamese format
- `{{getSkillProgress level}}` - Get skill progress percentage
- `{{if_eq a b}}` - Conditional helper
- `{{formatPhone phone}}` - Format phone number
- `{{truncate str len}}` - Truncate text

#### **Usage Examples:**
```handlebars
<!-- Format date -->
{{formatDate workExperience.startDate}}

<!-- Get skill progress -->
<div class="skill-progress" style="width: {{getSkillProgress skill.level}}%"></div>

<!-- Conditional -->
{{#if_eq cv.gender "MALE"}}
  <span>Nam</span>
{{else}}
  <span>Nữ</span>
{{/if_eq}}

<!-- Format phone -->
{{formatPhone cv.phoneNumber}}

<!-- Truncate text -->
{{truncate cv.summary 100}}
```

### **🎨 5. CSS Guidelines:**

#### **Color Palette:**
- Primary: `#2c3e50` (Dark blue-gray)
- Secondary: `#3498db` (Blue)
- Accent: `#667eea` (Purple-blue)
- Text: `#333` (Dark gray)
- Light text: `#7f8c8d` (Gray)
- Background: `#f8f9fa` (Light gray)

#### **Typography:**
- Font family: `'Arial', sans-serif` hoặc `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- Base font size: `12px`
- Line height: `1.6`

#### **Spacing:**
- Section margin: `25px`
- Item margin: `15-20px`
- Padding: `10-20px`

#### **Print Styles:**
```css
@media print {
    body {
        font-size: 11px;
    }
    
    .cv-container {
        padding: 15px;
    }
    
    /* Ensure colors print correctly */
    .cv-sidebar {
        background: #667eea !important;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
    }
}
```

### **📱 6. Responsive Design:**

#### **Grid Layout (Modern Template):**
```css
.cv-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    min-height: 100vh;
}
```

#### **Flexbox Layout:**
```css
.work-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}
```

### **🚀 7. Template Development:**

#### **Tạo template mới:**
1. Tạo file `src/templates/cv/{template-name}.html`
2. Follow class naming convention
3. Implement responsive design
4. Add print styles
5. Test với different data sets

#### **Template Requirements:**
- ✅ Responsive design
- ✅ Print-friendly styles
- ✅ Consistent class naming
- ✅ Proper data binding
- ✅ Error handling for missing data
- ✅ Vietnamese language support

### **📋 8. API Usage:**

#### **Download CV as PDF:**
```http
GET /cvs/{cvId}/download?template=default&format=A4
Authorization: Bearer <token>
```

#### **Download Main CV as PDF:**
```http
GET /cvs/main/download?template=modern&format=Letter
Authorization: Bearer <token>
```

#### **Get Available Templates:**
```http
GET /cvs/templates
Authorization: Bearer <token>
```

#### **Query Parameters:**
- `template`: `default` | `modern` | `harvard` (default: `default`)
- `format`: `A4` | `Letter` (default: `A4`)

### **🔍 9. Testing:**

#### **Test Cases:**
- ✅ CV với đầy đủ thông tin
- ✅ CV với thông tin thiếu
- ✅ CV với nested data rỗng
- ✅ CV với avatar và không có avatar
- ✅ Different templates
- ✅ Different formats
- ✅ Long text content
- ✅ Special characters

#### **Performance:**
- PDF generation time < 5 seconds
- Memory usage < 100MB
- Browser cleanup after generation

### **🎓 10. Template Harvard Style:**

#### **Đặc điểm:**
- **Font**: Times New Roman (serif) - chuẩn academic
- **Layout**: Single column, clean và professional
- **Spacing**: Compact, tối ưu cho in ấn
- **Style**: Formal, suitable cho academic và corporate
- **Header**: Centered với border bottom
- **Sections**: Clear separation với uppercase titles
- **Dates**: Right-aligned, italic style
- **Content**: Justified text, professional formatting

#### **Phù hợp cho:**
- Academic positions
- Research roles
- Corporate executive positions
- Government positions
- Formal professional applications
