#!/usr/bin/env node

/**
 * Aigent Workflow Migration Script
 * Converts all $vars.KEY_NAME references to $env.KEY_NAME for Docker self-hosted deployment
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  directories: [
    'Aigent_Modules_Core',
    'Aigent_Modules_Enterprise'
  ],
  backupDir: 'backup_pre_env',
  reportsDir: 'migration_reports',
  outputSuffix: '_env'
};

// Statistics tracking
const stats = {
  totalFiles: 0,
  processedFiles: 0,
  skippedFiles: 0,
  errors: [],
  fileDetails: []
};

/**
 * Find all JSON workflow files in a directory
 */
function findWorkflowFiles(dirPath) {
  const files = [];

  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  Directory not found: ${dirPath}`);
    return files;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Skip backup and report directories
      if (entry.name === config.backupDir || entry.name === config.reportsDir) {
        continue;
      }
      files.push(...findWorkflowFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // Skip already converted files
      if (!entry.name.includes('_env.json')) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Convert $vars to $env in workflow content
 */
function convertVarsToEnv(content) {
  const results = {
    originalCount: 0,
    convertedCount: 0,
    remainingCount: 0,
    changes: []
  };

  // Count original $vars occurrences
  const originalMatches = content.match(/\$vars\./g);
  results.originalCount = originalMatches ? originalMatches.length : 0;

  if (results.originalCount === 0) {
    return { content, results };
  }

  // Pattern 1: Simple {{$vars.KEY_NAME}} replacement
  let newContent = content.replace(/\{\{\$vars\.([A-Z_][A-Z0-9_]*)\}\}/g, (match, varName) => {
    results.changes.push(`{{$vars.${varName}}} → {{$env.${varName}}}`);
    results.convertedCount++;
    return `{{$env.${varName}}}`;
  });

  // Pattern 2: Complex expressions with $vars (e.g., {{$vars.URL}}/path or {{$vars.A || $vars.B}})
  newContent = newContent.replace(/\{\{([^}]*)\$vars\.([A-Z_][A-Z0-9_]*)([^}]*)\}\}/g, (match, before, varName, after) => {
    // Handle fallback expressions like {{$vars.A || $vars.B}}
    let replacement = `{{${before}$env.${varName}${after}}}`;

    // If there are multiple $vars in the same expression, convert all of them
    replacement = replacement.replace(/\$vars\./g, '$env.');

    results.changes.push(`Pattern: ${match.substring(0, 50)}... → converted to $env`);
    results.convertedCount++;
    return replacement;
  });

  // Pattern 3: Quoted strings containing $vars (for JSON property values)
  newContent = newContent.replace(/"([^"]*)\$vars\.([A-Z_][A-Z0-9_]*)([^"]*)"/g, (match, before, varName, after) => {
    results.changes.push(`Quoted: "$vars.${varName}" → "$env.${varName}"`);
    results.convertedCount++;
    return `"${before}$env.${varName}${after}"`;
  });

  // Pattern 4: Fallback expressions with || operator
  newContent = newContent.replace(/\$vars\.([A-Z_][A-Z0-9_]*)\s*\|\|\s*\$env\.([A-Z_][A-Z0-9_]*)/g, (match, varsKey, envKey) => {
    results.changes.push(`Removed redundant fallback: $vars.${varsKey} || $env.${envKey} → $env.${envKey || varsKey}`);
    results.convertedCount++;
    return `$env.${envKey || varsKey}`;
  });

  // Pattern 5: Inside JavaScript code strings - standalone $vars.VAR_NAME (not in n8n expressions)
  // This handles cases like: const x = $vars.API_KEY_ENABLED
  newContent = newContent.replace(/([^{])\$vars\.([A-Z_][A-Z0-9_]*)([^}])/g, (match, before, varName, after) => {
    // Avoid replacing if it's part of an already processed {{...}} expression
    if (before === '{' || after === '}') {
      return match;
    }
    results.changes.push(`JS code: $vars.${varName} → $env.${varName}`);
    results.convertedCount++;
    return `${before}$env.${varName}${after}`;
  });

  // Pattern 6: Edge case - $vars at the start of a line or after whitespace in JS code
  newContent = newContent.replace(/(\s)\$vars\.([A-Z_][A-Z0-9_]*)/g, (match, whitespace, varName) => {
    results.changes.push(`JS code (whitespace): $vars.${varName} → $env.${varName}`);
    results.convertedCount++;
    return `${whitespace}$env.${varName}`;
  });

  // Final check for any remaining $vars references
  const remainingMatches = newContent.match(/\$vars\./g);
  results.remainingCount = remainingMatches ? remainingMatches.length : 0;

  return { content: newContent, results };
}

/**
 * Backup a file before processing
 */
function backupFile(filePath, baseDir) {
  const relativePath = path.relative(baseDir, filePath);
  const backupPath = path.join(baseDir, config.backupDir, relativePath);
  const backupDir = path.dirname(backupPath);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  fs.copyFileSync(filePath, backupPath);
  console.log(`📦 Backed up: ${relativePath}`);
}

/**
 * Process a single workflow file
 */
function processWorkflowFile(filePath, baseDir) {
  console.log(`\n🔄 Processing: ${path.relative(baseDir, filePath)}`);

  try {
    // Read original file
    const originalContent = fs.readFileSync(filePath, 'utf8');

    // Backup original file
    backupFile(filePath, baseDir);

    // Parse JSON to validate
    let workflowData;
    try {
      workflowData = JSON.parse(originalContent);
    } catch (parseError) {
      throw new Error(`Invalid JSON: ${parseError.message}`);
    }

    // Convert $vars to $env
    const { content: newContent, results } = convertVarsToEnv(originalContent);

    // Validate converted JSON
    try {
      JSON.parse(newContent);
    } catch (parseError) {
      throw new Error(`Conversion produced invalid JSON: ${parseError.message}`);
    }

    // Prepare output filename
    const dir = path.dirname(filePath);
    const basename = path.basename(filePath, '.json');
    const outputPath = path.join(dir, `${basename}${config.outputSuffix}.json`);

    // Write converted file
    fs.writeFileSync(outputPath, newContent, 'utf8');

    // Record statistics
    const fileInfo = {
      originalFile: path.relative(baseDir, filePath),
      outputFile: path.relative(baseDir, outputPath),
      varsFound: results.originalCount,
      varsReplaced: results.convertedCount,
      varsRemaining: results.remainingCount,
      status: results.remainingCount === 0 ? '✅ Complete' : '⚠️  Incomplete'
    };

    stats.fileDetails.push(fileInfo);
    stats.processedFiles++;

    console.log(`   ✅ Converted ${results.convertedCount} $vars references`);
    console.log(`   📝 Output: ${path.basename(outputPath)}`);

    if (results.remainingCount > 0) {
      console.log(`   ⚠️  WARNING: ${results.remainingCount} $vars references could not be converted`);
    }

    return fileInfo;

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    stats.errors.push({
      file: path.relative(baseDir, filePath),
      error: error.message
    });
    stats.skippedFiles++;
    return null;
  }
}

/**
 * Generate migration report
 */
function generateReport(baseDir) {
  const reportPath = path.join(baseDir, config.reportsDir, 'vars_to_env_report.md');

  const totalVarsFound = stats.fileDetails.reduce((sum, f) => sum + f.varsFound, 0);
  const totalVarsReplaced = stats.fileDetails.reduce((sum, f) => sum + f.varsReplaced, 0);
  const totalVarsRemaining = stats.fileDetails.reduce((sum, f) => sum + f.varsRemaining, 0);

  let report = `# Aigent Workflow Migration Report
## $vars → $env Conversion for Docker Self-Hosted Deployment

**Generated:** ${new Date().toISOString()}

---

## Summary

| Metric | Count |
|--------|-------|
| Total Files Found | ${stats.totalFiles} |
| Successfully Processed | ${stats.processedFiles} |
| Skipped/Errors | ${stats.skippedFiles} |
| Total $vars Found | ${totalVarsFound} |
| Total Replaced | ${totalVarsReplaced} |
| Total Remaining | ${totalVarsRemaining} |

**Migration Status:** ${totalVarsRemaining === 0 ? '✅ COMPLETE - All $vars converted!' : '⚠️  INCOMPLETE - Some $vars remain'}

---

## File Details

| Original File | Output File | $vars Found | Replaced | Remaining | Status |
|---------------|-------------|-------------|----------|-----------|--------|
`;

  stats.fileDetails.forEach(file => {
    report += `| ${file.originalFile} | ${file.outputFile} | ${file.varsFound} | ${file.varsReplaced} | ${file.varsRemaining} | ${file.status} |\n`;
  });

  if (stats.errors.length > 0) {
    report += `\n---\n\n## Errors\n\n`;
    stats.errors.forEach(err => {
      report += `- **${err.file}:** ${err.error}\n`;
    });
  }

  report += `\n---\n\n## Next Steps

`;

  if (totalVarsRemaining === 0) {
    report += `✅ All workflows successfully migrated!

### Deployment Checklist:
1. ✅ All $vars converted to $env
2. ⬜ Update .env file with all required variables
3. ⬜ Test workflows in Docker environment
4. ⬜ Verify environment variable loading
5. ⬜ Delete original workflow files (keep backups)
6. ⬜ Rename *_env.json files to remove suffix (optional)

### Testing Commands:
\`\`\`bash
# Verify no $vars remain
grep -r "\\$vars\\." Aigent_Modules_Core/ Aigent_Modules_Enterprise/ || echo "✅ No $vars found"

# Start Docker environment
docker-compose up -d

# Check n8n logs for any environment variable errors
docker-compose logs n8n
\`\`\`
`;
  } else {
    report += `⚠️ Manual review required for ${totalVarsRemaining} remaining $vars references.

### Action Items:
1. Review files with "Remaining" count > 0
2. Manually convert complex expressions
3. Re-run migration script after fixes
4. Verify all variables exist in .env file
`;
  }

  report += `\n---\n\n## Backup Location

Original files backed up to: \`${config.backupDir}/\`

To restore original files if needed:
\`\`\`bash
cp -r ${config.backupDir}/Aigent_Modules_Core/* Aigent_Modules_Core/
cp -r ${config.backupDir}/Aigent_Modules_Enterprise/* Aigent_Modules_Enterprise/
\`\`\`

---

*Generated by Aigent Migration Script v1.0*
`;

  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`\n📊 Migration report generated: ${reportPath}`);

  return reportPath;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Aigent Workflow Migration: $vars → $env\n');
  console.log('=' .repeat(60));

  const baseDir = __dirname;
  const allFiles = [];

  // Find all workflow files
  for (const dir of config.directories) {
    const dirPath = path.join(baseDir, dir);
    console.log(`\n📁 Scanning directory: ${dir}`);
    const files = findWorkflowFiles(dirPath);
    console.log(`   Found ${files.length} workflow file(s)`);
    allFiles.push(...files);
  }

  stats.totalFiles = allFiles.length;

  if (allFiles.length === 0) {
    console.log('\n⚠️  No workflow files found to process.');
    return;
  }

  console.log(`\n📋 Total workflows to process: ${stats.totalFiles}`);
  console.log('=' .repeat(60));

  // Process each file
  for (const filePath of allFiles) {
    processWorkflowFile(filePath, baseDir);
  }

  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 Generating migration report...');
  const reportPath = generateReport(baseDir);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('✨ MIGRATION COMPLETE\n');
  console.log(`📦 Processed: ${stats.processedFiles}/${stats.totalFiles} files`);
  console.log(`✅ Successful: ${stats.processedFiles}`);
  console.log(`❌ Errors: ${stats.skippedFiles}`);

  const totalRemaining = stats.fileDetails.reduce((sum, f) => sum + f.varsRemaining, 0);
  if (totalRemaining === 0) {
    console.log(`\n🎉 SUCCESS! All $vars converted to $env`);
  } else {
    console.log(`\n⚠️  WARNING: ${totalRemaining} $vars references remain`);
  }

  console.log(`\n📄 Full report: ${reportPath}`);
  console.log('=' .repeat(60) + '\n');
}

// Execute
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

module.exports = { convertVarsToEnv, findWorkflowFiles };
