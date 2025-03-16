// This script tests the date format handling in the application

// Function to test date format parsing
function testDateFormats() {
  console.log('=== Testing Date Format Handling ===');
  
  // Import moment
  const moment = window.moment;
  
  if (!moment) {
    console.error('Moment.js is not available in the global scope');
    return;
  }
  
  // Test different date formats
  const testDates = [
    '2025-03-16',  // ISO format (YYYY-MM-DD)
    '2025/03/16',  // Slash format (YYYY/MM/DD)
    '16/03/2025',  // European format (DD/MM/YYYY)
    '03/16/2025',  // US format (MM/DD/YYYY)
    '2025.03.16',  // Dot format (YYYY.MM.DD)
    '16-03-2025',  // Dash format (DD-MM-YYYY)
    '16 Mar 2025', // Text format
  ];
  
  console.log('Testing date formats with moment.js:');
  
  testDates.forEach(date => {
    // Test with default parsing
    const defaultParsed = moment(date);
    
    // Test with strict parsing and specific formats
    const strictISO = moment(date, 'YYYY-MM-DD', true);
    const strictSlash = moment(date, 'YYYY/MM/DD', true);
    const strictMulti = moment(date, ['YYYY-MM-DD', 'YYYY/MM/DD'], true);
    
    console.log(`\nDate string: "${date}"`);
    console.log(`Default parsing valid: ${defaultParsed.isValid()}`);
    console.log(`Default parsed date: ${defaultParsed.format('YYYY-MM-DD')}`);
    console.log(`Strict ISO valid: ${strictISO.isValid()}`);
    console.log(`Strict slash valid: ${strictSlash.isValid()}`);
    console.log(`Multi-format valid: ${strictMulti.isValid()}`);
    
    if (strictMulti.isValid()) {
      console.log(`Multi-format parsed: ${strictMulti.format('YYYY-MM-DD')}`);
    }
  });
  
  // Test our application's format function
  console.log('\nTesting our application date formatting:');
  
  // Recreate the formatDate function from PublishRide.jsx
  const formatDate = (date) => {
    if (!date) return '';
    // Use ISO format (YYYY-MM-DD) which is recognized by moment.js without warnings
    const momentDate = moment(date);
    return momentDate.isValid() ? momentDate.format('YYYY-MM-DD') : '';
  };
  
  // Test with our formatDate function
  testDates.forEach(date => {
    console.log(`Date string: "${date}" → Formatted: "${formatDate(date)}"`);
  });
}

// Function to test the Airtable date handling
function testAirtableDateHandling() {
  console.log('\n=== Testing Airtable Date Handling ===');
  
  // Simulate the date handling in getMatchingRideRequests
  function formatDateForAirtable(date) {
    // Ensure date is in the correct format for Airtable
    let formattedDate = date;
    if (date) {
      // Try to parse the date with moment
      const moment = window.moment;
      const momentDate = moment(date, ['YYYY/MM/DD', 'YYYY-MM-DD'], true);
      if (momentDate.isValid()) {
        formattedDate = momentDate.format('YYYY-MM-DD');
      }
    }
    return formattedDate;
  }
  
  // Test dates
  const testDates = [
    '2025-03-16',  // ISO format (YYYY-MM-DD)
    '2025/03/16',  // Slash format (YYYY/MM/DD)
    '16/03/2025',  // European format (DD/MM/YYYY)
    '03/16/2025',  // US format (MM/DD/YYYY)
  ];
  
  testDates.forEach(date => {
    console.log(`Date string: "${date}" → Airtable formatted: "${formatDateForAirtable(date)}"`);
  });
  
  // Simulate the Airtable formula
  function createAirtableFormula(from, to, date) {
    const formattedDate = formatDateForAirtable(date);
    
    const formula = `AND(
      {Starting city} = '${from}',
      {Destination city} = '${to}',
      {Date} = '${formattedDate}'
    )`;
    
    return formula;
  }
  
  // Test formula creation
  const from = 'Baghdad';
  const to = 'Erbil';
  
  testDates.forEach(date => {
    console.log(`\nAirtable formula for ${from} to ${to} on ${date}:`);
    console.log(createAirtableFormula(from, to, date));
  });
}

// Run the tests
function runTests() {
  console.log('=== Date Format Tests ===');
  testDateFormats();
  testAirtableDateHandling();
  console.log('\nTests completed!');
}

// Export the test function to the global scope
window.runDateFormatTests = runTests;

// Instructions
console.log(`
=== Date Format Test Script ===

To test the date format handling:

1. Open your browser console (F12 or right-click -> Inspect -> Console)
2. Run the tests by typing:
   runDateFormatTests();

This will test how different date formats are handled in the application.
`);
