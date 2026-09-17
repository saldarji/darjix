const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim().replace(/^"|"$/g, ''));
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim().replace(/^"|"$/g, ''));
  return result;
}

function formatName(rawName) {
  if (!rawName) return '';
  let name = rawName.trim();

  // Check for "Last, First" format
  if (name.includes(',')) {
    const parts = name.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      const last = parts[0];
      const first = parts.slice(1).join(' ');
      name = `${first} ${last}`;
    }
  }

  // Capitalize properly if ALL CAPS or all lowercase
  const words = name.split(/\s+/).map(word => {
    // Keep suffixes like Jr., III, II, IV intact
    if (/^(jr\.?|sr\.?)$/i.test(word)) {
      return /^jr\.?/i.test(word) ? 'Jr.' : 'Sr.';
    }
    if (/^(ii|iii|iv)$/i.test(word)) {
      return word.toUpperCase();
    }
    // Handle O'Brien, MacLeod, etc.
    if (/^o'[a-z]/i.test(word)) {
      return "O'" + word.charAt(2).toUpperCase() + word.slice(3).toLowerCase();
    }
    if (/^mc[a-z]/i.test(word)) {
      return "Mc" + word.charAt(2).toUpperCase() + word.slice(3).toLowerCase();
    }
    if (word === word.toUpperCase() || word === word.toLowerCase()) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word;
  });

  return words.join(' ');
}

function extractYear(dateStr, memberType) {
  // Join year ONLY matters for Life and Regular members
  const lowerType = (memberType || '').toLowerCase();
  const isLifeOrRegular = lowerType.includes('life') || lowerType.includes('regular');

  if (!isLifeOrRegular || !dateStr) {
    return '';
  }

  const match = dateStr.match(/\b(19\d\d|20\d\d)\b/);
  return match ? match[1] : '';
}

function parseMemberReport(csvContent) {
  const lines = csvContent.split(/\r?\n/);
  const members = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    const type = cols[0] || '';
    const rawName = cols[1] || '';
    const status = cols[2] || '';
    const joinDate = cols[3] || '';

    // Ignore headers, totals, page markers
    if (
      type.toLowerCase() === 'type' ||
      type.toLowerCase().includes('total') ||
      type.toLowerCase().includes('page') ||
      !rawName
    ) {
      continue;
    }

    // Standardize Type display names
    let normalizedType = type.trim();
    if (normalizedType === 'Life') normalizedType = 'Life Members';
    else if (normalizedType === 'Regular') normalizedType = 'Regular Members';
    else if (normalizedType === 'Social') normalizedType = 'Social Members';
    else if (normalizedType === 'Intermediate') normalizedType = 'Intermediate Members';
    else if (normalizedType === 'Junior') normalizedType = 'Junior Members';

    const formattedName = formatName(rawName);
    const year = extractYear(joinDate, type);

    members.push({
      name: formattedName,
      class: normalizedType,
      since: year,
      status: status || 'Active'
    });
  }

  return members;
}

function parseOfficers(txtContent) {
  if (!txtContent || !txtContent.trim()) return [];
  const lines = txtContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const officers = [];

  let currentCategory = 'Officer';

  lines.forEach(line => {
    // Header section markers
    if (/(officers of the bridge|flag officers)/i.test(line)) {
      currentCategory = 'Officer';
      return;
    }
    if (/(executive board|board members|board of directors)/i.test(line)) {
      currentCategory = 'Executive Board';
      return;
    }

    if (line.includes(':')) {
      const parts = line.split(':');
      const role = parts[0].trim();
      const rawName = parts.slice(1).join(':').trim();
      if (role && rawName) {
        officers.push({ role, name: formatName(rawName) });
      } else if (role && !rawName) {
        if (/executive board|board/i.test(role)) {
          currentCategory = 'Executive Board';
        } else {
          currentCategory = role;
        }
      }
    } else if (line.includes(' - ')) {
      const parts = line.split(' - ');
      const role = parts[0].trim();
      const rawName = parts.slice(1).join(' - ').trim();
      if (role && rawName) {
        officers.push({ role, name: formatName(rawName) });
      }
    } else if (line.includes('\t')) {
      const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        officers.push({ role: parts[0], name: formatName(parts[1]) });
      }
    } else if (line.includes(',')) {
      const parts = line.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        if (/commodore|vice|rear|secretary|treasurer|captain|measurer|director|officer/i.test(parts[0])) {
          officers.push({ role: parts[0], name: formatName(parts.slice(1).join(' ')) });
        } else {
          officers.push({ role: parts[parts.length - 1], name: formatName(parts.slice(0, -1).join(', ')) });
        }
      }
    } else {
      const role = currentCategory || 'Executive Board';
      officers.push({ role, name: formatName(line) });
    }
  });

  return officers;
}

function runParser() {
  const sycMembersDir = path.join(__dirname, '../data/syc_members');
  const reportPath = path.join(sycMembersDir, 'member_report.csv');
  const samplePath = path.join(sycMembersDir, 'members_sample.csv');
  const officersPath = path.join(sycMembersDir, 'officers.txt');

  let csvPath = null;
  if (fs.existsSync(reportPath)) {
    csvPath = reportPath;
  } else if (fs.existsSync(samplePath)) {
    csvPath = samplePath;
  }

  const destPublicDir = path.join(__dirname, '../public/data/syc_members');
  fs.mkdirSync(destPublicDir, { recursive: true });

  if (csvPath) {
    console.log(`📄 Parsing member report: ${path.basename(csvPath)}`);
    const content = fs.readFileSync(csvPath, 'utf-8');
    const parsedMembers = parseMemberReport(content);
    console.log(`✅ Extracted ${parsedMembers.length} active members across classes.`);

    const destJsonData = path.join(sycMembersDir, 'processed_members.json');
    const destPublicJson = path.join(destPublicDir, 'processed_members.json');
    const jsonStr = JSON.stringify(parsedMembers, null, 2);
    fs.writeFileSync(destJsonData, jsonStr);
    fs.writeFileSync(destPublicJson, jsonStr);
  }

  // Parse Officers
  if (fs.existsSync(officersPath)) {
    const officersTxt = fs.readFileSync(officersPath, 'utf-8');
    const parsedOfficers = parseOfficers(officersTxt);
    console.log(`⚓ Parsed ${parsedOfficers.length} officers from officers.txt.`);

    const destOfficerData = path.join(sycMembersDir, 'processed_officers.json');
    const destOfficerPublic = path.join(destPublicDir, 'processed_officers.json');
    const officerJsonStr = JSON.stringify(parsedOfficers, null, 2);
    fs.writeFileSync(destOfficerData, officerJsonStr);
    fs.writeFileSync(destOfficerPublic, officerJsonStr);
  }
}

runParser();

module.exports = { parseMemberReport, parseOfficers, runParser };
