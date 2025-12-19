// Mock API for development when backend isn't available
const mockVolunteerAPI = {
  getProfile: async (userId) => {
    console.log('Mock: Getting profile for user', userId);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        status: 'pending',
        appliedDate: new Date().toLocaleDateString(),
        lastUpdated: new Date().toLocaleString(),
        applicationId: 'APP' + Math.floor(Math.random() * 10000),
        documents: 'ID Proof, Address Proof'
      }
    };
  },

  getAssignedIncidents: async (userId) => {
    console.log('Mock: Getting incidents for user', userId);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: [
        {
          id: 1,
          title: 'Flood in Downtown Area',
          description: 'Heavy flooding reported in downtown area with 5 people stranded.',
          location: 'Downtown, Main Street',
          timestamp: '10:30 AM',
          priority: 'high',
          status: 'accepted',
          victims: 5,
          reporter: {
            name: 'John Doe',
            phone: '+1234567890'
          }
        },
        {
          id: 2,
          title: 'Fire Emergency',
          description: 'Small fire reported in residential building.',
          location: 'North District, 5th Ave',
          timestamp: '9:45 AM',
          priority: 'medium',
          status: 'in-progress',
          victims: 2,
          reporter: {
            name: 'Jane Smith',
            phone: '+0987654321'
          }
        }
      ]
    };
  },

  acceptIncident: async (incidentId) => {
    console.log('Mock: Accepting incident', incidentId);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      message: 'Incident accepted successfully'
    };
  },

  submitApplication: async (applicationData) => {
    console.log('Mock: Submitting volunteer application', applicationData);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      message: 'Application submitted successfully',
      profile: {
        applicationId: 'APP' + Math.floor(Math.random() * 100000),
        status: 'pending',
        appliedDate: new Date().toLocaleDateString(),
        lastUpdated: new Date().toLocaleString(),
        ...applicationData
      }
    };
  }
};

export { mockVolunteerAPI };
export default mockVolunteerAPI;