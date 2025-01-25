import Airtable from 'airtable';
import moment from 'moment';

// Check if environment variables are loaded
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

console.log('Environment check:');
console.log('API Key exists:', !!AIRTABLE_API_KEY);
console.log('Base ID exists:', !!AIRTABLE_BASE_ID);

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  throw new Error('Missing required environment variables');
}

// Configure Airtable
Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
  endpointUrl: 'https://api.airtable.com',
});

const base = Airtable.base(AIRTABLE_BASE_ID);

// Log the table names we're trying to access
console.log('Attempting to access tables:', {
  publishedRides: 'Published Rides',
  rideRequests: 'Ride Requests'
});

const publishedRidesTable = base('Published Rides');
const rideRequestsTable = base('Ride Requests');

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
    console.log('Table schema:', data);
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
  
  console.log('Original number:', number);
  console.log('Formatted number:', cleaned);
  
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
    
    console.log('Creating ride with request body:', requestBody);
    
    const response = await fetch(
      `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Published Rides`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

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

export async function searchRides({ startingCity, destinationCity, date }) {
  try {
    if (!startingCity || !destinationCity || !date) {
      throw new Error('جميع الحقول مطلوبة للبحث');
    }

    const cleanStartingCity = startingCity.toLowerCase().trim();
    const cleanDestinationCity = destinationCity.toLowerCase().trim();

    const filterByFormula = `AND(
      LOWER({Starting city}) = "${cleanStartingCity}",
      LOWER({Destination city}) = "${cleanDestinationCity}",
      {Date} = "${date}",
      NOT({Cancelled})
    )`.replace(/\s+/g, ' ').trim();

    console.log('Filter formula:', filterByFormula);

    const url = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Published Rides?filterByFormula=${encodeURIComponent(filterByFormula)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rides');
    }

    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error searching rides:', error);
    throw new Error('حدث خطأ في البحث عن الرحلات');
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
                'Date': date,
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
    const formula = `AND(
      {Starting city} = '${from}',
      {Destination city} = '${to}',
      {Date} = '${date}',
      NOT({Cancelled})
    )`;

    const url = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Ride Requests?filterByFormula=${encodeURIComponent(formula)}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch matching ride requests');
    }

    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('Error fetching matching requests:', error);
    throw new Error('حدث خطأ في جلب الطلبات المطابقة');
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
    const formattedDate = moment(date).format('YYYY/MM/DD');
    
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
