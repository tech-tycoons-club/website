// Firebase configuration
// Replace all fields in <var> with actual values

// Open Firebase Console, In Project Overview, click settings
// Find Project ID here
const FIREBASE_PROJECT_ID = "<project-id>";
const FIREBASE_COLLECTION = ""; // Open Firestore, find the collection used for storing events

// You get your private key by going to "service accounts" inside Project settings, and downloading private key
// You can also get your project id / service account email from here
const SERVICE_ACCOUNT_EMAIL = "firebase-adminsdk-xxxxx@<project-id>.iam.gserviceaccount.com";
// You get your private key by going to "service accounts" inside Project settings, and downloading private key
const SERVICE_ACCOUNT_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n<Your Private Key Here>\n-----END PRIVATE KEY-----\n";

/**
 * Runs when the form is submitted
 */
function onFormSubmit(e) {
  // Get form response
  const formResponse = e.response;
  
  // Get all item responses
  const itemResponses = formResponse.getItemResponses();
  
  // Create an object to store the form data
  const formData = {
    submitTimeStamp: new Date()
  };
  
  // Add all form fields to the data object
  itemResponses.forEach(function(itemResponse) {
    const question = itemResponse.getItem().getTitle();
    const answer = itemResponse.getResponse();
    const itemType = itemResponse.getItem().getType();
    
    // Check if this is a file upload question
    if (itemType === FormApp.ItemType.FILE_UPLOAD) {
      // Process file uploads and get public URLs
      const fileUrls = processFileUploads(answer);
      formData[normalizeField(question)] = fileUrls;
    } else {
      formData[normalizeField(question)] = answer;
    }
  });
  
  // Process date and time fields before sending to Firebase
  const processedData = processDateTimeFields(formData);
  
  // Send data to Firebase
  sendToFirestore(processedData);
}

/**
 * Process date and time fields and combine them into dateTime fields
 * @param {Object} data - The form data object
 * @return {Object} The processed data with combined dateTime fields
 */
function processDateTimeFields(data) {
  const processedData = {...data}; // Create a copy of the original data
  const fieldsToRemove = [];
  
  // Find all date fields
  for (const key in processedData) {
    // Check if this is a date field
    if (key.toLowerCase().includes('date') && 
        !key.toLowerCase().includes('time') && 
        !key.toLowerCase().includes('datetime')) {
      
      // Look for a corresponding time field
      const dateFieldName = key;
      const dateValue = processedData[dateFieldName];
      
      // Find time fields (could be named "Time" or have same prefix as date field)
      const possibleTimeFields = [];
      
      for (const timeKey in processedData) {
        if (timeKey.toLowerCase().includes('time') && 
            !timeKey.toLowerCase().includes('date') && 
            !timeKey.toLowerCase().includes('datetime')) {
          possibleTimeFields.push(timeKey);
        }
      }
      
      // First try to match time fields with date fields based on similar name patterns
      const baseFieldName = dateFieldName.replace(/date/i, '').trim();
      let matchingTimeField = null;
      
      // Look for a time field with matching prefix/suffix
      for (const timeField of possibleTimeFields) {
        const timeBaseField = timeField.replace(/time/i, '').trim();
        if (baseFieldName === timeBaseField || 
            (baseFieldName && timeBaseField && 
             (baseFieldName.includes(timeBaseField) || timeBaseField.includes(baseFieldName)))) {
          matchingTimeField = timeField;
          break;
        }
      }
      
      // If no matching field found but we have only one time field, use that
      if (!matchingTimeField && possibleTimeFields.length === 1) {
        matchingTimeField = possibleTimeFields[0];
      }
      
      // If we found a matching time field, combine them
      if (matchingTimeField) {
        const timeValue = processedData[matchingTimeField];
        
        // Create combined dateTime field
        const dateTimeFieldName = baseFieldName ? `${baseFieldName}DateTime` : 'dateTime';
        
        // Parse and combine date and time
        try {
          let dateObj;
          
          // Handle if date is already a Date object
          if (dateValue instanceof Date) {
            dateObj = new Date(dateValue);
          } else {
            // Otherwise, parse it as a string
            dateObj = new Date(dateValue);
          }
          
          // Parse time value (assuming it's in format like "13:45" or "1:45 PM")
          if (typeof timeValue === 'string') {
            const timeParts = timeValue.match(/(\d+):(\d+)(?::(\d+))?\s*(am|pm)?/i);
            
            if (timeParts) {
              let hours = parseInt(timeParts[1], 10);
              const minutes = parseInt(timeParts[2], 10);
              const seconds = timeParts[3] ? parseInt(timeParts[3], 10) : 0;
              const ampm = timeParts[4] ? timeParts[4].toLowerCase() : null;
              
              // Adjust hours for AM/PM if present
              if (ampm === 'pm' && hours < 12) {
                hours += 12;
              } else if (ampm === 'am' && hours === 12) {
                hours = 0;
              }
              
              // Set time components on the date object
              dateObj.setHours(hours, minutes, seconds);
            }
          }
          
          // Store the combined dateTime
          processedData[dateTimeFieldName] = dateObj;
          
          // Mark original fields for removal
          fieldsToRemove.push(dateFieldName);
          fieldsToRemove.push(matchingTimeField);
        } catch (e) {
          Logger.log(`Error combining date and time: ${e.message}`);
        }
      }
    }
  }
  
  // Remove the original date and time fields
  fieldsToRemove.forEach(field => {
    delete processedData[field];
  });
  
  return processedData;
}

