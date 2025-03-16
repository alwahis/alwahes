# Alwahes (عالواهس) - Ride-Sharing Platform

Alwahes is an Arabic ride-sharing platform for Iraqi cities. It's built with React, Vite, and Material-UI with RTL (right-to-left) support. The platform uses Airtable as its backend database.

## Features

- **Publish Rides**: Drivers can publish their rides with details like starting city, destination, date, time, price, and contact information.
- **Search for Rides**: Users can search for rides based on starting and destination cities.
- **Request Rides**: Users can request rides if they can't find a suitable existing ride.
- **My Rides**: Users can view their published rides and requests using their WhatsApp number.
- **Matching Requests**: Drivers can find ride requests that match their route.

## Technology Stack

- **Frontend**: React.js with Vite
- **UI Framework**: Material-UI with RTL support
- **Backend**: Airtable API
- **Styling**: Custom theme with orange color palette
- **Fonts**: Cairo font for Arabic text support

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Airtable credentials:
   ```
   VITE_AIRTABLE_API_KEY=your_airtable_api_key
   VITE_AIRTABLE_BASE_ID=your_airtable_base_id
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Airtable Structure

The application uses the following tables in Airtable:

1. **Published Rides**: Stores information about rides published by drivers
2. **Ride Requests**: Stores information about ride requests from users

## Recent Updates

- Removed image upload functionality to simplify the application
- Improved error handling and logging
- Enhanced search functionality with better matching algorithms
- Added RTL support for Arabic text

## License

This project is licensed under the MIT License.
