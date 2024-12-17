import axios from 'axios';

// API fetcher function with pagination and filters
export const fetchData = async (filters = {}, scrollToken = null, size = 10) => {
    try {
        const requestPayload = {
            filters,
            size,
        };

        // Include scroll_token if available
        if (scrollToken) {
            requestPayload.scroll_token = scrollToken;
        }

        // Replace with your actual API endpoint
        const response = await axios.post('https://api.example.com/data', requestPayload);

        // Extract response data and scroll token
        const { data, scroll_token } = response.data;

        // Map and format the data
        const formattedData = data.map((item) => {
            return {
                name: item.experience[0]?.company.name || 'N/A',
                jobTitle: item.experience[0]?.title.name || 'N/A',
                companyWebsite: item.experience[0]?.company.website || 'N/A',
                company: item.experience[0]?.company.name || 'N/A',
                email: item.emails || 'N/A',
                phone: item.phone || 'N/A',
                location_country: item.countries[0] || 'N/A',
            };
        });

        return { formattedData, scrollToken: scroll_token };
    } catch (error) {
        console.error('Error fetching data:', error);
        return { formattedData: [], scrollToken: null };
    }
};