/**
 * Process file uploads and convert to public URLs
 * @param {Array} fileIds - Array of file IDs from form submission
 * @return {Array} Array of public URLs for the files
 */
function processFileUploads(fileIds) {
  if (!Array.isArray(fileIds)) {
    fileIds = [fileIds]; // Handle single file uploads
  }
  
  const fileUrls = [];
  
  fileIds.forEach(function(fileId) {
    // Get the file from Drive
    const file = DriveApp.getFileById(fileId);
    
    // Create a publicly accessible URL without requiring authentication
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Generate thumbnail URL format
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
    
    fileUrls.push(thumbnailUrl);
  });
  
  return fileUrls.length === 1 ? fileUrls[0] : fileUrls; // Return single object for single files
}

/**
 * Normalizes field names for Firestore
 */
function normalizeField(fieldName) {
  return fieldName;
}

/**
 * Sends data to Firebase Firestore
 */
function sendToFirestore(data) {
  // Get access token using service account
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    Logger.log("Failed to get access token");
    return false;
  }
  
  // Create a document with auto-generated ID
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${FIREBASE_COLLECTION}`;
  
  // Convert data to Firestore format
  const firestoreData = convertToFirestoreFormat(data);
  
  // Send request to Firestore
  const response = UrlFetchApp.fetch(firestoreUrl, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    payload: JSON.stringify(firestoreData),
    muteHttpExceptions: true
  });
  
  const responseCode = response.getResponseCode();
  
  if (responseCode >= 200 && responseCode < 300) {
    Logger.log("Data successfully sent to Firestore");
    return true;
  } else {
    Logger.log("Failed to send data to Firestore: " + response.getContentText());
    return false;
  }
}

/**
 * Converts JS objects to Firestore document format
 */
function convertToFirestoreFormat(data) {
  const firestoreData = { fields: {} };
  
  for (const key in data) {
    const value = data[key];
    let fieldValue = {};
    
    if (value === null || value === undefined) {
      fieldValue = { nullValue: null };
    } else if (typeof value === 'string') {
      fieldValue = { stringValue: value };
    } else if (typeof value === 'number') {
      fieldValue = { doubleValue: value };
    } else if (typeof value === 'boolean') {
      fieldValue = { booleanValue: value };
    } else if (value instanceof Date) {
      fieldValue = { timestampValue: value.toISOString() };
    } else if (Array.isArray(value)) {
      // Check if array has only one element
      if (value.length === 1) {
        const item = value[0];
        // Convert single element based on its type, not as array
        if (typeof item === 'string') {
          fieldValue = { stringValue: item };
        } else if (typeof item === 'number') {
          fieldValue = { doubleValue: item };
        } else if (typeof item === 'boolean') {
          fieldValue = { booleanValue: item };
        } else if (item instanceof Date) {
          fieldValue = { timestampValue: item.toISOString() };
        } else if (typeof item === 'object' && item !== null) {
          fieldValue = { mapValue: convertToFirestoreFormat(item) };
        } else {
          fieldValue = { stringValue: String(item) };
        }
      } else {
        // Process normal arrays (multiple elements)
        const arrayValues = value.map(item => {
          if (typeof item === 'string') {
            return { stringValue: item };
          } else if (typeof item === 'number') {
            return { doubleValue: item };
          } else if (typeof item === 'boolean') {
            return { booleanValue: item };
          } else if (item instanceof Date) {
            return { timestampValue: item.toISOString() };
          } else if (typeof item === 'object' && item !== null) {
            return { mapValue: convertToFirestoreFormat(item) };
          } else {
            return { stringValue: String(item) };
          }
        });
        fieldValue = { arrayValue: { values: arrayValues } };
      }
    } else if (typeof value === 'object') {
      fieldValue = { mapValue: convertToFirestoreFormat(value) };
    } else {
      fieldValue = { stringValue: String(value) };
    }
    
    firestoreData.fields[key] = fieldValue;
  }
  
  return firestoreData;
}

/**
 * Gets access token using a service account
 */
function getAccessToken() {

  // Create a JWT token
  const header = {
    alg: "RS256",
    typ: "JWT"
  };
  
  const now = Math.floor(Date.now() / 1000);
  const oneHourFromNow = now + 3600;
  
  const payload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    sub: SERVICE_ACCOUNT_EMAIL,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: oneHourFromNow,
    scope: "https://www.googleapis.com/auth/datastore"
  };
  
  const encodedHeader = Utilities.base64EncodeWebSafe(JSON.stringify(header)).replace(/=+$/, '');
  const encodedPayload = Utilities.base64EncodeWebSafe(JSON.stringify(payload)).replace(/=+$/, '');
  
  const signatureInput = encodedHeader + "." + encodedPayload;
  
  // Sign with private key
  const signature = Utilities.computeRsaSha256Signature(
    signatureInput,
    SERVICE_ACCOUNT_PRIVATE_KEY
  );
  
  const encodedSignature = Utilities.base64EncodeWebSafe(signature).replace(/=+$/, '');
  const jwt = signatureInput + "." + encodedSignature;
  
  // Exchange JWT for access token
  const tokenEndpoint = "https://oauth2.googleapis.com/token";
  const response = UrlFetchApp.fetch(tokenEndpoint, {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    },
    muteHttpExceptions: true
  });
  
  const responseData = JSON.parse(response.getContentText());
  
  if (responseData.access_token) {
    return responseData.access_token;
  } else {
    Logger.log("Failed to get access token: " + response.getContentText());
    return null;
  }
}