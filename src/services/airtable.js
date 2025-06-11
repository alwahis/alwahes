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

    // Prepare the fields object
    const fields = {
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
      'Car Type': rideData['Car Type'] || ''
      // Removed 'Status' field as it's causing 422 error
      // Add it back if you've created the column in Airtable
    };

    // Handle image upload if provided
    if (rideData['image'] && rideData['image'].length > 0) {
      const imageData = rideData['image'][0];
      fields['image'] = [{
        url: imageData.url,
        filename: `car-${Date.now()}.jpg`
      }];
    }

    const requestBody = {
      records: [{ fields }]
    };

    console.log('Creating ride with request body:', JSON.stringify(requestBody, null, 2));
    
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    
    console.log('Sending request to Airtable...');
    console.log('Endpoint:', `https://api.airtable.com/v0/${baseId}/Published%20Rides`);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/Published%20Rides`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'فشل في إنشاء الرحلة';
      try {
        const errorData = await response.json();
        console.error('Airtable error details:', errorData);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const responseData = await response.json();
    console.log('Airtable response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error creating ride:', error);
    if (error.message.includes('Failed to fetch')) {
        throw new Error('تعذر الاتصال بخادم Airtable. يرجى التحقق من اتصالك بالإنترنت.');
      }
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

// Helper function to escape single quotes for Airtable formulas
const escapeSingleQuotes = (str) => (str || '').replace(/'/g, "\\'");

export async function searchRides({ startingCity, destinationCity, date }) {
  try {
    console.log('=== STARTING SEARCH RIDES ===');
    
    if (!startingCity || !destinationCity) {
      console.error('Missing required fields - startingCity:', startingCity, 'destinationCity:', destinationCity);
      throw new Error('مدينة الانطلاق والوصول مطلوبة للبحث');
    }

    console.log('Searching for rides with params:', { 
      startingCity, 
      destinationCity, 
      date,
      dateType: date ? typeof date : 'no date provided'
    });
    
    // Format the date to match Airtable's format (YYYY-MM-DD)
    let formattedDate = '';
    if (date) {
      console.log('Processing date input:', date);
      const momentDate = moment(date, ['YYYY/MM/DD', 'YYYY-MM-DD'], true);
      if (!momentDate.isValid()) {
        console.error('Invalid date format:', date);
        throw new Error('صيغة التاريخ غير صالحة');
      }
      formattedDate = momentDate.format('YYYY-MM-DD');
      console.log('Formatted date:', formattedDate);
    }
    
    // Create Airtable filter formula
    let filterFormula = `AND(
      TRIM(LOWER({Starting city})) = '${escapeSingleQuotes(startingCity).toLowerCase().trim()}',
      TRIM(LOWER({Destination city})) = '${escapeSingleQuotes(destinationCity).toLowerCase().trim()}',
      NOT({Cancelled})`;
    
    if (formattedDate) {
      filterFormula += `, {Date} = '${formattedDate}'`;
    }
    
    filterFormula += ')'
    
    console.log('Using Airtable filter formula:', filterFormula);
    
    // Query Airtable with the filter
    const query = {
      filterByFormula: filterFormula,
      sort: [{ field: 'Date', direction: 'asc' }],
      maxRecords: 100
    };
    
    console.log('Executing Airtable query:', JSON.stringify(query, null, 2));
    
    try {
      const results = await publishedRidesTable.select(query).all();
      
      console.log(`=== FOUND ${results.length} MATCHING RIDES ===`);
      results.forEach((ride, index) => {
        console.log(`Match #${index + 1}:`, {
          id: ride.id,
          from: ride.fields['Starting city'],
          to: ride.fields['Destination city'],
          date: ride.fields['Date'],
          seats: ride.fields['Seats Available']
        });
      });
      
      return results;
    } catch (error) {
      console.error('Airtable API Error:', {
        message: error.message,
        statusCode: error.statusCode,
        errorData: error.errorData
      });
      
      // Fallback to client-side filtering if the query fails
      console.log('Falling back to client-side filtering...');
      const allRides = await publishedRidesTable.select({
        filterByFormula: 'NOT({Cancelled})',
        maxRecords: 100
      }).all();
      
      const normalizedSearchFrom = startingCity.toLowerCase().trim();
      const normalizedSearchTo = destinationCity.toLowerCase().trim();
      
      const filteredRides = allRides.filter(ride => {
        if (!ride.fields) return false;
        
        const rideFrom = (ride.fields['Starting city'] || '').toLowerCase().trim();
        const rideTo = (ride.fields['Destination city'] || '').toLowerCase().trim();
        const rideDate = ride.fields['Date'] || '';
        
        const cityMatch = rideFrom === normalizedSearchFrom && 
                        rideTo === normalizedSearchTo;
        
        const dateMatch = !formattedDate || rideDate === formattedDate;
        
        return cityMatch && dateMatch;
      });
      
      console.log(`Found ${filteredRides.length} rides with client-side filtering`);
      return filteredRides;
    }
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
    console.log('createRideRequest called with:', {
      name,
      startingCity,
      startingArea,
      destinationCity,
      destinationArea,
      date,
      seats,
      whatsappNumber,
      note,
    });

    // Validate required fields
    if (!name) {
      console.error('Missing required field: name');
      throw new Error('الاسم مطلوب');
    }
    if (!startingCity) {
      console.error('Missing required field: startingCity');
      throw new Error('مدينة الانطلاق مطلوبة');
    }
    if (!destinationCity) {
      console.error('Missing required field: destinationCity');
      throw new Error('مدينة الوصول مطلوبة');
    }
    if (!date) {
      console.error('Missing required field: date');
      throw new Error('التاريخ مطلوب');
    }
    if (!seats) {
      console.error('Missing required field: seats');
      throw new Error('عدد المقاعد مطلوب');
    }
    if (!whatsappNumber) {
      console.error('Missing required field: whatsappNumber');
      throw new Error('رقم الواتساب مطلوب');
    }

    const formattedDate = moment(date, ['YYYY/MM/DD', 'YYYY-MM-DD'], true).isValid() 
      ? moment(date, ['YYYY/MM/DD', 'YYYY-MM-DD'], true).format('YYYY-MM-DD')
      : date;
    
    console.log('Formatted date:', formattedDate);
    console.log('API Key:', import.meta.env.VITE_AIRTABLE_API_KEY ? 'exists' : 'missing');
    console.log('Base ID:', import.meta.env.VITE_AIRTABLE_BASE_ID ? 'exists' : 'missing');
    
    const requestBody = {
      records: [
        {
          fields: {
            'Name': name,
            'Starting city': startingCity,
            'starting area': startingArea || '',
            'Destination city': destinationCity,
            'destination area': destinationArea || '',
            'Date': formattedDate,
            'Seats': seats.toString(),
            'WhatsApp Number': formatWhatsAppNumber(whatsappNumber),
            'Note': note || '',
          },
        },
      ],
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const apiUrl = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Ride Requests`;
    console.log('API URL:', apiUrl);
    
    const response = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Airtable API error:', error);
      throw new Error(error.error.message);
    }

    const result = await response.json();
    console.log('Airtable API success response:', result);
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
