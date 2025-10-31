/**
 * Aigent Test Data Generators
 *
 * PURPOSE: Create randomized test data for comprehensive testing
 * AUDIENCE: Complete beginners (explained step-by-step)
 * SAFETY: All data is completely fictional
 *
 * HOW TO USE THIS FILE:
 * 1. Install Node.js from https://nodejs.org (if not already installed)
 * 2. Save this file to your computer
 * 3. Open terminal/command prompt
 * 4. Navigate to the folder containing this file
 * 5. Run: node TestData_Generators.js
 * 6. Copy the output and use it in your tests!
 *
 * NO CODING EXPERIENCE NEEDED - just follow the steps above!
 */

// ============================================================================
// SECTION 1: HELPER FUNCTIONS
// ============================================================================

/**
 * Pick a random item from an array
 * Example: randomChoice(['apple', 'banana']) might return 'banana'
 */
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random number between min and max
 * Example: randomInt(1, 10) might return 7
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random date between two dates
 */
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Format a date as YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format phone number to E.164 (international standard)
 * Example: +15551234567
 */
function formatPhoneE164(number) {
  // For US numbers, ensure +1 prefix
  const cleaned = number.replace(/\D/g, ''); // Remove non-digits
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  return `+${cleaned}`;
}

/**
 * Generate a random US phone number
 */
function generatePhoneNumber() {
  const areaCode = randomInt(200, 999);
  const exchange = randomInt(200, 999);
  const subscriber = randomInt(1000, 9999);
  return `+1${areaCode}${exchange}${subscriber}`;
}

// ============================================================================
// SECTION 2: DATA POOLS
// ============================================================================

// First names (common American names for diversity)
const firstNames = {
  male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew', 'Paul', 'Joshua', 'Kenneth'],
  female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Dorothy', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle'],
  neutral: ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Skylar', 'Dakota']
};

// Last names (common surnames)
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'];

// Cities and states (for addresses)
const cities = [
  { city: 'New York', state: 'NY', zip_start: '10' },
  { city: 'Los Angeles', state: 'CA', zip_start: '90' },
  { city: 'Chicago', state: 'IL', zip_start: '60' },
  { city: 'Houston', state: 'TX', zip_start: '77' },
  { city: 'Phoenix', state: 'AZ', zip_start: '85' },
  { city: 'Philadelphia', state: 'PA', zip_start: '19' },
  { city: 'San Antonio', state: 'TX', zip_start: '78' },
  { city: 'San Diego', state: 'CA', zip_start: '92' },
  { city: 'Dallas', state: 'TX', zip_start: '75' },
  { city: 'Austin', state: 'TX', zip_start: '78' },
  { city: 'Jacksonville', state: 'FL', zip_start: '32' },
  { city: 'Fort Worth', state: 'TX', zip_start: '76' },
  { city: 'Columbus', state: 'OH', zip_start: '43' },
  { city: 'Charlotte', state: 'NC', zip_start: '28' },
  { city: 'San Francisco', state: 'CA', zip_start: '94' },
  { city: 'Indianapolis', state: 'IN', zip_start: '46' },
  { city: 'Seattle', state: 'WA', zip_start: '98' },
  { city: 'Denver', state: 'CO', zip_start: '80' },
  { city: 'Boston', state: 'MA', zip_start: '02' },
  { city: 'Portland', state: 'OR', zip_start: '97' }
];

// Street types
const streetTypes = ['Street', 'Avenue', 'Road', 'Boulevard', 'Lane', 'Drive', 'Court', 'Place', 'Way', 'Circle'];
const streetNames = ['Maple', 'Oak', 'Pine', 'Cedar', 'Elm', 'Main', 'Park', 'Washington', 'Lake', 'Hill', 'Forest', 'River', 'Spring', 'Valley', 'Sunset', 'Highland', 'Meadow', 'Ridge', 'Garden', 'Willow'];

// Insurance providers
const insuranceProviders = ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Humana', 'Kaiser Permanente', 'Anthem', 'Medicare', 'Medicaid', 'Health Net', 'Molina Healthcare'];

// Lead sources and UTM parameters
const leadSources = {
  website: { utm_source: 'google', utm_medium: 'cpc', utm_campaigns: ['spring_2025', 'summer_promo', 'health_awareness', 'new_patient_special'] },
  facebook: { utm_source: 'facebook', utm_medium: 'social', utm_campaigns: ['fb_awareness', 'fb_retargeting', 'fb_lookalike'] },
  instagram: { utm_source: 'instagram', utm_medium: 'social', utm_campaigns: ['ig_story', 'ig_feed', 'ig_influencer'] },
  referral: { utm_source: 'direct', utm_medium: 'referral', utm_campaigns: ['word_of_mouth', 'patient_referral', 'physician_referral'] },
  email: { utm_source: 'newsletter', utm_medium: 'email', utm_campaigns: ['monthly_newsletter', 'health_tips', 'appointment_reminder'] }
};

