import dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { PrismaClient, JobType, ExperienceLevel } from '../src/generated/prisma/index.js';

// Load environment variables
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

// Map job type from CSV to enum
function mapJobType(type: string): JobType {
  if (!type || type.trim() === '') {
    return JobType.FULL_TIME;
  }

  const typeLower = type.toLowerCase().trim();

  if (typeLower.includes('part') || typeLower.includes('bán thời')) {
    return JobType.PART_TIME;
  }
  if (typeLower.includes('contract') || typeLower.includes('hợp đồng')) {
    return JobType.CONTRACT;
  }
  if (typeLower.includes('intern') || typeLower.includes('thực tập')) {
    return JobType.INTERNSHIP;
  }

  return JobType.FULL_TIME; // Default
}

// Map experience level from CSV to enum
function mapExperienceLevel(level: string, years: string): ExperienceLevel | null {
  if (!level && !years) {
    return null;
  }

  const levelLower = (level || '').toLowerCase().trim();
  const yearsLower = (years || '').toLowerCase().trim();

  // Check years of experience first
  if (yearsLower.includes('không yêu cầu') || yearsLower.includes('no experience') || yearsLower.includes('0')) {
    return ExperienceLevel.ENTRY;
  }
  if (yearsLower.includes('1-3') || yearsLower.includes('1 năm') || yearsLower.includes('junior')) {
    return ExperienceLevel.JUNIOR;
  }
  if (yearsLower.includes('3-5') || yearsLower.includes('3 năm') || yearsLower.includes('mid')) {
    return ExperienceLevel.MID;
  }
  if (yearsLower.includes('5-8') || yearsLower.includes('5 năm') || yearsLower.includes('senior')) {
    return ExperienceLevel.SENIOR;
  }
  if (yearsLower.includes('8+') || yearsLower.includes('8 năm') || yearsLower.includes('lead')) {
    return ExperienceLevel.LEAD;
  }

  // Check career level
  if (levelLower.includes('thực tập') || levelLower.includes('intern') || levelLower.includes('entry')) {
    return ExperienceLevel.ENTRY;
  }
  if (levelLower.includes('nhân viên') || levelLower.includes('junior')) {
    return ExperienceLevel.JUNIOR;
  }
  if (levelLower.includes('trưởng') || levelLower.includes('phó') || levelLower.includes('mid')) {
    return ExperienceLevel.MID;
  }
  if (levelLower.includes('giám đốc') || levelLower.includes('senior') || levelLower.includes('quản lý')) {
    return ExperienceLevel.SENIOR;
  }
  if (levelLower.includes('tổng giám đốc') || levelLower.includes('ceo') || levelLower.includes('lead')) {
    return ExperienceLevel.LEAD;
  }

  return null;
}

// Parse salary from string
function parseSalary(salary: string): number | null {
  if (!salary || salary.trim() === '' || salary.toLowerCase().includes('thỏa thuận') || salary.toLowerCase().includes('negotiable')) {
    return null;
  }

  // Extract numbers from salary string like "5,000,000 - 10,000,000" or "5.000.000 - 10.000.000"
  const numbers = salary.match(/[\d,\.]+/g);
  if (!numbers || numbers.length === 0) {
    return null;
  }

  // Get the first number (minimum salary) or average if range
  const firstNumber = numbers[0].replace(/,/g, '').replace(/\./g, '');
  const num = parseFloat(firstNumber);

  if (isNaN(num)) {
    return null;
  }

  // If there's a second number, calculate average
  if (numbers.length > 1) {
    const secondNumber = numbers[1].replace(/,/g, '').replace(/\./g, '');
    const num2 = parseFloat(secondNumber);
    if (!isNaN(num2)) {
      return Math.round((num + num2) / 2);
    }
  }

  return Math.round(num);
}

// Parse date from string
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  try {
    // Try parsing common date formats: DD/MM/YYYY, YYYY-MM-DD, etc.
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try DD/MM/YYYY format
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

// Extract embedding array from CSV row
function extractEmbedding(row: any): number[] {
  const embedding: number[] = [];
  let i = 0;
  
  while (true) {
    const key = `emb_${i}`;
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      const value = parseFloat(row[key]);
      if (!isNaN(value)) {
        embedding.push(value);
      } else {
        break;
      }
    } else {
      break;
    }
    i++;
  }

  return embedding;
}

// Clean text
function cleanText(text: string): string | null {
  if (!text || text.trim() === '' || text.toLowerCase().includes('cập nhật')) {
    return null;
  }
  return text.trim();
}

