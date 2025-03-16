import Airtable from 'airtable';
import moment from 'moment';

// Check if environment variables are loaded
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  throw new Error('Missing required environment variables');
}

// Configure Airtable
Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
  endpointUrl: 'https://api.airtable.com',
});

export const base = Airtable.base(AIRTABLE_BASE_ID);

// Log the table names we're trying to access
// Initialize tables

export const publishedRidesTable = base('Published Rides');
export const rideRequestsTable = base('Ride Requests');

export async function getTableSchema() {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${import.meta.env.VITE_AIRTABLE_BASE_ID}/tables`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch schema');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching schema:', error);
    throw error;
  }
}

const handleAirtableError = (error) => {
  console.error('Airtable error:', {
    message: error.message,
    type: error.type,
    statusCode: error.statusCode,
    error: error
  });

  let arabicMessage = 'حدث خطأ. يرجى المحاولة مرة أخرى.';

  if (error.message.includes('Unknown field name')) {
    const fieldName = error.message.split('"')[1];
    arabicMessage = `خطأ في أسماء الحقول: ${fieldName}`;
    console.error('Field name error:', fieldName);
  } else if (error.message.includes('INVALID_PERMISSIONS_ERROR')) {
    arabicMessage = 'خطأ في الصلاحيات. يرجى التحقق من مفتاح API.';
  } else if (error.message.includes('AUTHENTICATION_REQUIRED')) {
    arabicMessage = 'خطأ في المصادقة. يرجى التحقق من مفتاح API.';
  }

  throw new Error(arabicMessage);
};

const formatLongText = (value) => {
  if (value === null || value === undefined) return '';
  return value.toString().trim();
};

const formatWhatsAppNumber = (number) => {
  // Remove any non-digit characters
  let cleaned = number.replace(/\D/g, '');
  
  // Remove any country code if present (964 or 00964)
  cleaned = cleaned.replace(/^(00964|964)/, '');
  
  // Remove leading zero if present
  cleaned = cleaned.replace(/^0/, '');
  
  // Format phone number for consistency
  
  return cleaned;
};

export async function createRide(rideData) {
  try {
    // Validate required fields
    const requiredFields = [
      'Name of Driver',
      'Starting city',
      'Destination city',
      'Date',
      'Time',
      'Seats Available',
      'Price per Seat',
      'WhatsApp Number'
    ];

    for (const field of requiredFields) {
      if (!rideData[field]) {
        throw new Error(`الحقل ${field} مطلوب`);
      }
    }
    
    // Image upload feature has been removed
    // Remove any image fields if they exist
    delete rideData['image'];
    delete rideData['imageUrl'];
    delete rideData['imageAttachment'];

    const requestBody = {
      records: [
        {
          fields: {
            'Name of Driver': rideData['Name of Driver'],
            'Starting city': rideData['Starting city'],
            'starting area': rideData['starting area'] || '',
            'Destination city': rideData['Destination city'],
            'destination area': rideData['destination area'] || '',
            'Date': rideData['Date'],
            'Time': rideData['Time'],
            'Seats Available': rideData['Seats Available'],
            'Price per Seat': rideData['Price per Seat'],
            'WhatsApp Number': rideData['WhatsApp Number'],
            'Description': rideData['Description'] || '',
            'Car Type': rideData['Car Type'] || '',
          },
        },
      ],
    };
    
    // Image attachment feature has been removed
    
    console.log('Creating ride with request body:', JSON.stringify(requestBody, null, 2));
    
    // Log the exact table name and API key (with partial masking for security)
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    const maskedApiKey = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5);
    console.log(`Using Airtable Base ID: ${baseId}, API Key: ${maskedApiKey}`);
    
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/Published Rides`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      }
    );
    
    console.log('Airtable response status:', response.status);

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Airtable error response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      if (responseData.error) {
        throw new Error(responseData.error.message || 'Unknown Airtable error');
      } else {
        throw new Error('Failed to create ride');
      }
    }

    return responseData.records[0];
  } catch (error) {
    console.error('Error creating ride:', error);
    throw error;
  }
}

