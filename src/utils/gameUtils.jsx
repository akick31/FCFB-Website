export const parseClock = (clock) => {
    if (!clock) return 0;
    const [minutes, seconds] = clock.split(':').map(Number);
    return minutes * 60 + seconds;
};