// Assuming this code is part of a content script in a browser extension


app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});


let port;

function connectToExtension() {
    port = chrome.runtime.connect({ name: "csvUploadPort" });
    
    port.onDisconnect.addListener(() => {
        console.log("Port disconnected. Attempting to reconnect...");
        connectToExtension();
    });

    port.onMessage.addListener((message) => {
        if (message.type === 'uploadStatus') {
            document.getElementById('uploadStatus').textContent = message.content;
        }
    });
}

connectToExtension();

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please choose a file!');
        return;
    }
    if (!file.name.endsWith('.csv')) {
        alert('Please upload a CSV file!');
        return;
    }
    readAndUploadFile(file);
});

function readAndUploadFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const csvContent = e.target.result;
        uploadFile(csvContent);
    };
    reader.readAsText(file);
}

function uploadFile(csvContent) {
    if (port && port.disconnect) {
        try {
            port.postMessage({ type: 'uploadCSV', content: csvContent });
        } catch (error) {
            console.error('Error sending message:', error);
            document.getElementById('uploadStatus').textContent = 'Error uploading file. Please try again.';
            connectToExtension(); // Attempt to reconnect
        }
    } else {
        console.log('Port not available. Attempting to reconnect...');
        connectToExtension();
        setTimeout(() => uploadFile(csvContent), 1000); // Retry after a short delay
    }
}

// This function would be in your background script
function handleUpload(csvContent) {
    // Simulating an asynchronous upload process
    setTimeout(() => {
        parseCSV(csvContent);
        // Send a message back to the content script
        if (port && port.postMessage) {
            try {
                port.postMessage({ type: 'uploadStatus', content: 'File uploaded and parsed successfully!' });
            } catch (error) {
                console.error('Error sending response:', error);
            }
        }
    }, 2000);
}

function parseCSV(csvContent) {
    const rows = csvContent.split('\n');
    const headers = rows[0].split(',');
    const data = [];

    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        if (values.length === headers.length) {
            const entry = {};
            headers.forEach((header, index) => {
                entry[header.trim()] = values[index].trim();
            });
            data.push(entry);
        }
    }

    console.log('Parsed CSV data:', data);
    // You can now use the 'data' array for further processing or display
}