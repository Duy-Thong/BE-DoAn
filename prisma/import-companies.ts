import dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { PrismaClient, CompanySize } from '../src/generated/prisma/index.js';

// Load environment variables
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

// Map company size from CSV to enum
function mapCompanySize(size: string): CompanySize | null {
  if (!size || size.trim() === '' || size.toLowerCase().includes('cập nhật')) {
    return null;
  }

  const sizeLower = size.toLowerCase().trim();

  // Extract numbers from ranges like "100-499", "25-99", etc.
  const rangeMatch = sizeLower.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    const avg = (min + max) / 2;

    // Map based on average size
    if (avg <= 10) {
      return CompanySize.STARTUP;
    } else if (avg <= 50) {
      return CompanySize.SMALL;
    } else if (avg <= 200) {
      return CompanySize.MEDIUM;
    } else if (avg <= 1000) {
      return CompanySize.LARGE;
    } else {
      return CompanySize.ENTERPRISE;
    }
  }

  // Handle single numbers or text descriptions
  if (sizeLower.includes('1-10') || sizeLower.includes('startup') || sizeLower === '1' || sizeLower === '10') {
    return CompanySize.STARTUP;
  }
  if (sizeLower.includes('11-50') || sizeLower.includes('10-24') || sizeLower.includes('small')) {
    return CompanySize.SMALL;
  }
  if (sizeLower.includes('51-200') || sizeLower.includes('25-99') || sizeLower.includes('100-499') || sizeLower.includes('medium')) {
    return CompanySize.MEDIUM;
  }
  if (sizeLower.includes('201-1000') || sizeLower.includes('500-999') || sizeLower.includes('large')) {
    return CompanySize.LARGE;
  }
  if (sizeLower.includes('1000+') || sizeLower.includes('enterprise')) {
    return CompanySize.ENTERPRISE;
  }

  return null;
}

// Clean company name (remove leading quotes and dots)
function cleanCompanyName(name: string): string {
  if (!name) return '';
  return name
    .replace(/^['"]+/, '') // Remove leading quotes
    .replace(/^\.+/, '') // Remove leading dots
    .trim();
}

// Clean description
function cleanDescription(desc: string): string | null {
  if (!desc || desc.trim() === '' || desc.toLowerCase().includes('cập nhật')) {
    return null;
  }
  return desc.trim();
}

// Clean address
function cleanAddress(addr: string): string | null {
  if (!addr || addr.trim() === '' || addr.toLowerCase().includes('cập nhật')) {
    return null;
  }
  return addr.trim();
}

// Clean industry
function cleanIndustry(industry: string): string | null {
  if (!industry || industry.trim() === '' || industry.toLowerCase().includes('cập nhật')) {
    return null;
  }
  return industry.trim();
}

interface CSVRow {
  'Name Company': string;
  'Company Overview': string;
  'Company Size': string;
  'Company Address': string;
  'Industry': string;
  'company_id': string;
}

async function importCompanies() {
  try {
    console.log('📂 Reading CSV file...');
    const csvFilePath = './company_data.csv';
    const fileContent = readFileSync(csvFilePath, 'utf-8');

    console.log('📊 Parsing CSV data...');
    const records: CSVRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // Handle UTF-8 BOM
    });

    console.log(`✅ Found ${records.length} companies in CSV`);

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    console.log('\n🔄 Starting import process...\n');

    // Process in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      for (const row of batch) {
        try {
          const companyName = cleanCompanyName(row['Name Company']);
          const companyId = row['company_id']?.trim();
          
          // Skip if name is empty
          if (!companyName) {
            skipCount++;
            continue;
          }

          // Skip if company_id is empty
          if (!companyId) {
            console.log(`⏭️  Skipping company without ID: ${companyName}`);
            skipCount++;
            continue;
          }

          // Check if company already exists by ID
          const existing = await prisma.company.findUnique({
            where: {
              id: companyId,
            },
          });

          if (existing) {
            console.log(`⏭️  Skipping duplicate ID: ${companyId} - ${companyName}`);
            skipCount++;
            continue;
          }

          const companyData = {
            id: companyId, // Use company_id from CSV as ID
            name: companyName,
            description: cleanDescription(row['Company Overview']),
            companySize: mapCompanySize(row['Company Size']),
            address: cleanAddress(row['Company Address']),
            industry: cleanIndustry(row['Industry']),
            status: 'REGISTERED', // Default status for imported companies
          };

          await prisma.company.create({
            data: companyData,
          });

          successCount++;
          
          if (successCount % 50 === 0) {
            console.log(`✅ Imported ${successCount} companies...`);
          }
        } catch (error: any) {
          errorCount++;
          console.error(`❌ Error importing company "${row['Name Company']}":`, error.message);
        }
      }

      console.log(`📊 Progress: ${Math.min(i + batchSize, records.length)}/${records.length} processed`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📈 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount}`);
    console.log(`⏭️  Skipped (duplicates/empty): ${skipCount}`);
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
importCompanies()
  .then(() => {
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });

