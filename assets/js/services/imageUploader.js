import axios from 'axios';
const SERVER_BASE_URL = "http://127.0.0.1:7860";

export const uploadImages = async (images) => {
    // Create a FormData object
    const formData = new FormData();

    // Add each image to the FormData object
    // If images is an array of File objects
    if (Array.isArray(images)) {
        images.forEach((image, index) => {
            formData.append("images", image);
        });
    }
    // If images is a single File object
    else if (images instanceof File) {
        formData.append("images", images);
    }
    // If images is already a FormData object (from a file input)
    else if (images instanceof FormData) {
        // Use the existing FormData
        return await axios.post(`${SERVER_BASE_URL}/uploadImages`, images, { headers: { 'Content-Type': 'multipart/form-data' } }).then(response => response.data.saved_paths);
    }

    // Make the fetch request with the FormData
    const response = await axios.post(`${SERVER_BASE_URL}/uploadImages`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(response => response.data.saved_paths);
    return response;
};