async function listAllRides() {
  try {
    const url = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Published Rides`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rides');
    }

    const data = await response.json();
    console.log('All rides in Airtable:', data.records);
    return data.records;
  } catch (error) {
    console.error('Error listing rides:', error);
    throw error;
  }
}

export async function searchRides({ startingCity, destinationCity }) {
  try {
    console.log('searchRides called with:', { startingCity, destinationCity });
    
    if (!startingCity || !destinationCity) {
      console.log('Missing required parameters');
      throw new Error('مدينة الانطلاق والوصول مطلوبة للبحث');
    }

    // Search for published rides with exact match
    
    // Use a simpler approach similar to getMatchingRideRequests but without date filtering
    // This formula will match exact city names
    const exactMatchFormula = `AND(
      {Starting city} = '${startingCity}',
      {Destination city} = '${destinationCity}',
      NOT({Cancelled})
    )`;
    
    // Apply the filter formula
    
    // First try with exact match
    let records = await publishedRidesTable.select({
      filterByFormula: exactMatchFormula,
      sort: [{ field: 'Created', direction: 'desc' }]
    }).all();
    
    console.log('DEBUG: Exact match results count:', records.length);
    
    // If no exact matches, try getting all rides and filter manually
    if (records.length === 0) {
      console.log('DEBUG: No exact matches found, trying to get all rides and filter manually');
      
      // Get all non-cancelled rides
      const allRides = await publishedRidesTable.select({
        filterByFormula: 'NOT({Cancelled})',
        sort: [{ field: 'Created', direction: 'desc' }]
      }).all();
      
      console.log('DEBUG: Total published rides found:', allRides.length);
      
      // Log all rides for debugging
      allRides.forEach(record => {
        console.log('DEBUG: Ride in database:', {
          id: record.id,
          from: record.fields['Starting city'],
          to: record.fields['Destination city'],
          date: record.fields['Date']
        });
      });
      
      // Normalize function for Arabic text comparison
      const normalizeArabic = (text) => {
        if (!text) return '';
        return text.toLowerCase()
          .trim()
          .normalize('NFD')
          .replace(/[\u064B-\u065F]/g, ''); // Remove Arabic diacritics
      };
      
      // Normalize input cities
      const normalizedInputStart = normalizeArabic(startingCity);
      const normalizedInputDest = normalizeArabic(destinationCity);
      
      console.log('DEBUG: Normalized input cities:', { normalizedInputStart, normalizedInputDest });
      
      // Filter rides manually with normalized text comparison
      records = allRides.filter(record => {
        const recordStartCity = record.fields['Starting city'] || '';
        const recordDestCity = record.fields['Destination city'] || '';
        
        // Normalize record cities
        const normalizedRecordStart = normalizeArabic(recordStartCity);
        const normalizedRecordDest = normalizeArabic(recordDestCity);
        
        console.log('DEBUG: Comparing normalized cities:', {
          normalizedRecordStart,
          normalizedRecordDest,
          normalizedInputStart,
          normalizedInputDest,
          startMatches: normalizedRecordStart === normalizedInputStart,
          destMatches: normalizedRecordDest === normalizedInputDest
        });
        
        // Check for exact matches with normalized text
        return normalizedRecordStart === normalizedInputStart && 
               normalizedRecordDest === normalizedInputDest;
      });
      
      console.log('DEBUG: Normalized matching results count:', records.length);
      
      // If still no matches, try partial matching as a last resort
      if (records.length === 0) {
        console.log('DEBUG: No normalized matches found, trying partial matching');
        
        records = allRides.filter(record => {
          const recordStartCity = normalizeArabic(record.fields['Starting city'] || '');
          const recordDestCity = normalizeArabic(record.fields['Destination city'] || '');
          
          // Check for partial matches
          const startMatches = recordStartCity.includes(normalizedInputStart) || 
                              normalizedInputStart.includes(recordStartCity);
                              
          const destMatches = recordDestCity.includes(normalizedInputDest) || 
                             normalizedInputDest.includes(recordDestCity);
          
          return startMatches && destMatches;
        });
        
        console.log('DEBUG: Partial matching results count:', records.length);
      }
    }
    
    if (records.length > 0) {
      console.log('DEBUG: First matching ride:', records[0].fields);
    } else {
      console.log('DEBUG: No rides found for this route');
    }
    
    return records;
  } catch (error) {
    console.error('Error searching rides:', error);
    // Return empty array instead of throwing error
    return [];
  }
}

export async function createRideRequest({
  name,
  startingCity,
  startingArea,
  destinationCity,
  destinationArea,
  date,
  seats,
  whatsappNumber,
  note,
}) {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Ride Requests`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                'Name': name,
                'Starting city': startingCity,
                'starting area': startingArea,
                'Destination city': destinationCity,
                'destination area': destinationArea,
                'Date': moment(date, ['YYYY/MM/DD', 'YYYY-MM-DD'], true).isValid() 
                  ? moment(date, ['YYYY/MM/DD', 'YYYY-MM-DD'], true).format('YYYY-MM-DD')
                  : date,
                'Seats': seats.toString(),
                'WhatsApp Number': formatWhatsAppNumber(whatsappNumber),
                'Note': note || '',
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    const result = await response.json();
    return result.records[0];
  } catch (error) {
    console.error('Error creating ride request:', error);
    throw error;
  }
}