// Message templates for leads
const leadMessages = [
  "I'm interested in scheduling a consultation.",
  "I would like to book an appointment for next week.",
  "Can you help me with telehealth visits?",
  "My friend recommended your clinic. I need to see a doctor soon.",
  "I'd like to schedule an annual checkup.",
  "I need to discuss some health concerns.",
  "Do you accept my insurance? I'd like to book an appointment.",
  "I'm new to the area and looking for a primary care physician.",
  "I saw your advertisement and want to learn more.",
  "Can I schedule a same-day appointment?"
];

// Urgent message keywords
const urgentMessages = [
  "URGENT: Severe pain, need help immediately!",
  "Emergency: High fever and difficulty breathing",
  "Urgent care needed - experiencing chest pain",
  "Please help! Allergic reaction happening now",
  "Urgent: Child has high fever and won't stop crying"
];

// ============================================================================
// SECTION 3: GENERATOR FUNCTIONS
// ============================================================================

/**
 * Generate a random patient identity
 */
function generatePatient() {
  const gender = randomChoice(['male', 'female', 'neutral']);
  const firstName = randomChoice(firstNames[gender]);
  const lastName = randomChoice(lastNames);
  const location = randomChoice(cities);
  const streetNumber = randomInt(100, 9999);
  const streetName = randomChoice(streetNames);
  const streetType = randomChoice(streetTypes);

  // Generate date of birth (age between 18 and 90)
  const today = new Date();
  const minBirthDate = new Date(today.getFullYear() - 90, today.getMonth(), today.getDate());
  const maxBirthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const dateOfBirth = randomDate(minBirthDate, maxBirthDate);

  // Generate email (lowercase, with .test for safety)
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.test${randomInt(1000, 9999)}@example.com`;

  // Generate patient ID
  const patientId = `TEST-P-${String(randomInt(1, 9999)).padStart(4, '0')}`;

  // Generate insurance info
  const insurance = randomChoice(insuranceProviders);
  const policyNumber = `TEST-INS-${randomInt(100000, 999999)}`;
  const groupNumber = `GRP-${randomInt(1000, 9999)}`;

  return {
    patient_id: patientId,
    first_name: firstName,
    last_name: lastName,
    email: email,
    phone: generatePhoneNumber(),
    phone_formatted: formatPhoneReadable(generatePhoneNumber()),
    date_of_birth: formatDate(dateOfBirth),
    address: {
      street: `${streetNumber} ${streetName} ${streetType}`,
      city: location.city,
      state: location.state,
      zip: `${location.zip_start}${String(randomInt(100, 999))}`,
      country: 'USA'
    },
    insurance: {
      provider: insurance,
      policy_number: policyNumber,
      group_number: groupNumber
    }
  };
}

/**
 * Generate a random lead
 */
function generateLead() {
  const gender = randomChoice(['male', 'female', 'neutral']);
  const firstName = randomChoice(firstNames[gender]);
  const lastName = randomChoice(lastNames);
  const sourceType = randomChoice(Object.keys(leadSources));
  const source = leadSources[sourceType];
  const isUrgent = Math.random() < 0.1; // 10% chance of urgent

  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.lead${randomInt(1000, 9999)}@example.com`;
  const leadId = `TEST-L-${String(randomInt(1, 9999)).padStart(4, '0')}`;

  // Calculate lead score (20-100)
  let leadScore = randomInt(20, 100);
  if (isUrgent) leadScore = Math.max(leadScore, 80); // Urgent leads get high scores

  return {
    lead_id: leadId,
    first_name: firstName,
    last_name: lastName,
    email: email,
    phone: generatePhoneNumber(),
    phone_formatted: formatPhoneReadable(generatePhoneNumber()),
    source: sourceType,
    utm_source: source.utm_source,
    utm_medium: source.utm_medium,
    utm_campaign: randomChoice(source.utm_campaigns),
    message: isUrgent ? randomChoice(urgentMessages) : randomChoice(leadMessages),
    urgency: isUrgent ? 'urgent' : (Math.random() < 0.3 ? 'low' : 'normal'),
    lead_score: leadScore,
    created_at: new Date().toISOString()
  };
}

/**
 * Generate a random appointment
 */
