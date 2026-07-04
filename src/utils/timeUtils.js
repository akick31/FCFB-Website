export const formatTimeOfPossession = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    
    const totalSeconds = parseInt(seconds, 10);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatGameTime = (time) => {
    if (!time) return 'N/A';
    return time;
};

export const formatQuarter = (quarter) => {
    if (!quarter) return 'N/A';
    
    if (quarter === '1') return '1st';
    if (quarter === '2') return '2nd';
    if (quarter === '3') return '3rd';
    if (quarter === '4') return '4th';
    if (quarter === 'OT') return 'OT';
    
    return quarter;
};

export const formatResponseTime = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    
    const totalSeconds = parseInt(seconds, 10);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}; 