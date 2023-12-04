

document.addEventListener('DOMContentLoaded', function () {
    // Remove any existing event listeners before adding a new one
    database.ref('requests').off('value');

    // Add a new event listener
    loadRequestsFromFirebase();
});


function submitRequest() {
    // Generate a unique request ID using uuid
    const requestId = uuidv4();

    const apartmentNumber = document.getElementById('apartmentNumber').value;
    const area = document.getElementById('area').value;
    const description = document.getElementById('description').value;
    const photo = document.getElementById('photo').files[0];
    
    // Set date and time to the current date and time
    const dateTime = new Date();

    // Store the request in Firebase
    storeRequestInFirebase(requestId, apartmentNumber, area, description, photo, 'pending', dateTime);

    // Clear the form fields
    clearFormFields();
}

function loadRequestsFromFirebase() {
    // Listen for changes in the 'requests' node in Firebase
    database.ref('requests').on('value', function (snapshot) {
        // Get the data from the snapshot
        const requestsData = snapshot.val();

        // Update the UI with the requests
        if (requestsData) {
            Object.values(requestsData).forEach(request => updateUI(request));
        }
    });
}
function storeRequestInFirebase(requestId, apartmentNumber, area, description, photo, status, dateTime) {
    // Check if a photo is provided
    const photoUrl = photo ? URL.createObjectURL(photo) : null;

    const newRequest = {
        id: requestId,
        apartmentNumber: apartmentNumber,
        area: area,
        description: description,
        photo: photoUrl,
        status: status,
        date_time: dateTime.toISOString()
    };

    console.log("Adding request to Firebase:", newRequest);

    // Push the new request to the 'requests' node in Firebase
    database.ref('requests').push(newRequest);
}

function clearFormFields() {
    // Clear form fields after submitting a request
    document.getElementById('requestId').value = '';
    document.getElementById('apartmentNumber').value = '';
    document.getElementById('area').value = '';
    document.getElementById('description').value = '';
    document.getElementById('photo').value = '';
    document.getElementById('dateTime').value = '';
}

// Add a function to load all maintenance requests with filters
function loadRequestsFromFirebaseWithFilters(apartmentNumberFilter, areaFilter, startDate, endDate, statusFilter) {
    // Reference to the 'requests' node in Firebase
    const requestsRef = database.ref('requests');

    // Start building the query
    let query = requestsRef.orderByChild('date_time');

    // Apply filters if provided
    if (apartmentNumberFilter) {
        query = query.equalTo(apartmentNumberFilter, 'apartmentNumber');
    }

    if (areaFilter) {
        query = query.equalTo(areaFilter, 'area');
    }

    if (startDate) {
        query = query.startAt(startDate);
    }

    if (endDate) {
        query = query.endAt(endDate);
    }

    if (statusFilter) {
        query = query.equalTo(statusFilter, 'status');
    }

    // Listen for changes in the query
    query.on('value', function (snapshot) {
        // Get the data from the snapshot
        const requestsData = snapshot.val();

        // Update the UI with the filtered requests
        if (requestsData) {
            document.getElementById('requestsList').innerHTML = ''; // Clear existing list

            Object.entries(requestsData).forEach(([key, request]) => updateUI(key, request));
        }
    });
}

// Add a function to update the status of a request
function updateRequestStatus(requestId, newStatus) {
    // Reference to the specific request in Firebase
    const requestRef = database.ref('requests').child(requestId);

    // Update the status
    requestRef.update({ status: newStatus });
}

// Modify the updateUI function to include status update button
function updateUI(requestId, request) {
    const requestsList = document.getElementById('requestsList');
    const li = document.createElement('li');
    li.innerHTML = `
        <div>
            <strong>Request ID: ${requestId}</strong>
            <p>Apartment ${request.apartmentNumber}</p>
            <p>Area: ${request.area}</p>
            <p>Description: ${request.description}</p>
            <p>Status: ${request.status}</p>
            <p>Date and Time: ${new Date(request.date_time).toLocaleString()}</p>
            <button onclick="updateStatus('${requestId}')">Update Status</button>
        </div>
        ${request.photo ? `<img src="${request.photo}" alt="Request Photo" style="max-width: 100px;">` : ''}
    `;

    if (request.status === 'completed') {
        li.classList.add('completed');
    }

    requestsList.appendChild(li);
}

// Add a function to handle the status update button click
function updateStatus(requestId) {
    const newStatus = prompt('Enter the new status (e.g., completed):');
    if (newStatus) {
        updateRequestStatus(requestId, newStatus.toLowerCase());
    }
}

// Example of using filters (you can customize these based on user input)
const apartmentNumberFilter = 2;
const areaFilter = 'kitchen';
const startDate = '2023-12-01';
const endDate = '2023-12-10';
const statusFilter = 'pending';

// Load requests with filters
loadRequestsFromFirebaseWithFilters(apartmentNumberFilter, areaFilter, startDate, endDate, statusFilter);
