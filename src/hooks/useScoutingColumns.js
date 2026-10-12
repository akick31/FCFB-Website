import { useEffect, useRef, useState } from 'react';
import { updateScoutingReportHiddenColumns } from '../api/userApi';
import { toggleInArray } from '../utils/scoutingReport';
const useScoutingColumns = ({ setError }) => {
    const loggedInUserId = localStorage.getItem('userId');
    const loginToken = localStorage.getItem('token');
    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [savingColumns, setSavingColumns] = useState(false);
    const scopeRef = useRef(null);
    const columnSaveRef = useRef(null);
    useEffect(() => {
        columnSaveRef.current = {};
        setSavingColumns(false);
    }, [loggedInUserId, loginToken]);

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        return () => {
            scope.active = false;
        };
    }, []);

    const toggleColumn = (column) => setHiddenColumns((prev) => toggleInArray(prev, column));
    const saveColumns = async () => {
        if (!loggedInUserId) {
            return;
        }
        const scope = scopeRef.current;
        const request = {};
        columnSaveRef.current = request;
        const isCurrent = () =>
            scope.active &&
            columnSaveRef.current === request &&
            localStorage.getItem('userId') === loggedInUserId &&
            localStorage.getItem('token') === loginToken;
        setSavingColumns(true);
        setError('');
        try {
            await updateScoutingReportHiddenColumns(loggedInUserId, hiddenColumns);
        } catch (err) {
            if (isCurrent()) {
                setError(err.message);
            }
        } finally {
            if (isCurrent()) {
                setSavingColumns(false);
            }
        }
    };

    return { loggedInUserId, loginToken, hiddenColumns, setHiddenColumns, savingColumns, toggleColumn, saveColumns };
};
export default useScoutingColumns;
