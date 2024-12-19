export const checkIfUserIsAdmin = () => {
    const role = localStorage.getItem('role');
    return role === 'ADMIN' || role === 'CONFERENCE_COMMISSIONER';
};
