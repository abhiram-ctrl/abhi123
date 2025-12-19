# Incident Flow Guide - Volunteer Dashboard & Citizen Help Requests

## Overview
This guide explains how incidents flow from citizens requesting help to volunteers accepting and managing those requests through the database.

## Architecture

### Database Layer
- **Incident Model** (`backend/models/Incident.js`)
  - Stores all incident data: SOS (emergencies) and RISK (hazard reports)
  - Status flow: `open` → `assigned` → `in-progress` → `resolved`
  - Fields: reporterId, type, description, location, priority, assignedVolunteerId, createdAt

### Backend Routes
- **POST `/api/incidents`** - Create new incident (from citizen)
- **GET `/api/incidents`** - Get all incidents (with filters)
- **GET `/api/incidents/open/list`** - Get open incidents (for volunteers)
- **GET `/api/incidents/volunteer/:volunteerId`** - Get assigned incidents for a volunteer
- **POST `/api/incidents/:id/accept`** - Volunteer accepts an incident
- **PUT `/api/incidents/:id`** - Update incident (status, notes)
- **PUT `/api/incidents/:id/assign`** - Admin assigns volunteer to incident

### Frontend Layer

#### Volunteer Dashboard Components
1. **VolunteerDashboard.jsx** - Main container
   - Loads volunteer profile to check verified status
   - Fetches assigned incidents & open incidents
   - Sets up socket connection for real-time updates
   - Manages tab navigation (Status, Assigned, New)

2. **IncidentCard.jsx** - Display incident information
   - Shows incident type, priority, location, description
   - Reporter contact information
   - Action buttons (Accept/View Details)
   - Handles both old and new database field names

3. **Socket Connection** - Real-time updates
   - Listens for `new-incident` events
   - Listens for `incident-updated` events
   - Auto-updates incident lists without page refresh

## Incident Flow Steps

### Step 1: Citizen Creates Help Request
```
Citizen opens SOS Page or Report Risk Page
→ Fills in emergency details (description, location, type)
→ Submits form
→ Backend creates Incident document with status: 'open'
```

### Step 2: Socket Broadcast
```
Backend emits 'new-incident' via Socket.io
→ All connected volunteer clients receive real-time notification
→ Incidents appear in "New Incidents" tab (if volunteer is verified)
```

### Step 3: Volunteer Sees New Incidents
```
Volunteer logs in
→ Dashboard checks verification status
→ If verified: fetches open incidents from GET /api/incidents/open/list
→ If not verified: shows "Account Not Verified" in status tab
→ Socket connection maintains real-time incident list
```

### Step 4: Volunteer Accepts Incident
```
Volunteer clicks "Accept" on an incident card
→ Frontend calls POST /api/incidents/{id}/accept
→ Backend updates incident:
   - status: 'open' → 'assigned'
   - assignedVolunteerId: {volunteerId}
→ Incident moves from "New Incidents" to "Assigned Incidents"
```

### Step 5: Real-time Updates
```
When incident is accepted:
→ Backend emits 'incident-updated' via Socket.io
→ Other volunteers receive update and remove from their "New Incidents"
→ Assigned volunteer sees it in "Assigned Incidents" tab
```

## API Endpoints Reference

### Fetch Open Incidents (Volunteers)
**GET** `/api/incidents/open/list`
```javascript
// Response
{
  message: "Open incidents fetched",
  data: [
    {
      _id: "ObjectId",
      reporterId: "userId",
      type: "SOS" | "RISK",
      emergencyType: "medical" | "fire" | "crime" | ..., // for SOS
      description: "Patient experiencing chest pain",
      location: { address: "123 Main St", lat: 28.7041, lng: 77.1025 },
      priority: "high" | "medium" | "low",
      status: "open",
      assignedVolunteerId: null,
      createdAt: "2025-12-18T10:30:00Z"
    }
  ]
}
```

### Fetch Volunteer's Assigned Incidents
**GET** `/api/incidents/volunteer/:volunteerId`
```javascript
// Response
{
  message: "Assigned incidents fetched",
  data: [
    {
      _id: "ObjectId",
      assignedVolunteerId: "volunteerId",
      status: "assigned",
      ... // same fields as above
    }
  ]
}
```

### Accept Incident
**POST** `/api/incidents/:incidentId/accept`
```javascript
// Request Body
{
  volunteerId: "volunteerId"
}

// Response
{
  message: "Incident accepted",
  incident: {
    _id: "ObjectId",
    status: "assigned",
    assignedVolunteerId: "volunteerId",
    ... // updated incident data
  }
}
```

## Frontend State Management

### VolunteerDashboard State
```javascript
const [profile, setProfile] = useState(null);           // Volunteer profile with verification status
const [assignedIncidents, setAssignedIncidents] = []; // Incidents assigned to this volunteer
const [newIncidents, setNewIncidents] = [];             // Open incidents available for acceptance
const [activeTab, setActiveTab] = useState('status');   // Current tab view
const [isLoading, setIsLoading] = useState(true);       // Loading state
```

