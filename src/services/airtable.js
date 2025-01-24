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
    console.log('Creating ride with data:', rideData);
    const requestBody = {
      records: [
        {
          fields: {
            'ID': '',
            'Name of Driver': rideData.name,
            'Starting city': rideData.from,
            'starting area': rideData.fromArea,
            'Destination city': rideData.to,
            'destination area': rideData.toArea,
            'Date': rideData.date,
            'Time': rideData.time,
            'Seats Available': rideData.seats.toString(),
            'Price per Seat': rideData.price.toString(),
            'WhatsApp Number': formatWhatsAppNumber(rideData.whatsappNumber),
            'Description': rideData.note || '',
            'Car Type': rideData.carType || '',
          },
        },
      ],
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
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
    console.log('Airtable response:', responseData);

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
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    handleAirtableError(error);
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
    console.log('Search params:', { startingCity, destinationCity, date });
    
    // First, let's see all rides in the table
    console.log('Fetching all rides for debugging...');
    const allRides = await listAllRides();
    
    // Format the date to match Airtable's format (YYYY/MM/DD)
    const formattedDate = moment(date).format('YYYY/MM/DD');
    console.log('Formatted date:', formattedDate);
    console.log('Sample ride date from Airtable:', allRides[0]?.fields?.Date);
    
    // Build filter formula to match only cities and date
    const filterByFormula = `AND(
      LOWER({Starting city}) = LOWER('${startingCity}'),
      LOWER({Destination city}) = LOWER('${destinationCity}'),
      {Date} = '${formattedDate}'
    )`.replace(/\s+/g, ' ').trim();

    console.log('Filter formula:', filterByFormula);

    const url = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Published Rides?filterByFormula=${encodeURIComponent(filterByFormula)}`;
    
    console.log('Request URL:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Airtable error response:', error);
      throw new Error(error.error.message);
    }

    const data = await response.json();
    console.log('Airtable search response:', data);

    return data.records;
  } catch (error) {
    console.error('Error searching rides:', error);
    throw error;
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
    const formattedDate = moment(date).format('YYYY/MM/DD');
    
    let filterByFormula = `AND(
      {Starting city} = '${from}',
      {Destination city} = '${to}',
      {Date} = '${formattedDate}'
    )`;

    const response = await base('Ride Requests').select({
      filterByFormula,
      sort: [{ field: 'Date', direction: 'asc' }],
    }).all();

    return response;
  } catch (error) {
    console.error('Error getting matching requests:', error);
    throw new Error('حدث خطأ أثناء تحميل طلبات الرحلات المطابقة');
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

export async function deleteRide(rideId) {
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
            'Deleted': true
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return true;
  } catch (error) {
    console.error('Error deleting ride:', error);
    throw new Error('فشل في حذف الرحلة');
  }
}

export async function deleteRideRequest(requestId) {
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
            'Deleted': true
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return true;
  } catch (error) {
    console.error('Error deleting ride request:', error);
    throw new Error('فشل في حذف طلب الرحلة');
  }
}
