console.log('Checking cities in Airtable:'); listAllRides().then(rides => { rides.forEach(ride => console.log('Ride:', ride.fields['Starting city'], 'to', ride.fields['Destination city'])); });