export async function getMatchingRideRequests(from, to, date) {
  try {
    if (!from || !to || !date) {
      console.error('Missing required parameters:', { from, to, date });
      throw new Error('بيانات البحث غير مكتملة');
    }

    // Ensure date is in the correct format for Airtable
    let formattedDate = date;
    if (date) {
      // Try to parse the date with moment
      const momentDate = moment(date, ['YYYY/MM/DD', 'YYYY-MM-DD'], true);
      if (momentDate.isValid()) {
        formattedDate = momentDate.format('YYYY-MM-DD');
      }
    }

    console.log('Searching for matching requests with:', { from, to, date: formattedDate });
    
    // Get all active ride requests for the same date, from, and to
    const formula = `AND(
      {Starting city} = '${from}',
      {Destination city} = '${to}',
      {Date} = '${formattedDate}'
    )`;
    
    console.log('Filter formula:', formula);

    const records = await rideRequestsTable.select({
      filterByFormula: formula,
      maxRecords: 100,
      view: "Grid view"
    }).all();
    
    console.log('Raw records:', records);
    console.log('Found matching requests:', records.length);
    
    const mappedRecords = records.map(record => ({
      id: record.id,
      fields: {
        ...record.fields,
        'Starting city': record.fields['Starting city'] || '',
        'Destination city': record.fields['Destination city'] || '',
        'Date': record.fields['Date'] || '',
        'Name': record.fields['Name'] || '',
        'WhatsApp Number': record.fields['WhatsApp Number'] || '',
        'Seats': record.fields['Seats'] || '',
        'Note': record.fields['Note'] || ''
      }
    }));

    console.log('Mapped records:', mappedRecords);
    return mappedRecords;
  } catch (error) {
    console.error('Error in getMatchingRideRequests:', error);
    throw error;
  }
}

