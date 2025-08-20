/**
 * Time utility functions for consistent formatting across the application
 */

/**
 * Converts seconds to mm:ss format
 * @param {number|string} seconds - Time in seconds
 * @returns {string} - Formatted time in mm:ss format
 */
export const formatTimeOfPossession = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    
    const totalSeconds = parseInt(seconds, 10);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formats a time string to a readable format
 * @param {string} time - Time string from backend
 * @returns {string} - Formatted time
 */
export const formatGameTime = (time) => {
    if (!time) return 'N/A';
    return time;
};

/**
 * Formats quarter information
 * @param {string|number} quarter - Quarter information
 * @returns {string} - Formatted quarter
 */
export const formatQuarter = (quarter) => {
    if (!quarter) return 'N/A';
    
    if (quarter === '1') return '1st';
    if (quarter === '2') return '2nd';
    if (quarter === '3') return '3rd';
    if (quarter === '4') return '4th';
    if (quarter === 'OT') return 'OT';
    
    return quarter;
}; 