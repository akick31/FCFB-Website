export const checkIfUserIsAdmin = () => {
    const role = localStorage.getItem('role');
    console.log('checkIfUserIsAdmin called, role from localStorage:', role);
    const isAdmin = role === 'ADMIN' || role === 'CONFERENCE_COMMISSIONER';
    console.log('isAdmin result:', isAdmin);
    return isAdmin;
};