// Parse requirements into individual items
function parseRequirements(requirementsText: string): Array<{ title: string; description: string | null }> {
  if (!requirementsText || requirementsText.trim() === '') {
    return [];
  }

  const requirements: Array<{ title: string; description: string | null }> = [];
  const cleaned = requirementsText.trim();

  // Try to split by numbered items (1., 2., 3., etc.) - handle cases with or without space after number
  // Pattern matches: "1.", "1. ", "1.Text" or "1. Text"
  const numberedPattern = /(\d+\.\s*[^\d]+?)(?=\d+\.|$)/gs;
  const numberedMatches = Array.from(cleaned.matchAll(numberedPattern));

  if (numberedMatches && numberedMatches.length > 0) {
    for (const match of numberedMatches) {
      const text = match[1].trim();
      // Remove the number prefix
      const withoutNumber = text.replace(/^\d+\.\s*/, '').trim();
      
      if (!withoutNumber) continue;

      // Try to split by colon (Vietnamese or English)
      const colonIndex = withoutNumber.indexOf(':');
      const vietnameseColonIndex = withoutNumber.indexOf('：');
      const splitIndex = colonIndex > 0 ? colonIndex : (vietnameseColonIndex > 0 ? vietnameseColonIndex : -1);

      if (splitIndex > 0) {
        const title = withoutNumber.substring(0, splitIndex).trim();
        const description = withoutNumber.substring(splitIndex + 1).trim();
        requirements.push({
          title: title || 'Yêu cầu',
          description: description || null,
        });
      } else {
        // No colon found, treat the whole thing as description
        requirements.push({
          title: 'Yêu cầu',
          description: withoutNumber,
        });
      }
    }
  } else {
    // If no numbered items, try splitting by newlines, semicolons, or periods
    const lines = cleaned.split(/\n|;|；|\.(?=\s*[A-ZÀ-ỹ\d])/).filter(line => line.trim());
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        // Try to extract title and description
        const colonIndex = trimmed.indexOf(':');
        const vietnameseColonIndex = trimmed.indexOf('：');
        const splitIndex = colonIndex > 0 ? colonIndex : (vietnameseColonIndex > 0 ? vietnameseColonIndex : -1);
        
        if (splitIndex > 0) {
          const title = trimmed.substring(0, splitIndex).trim();
          const description = trimmed.substring(splitIndex + 1).trim();
          requirements.push({
            title: title || 'Yêu cầu',
            description: description || null,
          });
        } else {
          requirements.push({
            title: 'Yêu cầu',
            description: trimmed,
          });
        }
      }
    }
  }

  // If still no requirements found, treat the whole text as one requirement
  if (requirements.length === 0 && cleaned) {
    requirements.push({
      title: 'Yêu cầu chung',
      description: cleaned,
    });
  }

  return requirements;
}

// Parse benefits into individual items
function parseBenefits(benefitsText: string): Array<{ title: string; description: string | null }> {
  if (!benefitsText || benefitsText.trim() === '') {
    return [];
  }

  const benefits: Array<{ title: string; description: string | null }> = [];
  const cleaned = benefitsText.trim();

  // Try to split by lines (newline, semicolon, or period followed by capital letter)
  // Split by newline, semicolon, or period (but not if period is part of a number or abbreviation)
  const lines = cleaned.split(/\n|;|；|\.(?=\s*[A-ZÀ-ỹ])/).filter(line => line.trim());

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      // Try to extract title and description
      const colonIndex = trimmed.indexOf(':');
      const vietnameseColonIndex = trimmed.indexOf('：');
      const splitIndex = colonIndex > 0 ? colonIndex : (vietnameseColonIndex > 0 ? vietnameseColonIndex : -1);
      
      if (splitIndex > 0) {
        const title = trimmed.substring(0, splitIndex).trim();
        const description = trimmed.substring(splitIndex + 1).trim();
        benefits.push({
          title: title || 'Quyền lợi',
          description: description || null,
        });
      } else {
        // If no colon, check if it starts with a common benefit keyword
        const benefitKeywords = [
          'Được', 'Làm việc', 'Cơ hội', 'Chế độ', 'Thưởng', 'Hỗ trợ',
          'Lương', 'BHXH', 'BHYT', 'BHTN', 'Đào tạo', 'Thăng tiến', 'Tổ chức'
        ];
        
        const hasKeyword = benefitKeywords.some(keyword => trimmed.startsWith(keyword));
        if (hasKeyword) {
          // Use first part as title (up to 50 chars or until a period/comma)
          const periodIndex = trimmed.indexOf('.');
          const commaIndex = trimmed.indexOf(',');
          const titleEnd = Math.min(
            trimmed.length,
            periodIndex > 0 ? periodIndex : trimmed.length,
            commaIndex > 0 ? commaIndex : trimmed.length,
            50
          );
          const title = trimmed.substring(0, titleEnd).trim();
          const description = trimmed.length > titleEnd ? trimmed.substring(titleEnd + 1).trim() : null;
          
          benefits.push({
            title: title || 'Quyền lợi',
            description: description,
          });
        } else {
          // If no keyword, use the whole line as description
          benefits.push({
            title: 'Quyền lợi',
            description: trimmed,
          });
        }
      }
    }
  }

  // If still no benefits found, treat the whole text as one benefit
  if (benefits.length === 0 && cleaned) {
    benefits.push({
      title: 'Quyền lợi chung',
      description: cleaned,
    });
  }

  return benefits;
}

interface CSVRow {
  [key: string]: string;
}