### Data Flow
```
Mount Component
  ├─ Load userData from localStorage
  ├─ Fetch volunteer profile from DB
  ├─ If verified:
  │  ├─ Fetch assigned incidents
  │  ├─ Fetch open incidents
  │  └─ Connect to Socket.io
  └─ If not verified:
     └─ Show "Account Not Verified" status
```

## Socket.io Events

### New Incident Event
```javascript
socket.on('new-incident', (incident) => {
  // Adds incident to newIncidents list if volunteer is verified
  setNewIncidents(prev => [incident, ...prev.slice(0, 9)]);
});
```

### Incident Updated Event
```javascript
socket.on('incident-updated', (incident) => {
  // Updates incident in assigned list
  setAssignedIncidents(prev => 
    prev.map(i => i._id === incident._id ? incident : i)
  );
  // Removes from new incidents if now assigned
  setNewIncidents(prev => 
    prev.filter(i => i._id !== incident._id)
  );
});
```

## Testing the Flow

### Test Scenario 1: Create Incident & See in Volunteer Dashboard
```
1. Open citizen SOS page
2. Fill details: "Medical Emergency", location: "Main Street"
3. Submit form
4. Open volunteer dashboard (verified volunteer)
5. Check "New Incidents" tab → should see the incident
6. Verify location, description, reporter info displayed correctly
```

### Test Scenario 2: Accept Incident
```
1. In volunteer dashboard "New Incidents" tab
2. Click "Accept" button on an incident
3. Should move to "Assigned Incidents" tab
4. Should show success message
5. Incident should no longer appear in "New Incidents"
```

### Test Scenario 3: Real-time Update
```
1. Open two browser windows (or tabs)
2. Window 1: Volunteer A's dashboard
3. Window 2: Volunteer B's dashboard
4. Create new incident as citizen
5. Both volunteers should see it in "New Incidents" (real-time via socket)
6. Volunteer A clicks "Accept"
7. Window 1: Incident moves to "Assigned Incidents"
8. Window 2: Incident disappears from "New Incidents" (real-time update via socket)
```

## Verification Status

### Unverified Volunteer
- ❌ Cannot see "New Incidents" tab
- ❌ Cannot accept incidents
- ✅ Can see "Account Not Verified" message in Status tab
- ✅ Can fill application form

### Verified Volunteer
- ✅ Can see "New Incidents" tab with open incidents
- ✅ Can accept incidents
- ✅ Can see "Assigned Incidents" tab
- ✅ Can view incident details and update status

## Error Handling

### Common Issues & Fixes

**Issue: No incidents showing in "New Incidents" tab**
- Check: Is volunteer verified? (check Status tab)
- Check: Are there open incidents in database? (Check backend logs)
- Check: Is socket connection active? (Check browser console)
- Solution: Try refreshing the page or check network tab for API errors

**Issue: Accepted incident still shows in "New Incidents"**
- Check: Did socket event come through? (Check browser console)
- Check: Response from accept endpoint (check network tab)
- Solution: Try refreshing page to reload incidents from database

**Issue: Volunteer cannot accept incident**
- Check: Is volunteer verified?
- Check: Is incident status still "open"? (might be accepted by another volunteer)
- Check: Authorization token valid? (check if user is logged in)
- Solution: Log out and log back in, try another incident

## Database Queries

### Get all open incidents (sorted by newest first)
```javascript
// In Node.js
const openIncidents = await Incident.find({ 
  status: "open",
  assignedVolunteerId: null 
}).sort({ createdAt: -1 }).limit(10);
```

### Get volunteer's active incidents
```javascript
const myIncidents = await Incident.find({ 
  assignedVolunteerId: volunteerId,
  status: { $in: ["assigned", "in-progress"] }
}).sort({ createdAt: -1 });
```

### Get incidents by status
```javascript
const resolved = await Incident.find({ status: "resolved" });
const assigned = await Incident.find({ status: "assigned" });
const open = await Incident.find({ status: "open" });
```

## Performance Considerations

1. **Pagination**: Currently limiting to 10 open incidents per request
2. **Caching**: Consider adding Redis caching for frequently accessed open incidents
3. **Socket Optimization**: Only emit incidents to verified volunteers
4. **Database Indexing**: Index on `status`, `assignedVolunteerId`, and `createdAt` for faster queries

## Future Enhancements

1. ✅ Real-time incident acceptance (implemented via Socket.io)
2. ✅ Volunteer profile verification status (implemented)
3. ⏳ Incident detail view with full information
4. ⏳ Volunteer can update incident status (in-progress, resolved)
5. ⏳ Incident assignment by admin
6. ⏳ Volunteer rating & review system
7. ⏳ Geographic filtering (incidents near volunteer location)
8. ⏳ Notification system for new incidents

## Summary

The incident flow is now fully connected to the database with proper verification checks, real-time updates via Socket.io, and a smooth user experience for both citizens reporting incidents and volunteers accepting help requests.

**Key Points:**
- Citizens create incidents → Stored in DB with status "open"
- Incidents broadcast via Socket.io to all verified volunteers
- Volunteers see open incidents in "New Incidents" tab
- Volunteers can accept incidents → Status changes to "assigned"
- Real-time updates ensure all volunteers stay in sync
- Only verified volunteers can see and accept incidents