function generateAppointment(patient = null) {
  if (!patient) patient = generatePatient();

  // Generate appointment date (next 30 days, business days only)
  const today = new Date();
  let appointmentDate = new Date(today);
  appointmentDate.setDate(appointmentDate.getDate() + randomInt(1, 30));

  // Skip weekends
  while (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6) {
    appointmentDate.setDate(appointmentDate.getDate() + 1);
  }

  // Generate appointment time (9 AM to 5 PM, on the hour)
  const appointmentHour = randomInt(9, 16);
  const appointmentTime = `${String(appointmentHour).padStart(2, '0')}:00`;

  const appointmentTypes = ['consultation', 'follow_up', 'annual_checkup', 'urgent_care', 'telehealth'];
  const providers = ['TEST-PROV-001', 'TEST-PROV-002', 'TEST-PROV-003'];

  return {
    appointment_id: `APT-${formatDate(appointmentDate).replace(/-/g, '')}-${String(randomInt(1, 999)).padStart(3, '0')}`,
    patient_id: patient.patient_id,
    patient_name: `${patient.first_name} ${patient.last_name}`,
    patient_email: patient.email,
    patient_phone: patient.phone,
    appointment_date: formatDate(appointmentDate),
    appointment_time: appointmentTime,
    provider_id: randomChoice(providers),
    appointment_type: randomChoice(appointmentTypes),
    duration_minutes: randomChoice([15, 30, 45, 60]),
    status: 'scheduled',
    notes: randomChoice([
      'First visit',
      'Follow-up from previous consultation',
      'Annual checkup',
      'Routine visit',
      'Discussed over phone',
      ''
    ])
  };
}

/**
 * Generate test payment data
 */
function generatePayment(patient = null, amount = null) {
  if (!patient) patient = generatePatient();
  if (!amount) amount = randomChoice([50, 75, 100, 125, 150, 175, 200, 250, 300]);

  // Use Stripe test card numbers
  const testCards = [
    { number: '4242424242424242', type: 'visa', expected: 'success' },
    { number: '4000000000000002', type: 'visa_declined', expected: 'decline' },
    { number: '4000000000009995', type: 'insufficient_funds', expected: 'decline' }
  ];

  const card = randomChoice(testCards);

  return {
    payment_id: `PAY-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(randomInt(1, 999)).padStart(3, '0')}`,
    patient_id: patient.patient_id,
    patient_name: `${patient.first_name} ${patient.last_name}`,
    patient_email: patient.email,
    amount: amount,
    currency: 'usd',
    description: randomChoice([
      'Consultation fee',
      'Annual checkup',
      'Telehealth visit',
      'Follow-up appointment',
      'Urgent care visit'
    ]),
    card_number: card.number,
    card_type: card.type,
    exp_month: '12',
    exp_year: '2030',
    cvc: '123',
    billing_zip: patient.address.zip,
    expected_result: card.expected
  };
}

/**
 * Helper: Format phone number in readable format
 */
function formatPhoneReadable(e164Number) {
  // Convert +15551234567 to (555) 123-4567
  const cleaned = e164Number.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned[0] === '1') {
    const areaCode = cleaned.substr(1, 3);
    const exchange = cleaned.substr(4, 3);
    const subscriber = cleaned.substr(7, 4);
    return `(${areaCode}) ${exchange}-${subscriber}`;
  }
  return e164Number;
}

/**
 * Generate a batch of test data
 */
function generateBatch(type, count = 10) {
  const results = [];
  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'patients':
        results.push(generatePatient());
        break;
      case 'leads':
        results.push(generateLead());
        break;
      case 'appointments':
        results.push(generateAppointment());
        break;
      case 'payments':
        results.push(generatePayment());
        break;
      default:
        console.error(`Unknown type: ${type}`);
        return;
    }
  }
  return results;
}

// ============================================================================
// SECTION 4: COMMAND-LINE INTERFACE
// ============================================================================

/**
 * Main function - runs when you execute this script
 */
function main() {
  console.log('='.repeat(80));
  console.log('Aigent Test Data Generator');
  console.log('='.repeat(80));
  console.log('');

  // Check if command-line arguments are provided
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // No arguments - show menu
    console.log('USAGE: node TestData_Generators.js [type] [count]');
    console.log('');
    console.log('TYPES:');
    console.log('  patients      Generate random patient identities');
    console.log('  leads         Generate random leads');
    console.log('  appointments  Generate random appointments');
    console.log('  payments      Generate random payment test data');
    console.log('  all           Generate samples of everything');
    console.log('');
    console.log('EXAMPLES:');
    console.log('  node TestData_Generators.js patients 5');
    console.log('  node TestData_Generators.js leads 10');
    console.log('  node TestData_Generators.js all');
    console.log('');
    console.log('Generating sample data (5 of each type):');
    console.log('');

    // Generate samples
    console.log('PATIENTS:');
    console.log(JSON.stringify(generateBatch('patients', 5), null, 2));
    console.log('');

    console.log('LEADS:');
    console.log(JSON.stringify(generateBatch('leads', 5), null, 2));
    console.log('');

    console.log('APPOINTMENTS:');
    console.log(JSON.stringify(generateBatch('appointments', 3), null, 2));
    console.log('');

    console.log('PAYMENTS:');
    console.log(JSON.stringify(generateBatch('payments', 3), null, 2));

  } else {
    // Arguments provided
    const type = args[0].toLowerCase();
    const count = args[1] ? parseInt(args[1]) : 10;

    if (type === 'all') {
      console.log('Generating comprehensive test data set:');
      console.log('');
      console.log('PATIENTS:');
      console.log(JSON.stringify(generateBatch('patients', count), null, 2));
      console.log('');
      console.log('LEADS:');
      console.log(JSON.stringify(generateBatch('leads', count), null, 2));
      console.log('');
      console.log('APPOINTMENTS:');
      console.log(JSON.stringify(generateBatch('appointments', Math.ceil(count / 2)), null, 2));
      console.log('');
      console.log('PAYMENTS:');
      console.log(JSON.stringify(generateBatch('payments', Math.ceil(count / 2)), null, 2));
    } else if (['patients', 'leads', 'appointments', 'payments'].includes(type)) {
      const data = generateBatch(type, count);
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error(`ERROR: Unknown type "${type}"`);
      console.error('Valid types: patients, leads, appointments, payments, all');
      process.exit(1);
    }
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('✅ Data generation complete!');
  console.log('Copy the JSON output above and use it in your tests.');
  console.log('='.repeat(80));
}

// ============================================================================
// RUN THE SCRIPT
// ============================================================================

// Only run if this file is executed directly (not imported as a module)
if (require.main === module) {
  main();
}

// Export functions for use in other scripts
module.exports = {
  generatePatient,
  generateLead,
  generateAppointment,
  generatePayment,
  generateBatch
};

/**
 * =============================================================================
 * BEGINNER'S GUIDE TO USING THIS SCRIPT
 * =============================================================================
 *
 * STEP 1: Install Node.js
 * -----------------------
 * - Go to https://nodejs.org
 * - Download the "LTS" (Long Term Support) version
 * - Run the installer
 * - Click "Next" through all the prompts
 * - Restart your computer
 *
 * STEP 2: Verify Installation
 * ---------------------------
 * - Open terminal/command prompt
 * - Type: node --version
 * - You should see something like "v18.17.0"
 * - If you see an error, Node.js didn't install correctly
 *
 * STEP 3: Save This File
 * ----------------------
 * - Save this file as "TestData_Generators.js"
 * - Put it in a folder you can find easily (like your Desktop)
 *
 * STEP 4: Run the Script
 * ----------------------
 * - Open terminal/command prompt
 * - Type: cd Desktop (or wherever you saved the file)
 * - Type: node TestData_Generators.js
 * - You'll see generated test data!
 *
 * STEP 5: Generate Specific Data
 * -------------------------------
 * - To generate 20 patients: node TestData_Generators.js patients 20
 * - To generate 50 leads: node TestData_Generators.js leads 50
 * - To generate everything: node TestData_Generators.js all
 *
 * STEP 6: Copy the Output
 * -----------------------
 * - Select the JSON output in your terminal
 * - Copy it (Ctrl+C on Windows, Cmd+C on Mac)
 * - Paste it into your test files or n8n workflows
 *
 * TIPS:
 * -----
 * - All data is completely fake and safe to use
 * - Phone numbers start with +1555 (reserved for testing)
 * - Email addresses end in "@example.com" (safe test domain)
 * - All IDs start with "TEST-" for easy identification
 * - Run the script as many times as you want - it's free!
 *
 * TROUBLESHOOTING:
 * ----------------
 * Problem: "node: command not found"
 * Solution: Node.js isn't installed. Go back to Step 1.
 *
 * Problem: "Cannot find module..."
 * Solution: Make sure you're in the correct folder. Use "cd" to navigate.
 *
 * Problem: Output is too long to read
 * Solution: Save to a file: node TestData_Generators.js patients 100 > output.json
 *
 * =============================================================================
 */