export const getAllRideRequests = async () => {
  try {
    console.log('Fetching all ride requests...');
    
    // First verify the table exists and is accessible
    const tables = await base.tables();
    const rideRequestsTable = tables.find(table => table.name === 'Ride Requests');
    
    if (!rideRequestsTable) {
      console.error('Ride Requests table not found');
      throw new Error('جدول طلبات الرحلات غير موجود');
    }

    console.log('Found Ride Requests table, fetching records...');
    
    const response = await base('Ride Requests').select({
      view: 'Grid view',
      sort: [{ field: 'Date', direction: 'desc' }]
    }).all();

    console.log('Fetched records:', response.length);

    const mappedRequests = response.map(record => {
      console.log('Processing record:', record.id, record.fields);
      return {
        id: record.id,
        startingCity: record.fields['Starting city'] || '',
        destinationCity: record.fields['Destination city'] || '',
        date: record.fields['Date'],
      };
    });

    console.log('Mapped requests:', mappedRequests);
    return mappedRequests;
  } catch (error) {
    console.error('Error fetching ride requests:', {
      message: error.message,
      type: error.type,
      statusCode: error.statusCode,
      error: error
    });
    
    if (error.message.includes('AUTHENTICATION_REQUIRED')) {
      throw new Error('خطأ في المصادقة. يرجى التحقق من مفتاح API');
    } else if (error.message.includes('INVALID_PERMISSIONS_ERROR')) {
      throw new Error('خطأ في الصلاحيات. يرجى التحقق من مفتاح API');
    } else if (error.message.includes('NOT_FOUND')) {
      throw new Error('جدول طلبات الرحلات غير موجود');
    }
    
    throw new Error('حدث خطأ أثناء تحميل طلبات الرحلات. يرجى المحاولة مرة أخرى');
  }
};

export async function searchRideRequests({ startingCity, destinationCity, date }) {
  try {
    // Ensure date is in the correct format (YYYY-MM-DD)
    const formattedDate = moment(date, ['YYYY/MM/DD', 'YYYY-MM-DD'], true).isValid()
      ? moment(date, ['YYYY/MM/DD', 'YYYY-MM-DD'], true).format('YYYY-MM-DD')
      : date;
    
    // Clean up city names
    const cleanStartingCity = startingCity.trim().toLowerCase();
    const cleanDestinationCity = destinationCity.trim().toLowerCase();
    
    // Build filter formula
    const filterByFormula = `AND(
      LOWER({Starting city}) = "${cleanStartingCity}",
      LOWER({Destination city}) = "${cleanDestinationCity}",
      {Date} = "${formattedDate}",
      OR(
        {Status} = '',
        {Status} = 'active',
        {Status} = BLANK()
      )
    )`.replace(/\s+/g, ' ').trim();

    const url = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Ride Requests?filterByFormula=${encodeURIComponent(filterByFormula)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message || 'حدث خطأ في البحث عن الطلبات');
    }

    const data = await response.json();
    return data.records;
  } catch (error) {
    console.error('Error searching ride requests:', error);
    throw error;
  }
}

export async function cancelRide(rideId) {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Published Rides/${rideId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
        },
        body: JSON.stringify({
          fields: {
            'Cancelled': true
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Airtable error response:', error);
      throw new Error(error.error.message || 'Failed to cancel ride');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling ride:', error);
    throw new Error('حدث خطأ في إلغاء الرحلة');
  }
}

export async function cancelRideRequest(requestId) {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Ride Requests/${requestId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
        },
        body: JSON.stringify({
          fields: {
            'Cancelled': true
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Airtable error:', error);
      throw new Error(error.error.message || 'Failed to cancel ride request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling ride request:', error);
    throw new Error('حدث خطأ في إلغاء طلب الرحلة');
  }
}

export async function getDriverRidesAndRequests(whatsappNumber) {
  try {
    const formattedNumber = formatWhatsAppNumber(whatsappNumber);
    console.log('Searching for rides with number:', formattedNumber);
    
    // First get all rides for this driver - using OR to match with or without country code
    const formula = `OR(
      {WhatsApp Number} = '${formattedNumber}',
      {WhatsApp Number} = '0${formattedNumber}',
      {WhatsApp Number} = '964${formattedNumber}'
    )`;
    console.log('Filter formula:', formula);
    
    const rides = await publishedRidesTable
      .select({
        filterByFormula: formula
      })
      .all();
    
    console.log('Found rides:', rides);

    // Then get all ride requests for this driver
    const requests = await rideRequestsTable
      .select({
        filterByFormula: formula
      })
      .all();
    
    console.log('Found requests:', requests);

    return {
      rides,
      requests
    };
  } catch (error) {
    console.error('Error fetching driver rides and requests:', error);
    throw error;
  }
}
