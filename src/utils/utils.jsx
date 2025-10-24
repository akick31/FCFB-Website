export const checkIfUserIsAdmin = () => {
    const role = localStorage.getItem('role');
    const isAdmin = role === 'ADMIN' || role === 'CONFERENCE_COMMISSIONER';
    return isAdmin;
};