async function importJobs() {
  try {
    console.log('📂 Reading CSV file...');
    const csvFilePath = './job_data.csv';
    const fileContent = readFileSync(csvFilePath, 'utf-8');

    console.log('📊 Parsing CSV data...');
    const records: CSVRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // Handle UTF-8 BOM
    });

    console.log(`✅ Found ${records.length} jobs in CSV`);

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    console.log('\n🔄 Starting import process...\n');

    // Cache for company and job existence checks to avoid repeated queries
    const companyCache = new Set<string>();
    const existingJobIds = new Set<string>();
    
    // Pre-fetch all existing jobs and companies
    console.log('📋 Pre-loading existing data...');
    const existingJobs = await prisma.job.findMany({
      select: { id: true },
    });
    existingJobs.forEach(job => existingJobIds.add(job.id));
    
    const companies = await prisma.company.findMany({
      select: { id: true },
    });
    companies.forEach(company => companyCache.add(company.id));
    
    console.log(`✅ Found ${existingJobIds.size} existing jobs, ${companyCache.size} companies\n`);

    // Process in batches to avoid overwhelming the database
    const batchSize = 50; // Smaller batch for transaction
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const jobsToCreate: any[] = [];
      
      // Prepare all jobs in batch
      for (const row of batch) {
        try {
          const jobId = row['job_id']?.trim() || row['JobID']?.trim();
          const companyId = row['company_id']?.trim();
          const jobTitle = row['Job Title']?.trim() || row['JobTitle']?.trim();

          // Skip if required fields are missing
          if (!jobId) {
            skipCount++;
            continue;
          }

          if (!companyId) {
            skipCount++;
            continue;
          }

          if (!jobTitle) {
            skipCount++;
            continue;
          }

          // Check if company exists (using cache)
          if (!companyCache.has(companyId)) {
            skipCount++;
            continue;
          }

          // Check if job already exists (using cache)
          if (existingJobIds.has(jobId)) {
            skipCount++;
            continue;
          }

          const embedding = extractEmbedding(row);
          const expiresAt = parseDate(row['Submission Deadline'] || row['SubmissionDeadline'] || '');
          
          // Parse requirements and benefits
          const requirementsText = row['Job Requirements'] || row['JobRequirements'] || '';
          const benefitsText = row['Benefits'] || '';
          const requirements = parseRequirements(requirementsText);
          const benefits = parseBenefits(benefitsText);

          // Parse application count from Number Cadidate (note: typo in CSV column name)
          const applicationCountText = row['Number Cadidate'] || row['Number Candidate'] || row['NumberCadidate'] || row['NumberCandidate'] || '0';
          const applicationCount = parseInt(applicationCountText.trim(), 10) || 0;

          const jobData = {
            id: jobId, // Use job_id from CSV as ID
            title: jobTitle,
            description: cleanText(row['Job Description'] || row['JobDescription'] || ''),
            location: cleanText(row['Job Address'] || row['JobAddress'] || ''),
            industry: cleanText(row['Industry'] || ''),
            experienceLevel: mapExperienceLevel(
              row['Career Level'] || row['CareerLevel'] || '',
              row['Years of Experience'] || row['YearsOfExperience'] || ''
            ),
            type: mapJobType(row['Job Type'] || row['JobType'] || ''),
            salary: parseSalary(row['Salary'] || ''),
            embedding: embedding.length > 0 ? embedding : [],
            urgent: false,
            isActive: true,
            expiresAt: expiresAt,
            applicationCount: applicationCount,
            companyId: companyId,
            requirements: {
              create: requirements.map(req => ({
                title: req.title,
                description: req.description,
              })),
            },
            benefits: {
              create: benefits.map(ben => ({
                title: ben.title,
                description: ben.description,
              })),
            },
          };

          jobsToCreate.push(jobData);
        } catch (error: any) {
          errorCount++;
          console.error(`❌ Error preparing job "${row['Job Title'] || row['job_id']}":`, error.message);
        }
      }

      // Insert all jobs in batch using transaction
      if (jobsToCreate.length > 0) {
        try {
          await prisma.$transaction(
            jobsToCreate.map(jobData =>
              prisma.job.create({
                data: jobData,
              })
            )
          );

          // Update cache
          jobsToCreate.forEach(job => existingJobIds.add(job.id));
          successCount += jobsToCreate.length;
          
          if (successCount % 100 === 0) {
            console.log(`✅ Imported ${successCount} jobs...`);
          }
        } catch (error: any) {
          errorCount += jobsToCreate.length;
          console.error(`❌ Error importing batch:`, error.message);
          // Fallback: try inserting one by one
          for (const jobData of jobsToCreate) {
            try {
              await prisma.job.create({ data: jobData });
              existingJobIds.add(jobData.id);
              successCount++;
              errorCount--;
            } catch (err: any) {
              console.error(`❌ Error importing job "${jobData.id}":`, err.message);
            }
          }
        }
      }

      console.log(`📊 Progress: ${Math.min(i + batchSize, records.length)}/${records.length} processed`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📈 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount}`);
    console.log(`⏭️  Skipped (duplicates/empty/invalid): ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${records.length}`);
    console.log('='.repeat(50));

  } catch (error: any) {
    console.error('❌ Fatal error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importJobs()
  .then(() => {
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });

