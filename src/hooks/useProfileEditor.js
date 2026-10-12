import { useEffect, useRef, useState } from 'react';

const useProfileEditor = () => {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const scopeRef = useRef(null);

    useEffect(() => {
        const scope = { active: true, editor: {} };
        scopeRef.current = scope;
        return () => {
            scope.active = false;
        };
    }, []);

    const toggle = () => {
        scopeRef.current.editor = {};
        setOpen((previous) => !previous);
        setSaving(false);
        setError('');
    };

    const save = async (write, onSaved) => {
        const scope = scopeRef.current;
        const request = {};
        scope.editor = request;
        const token = localStorage.getItem('token');
        const isCurrent = () => scope.active && scope.editor === request && localStorage.getItem('token') === token;
        setSaving(true);
        setError('');
        try {
            await write();
            if (isCurrent()) {
                onSaved();
                setOpen(false);
            }
        } catch (err) {
            if (isCurrent()) {
                setError(err.message);
            }
        } finally {
            if (isCurrent()) {
                setSaving(false);
            }
        }
    };

    return { open, saving, error, toggle, save };
};

export default useProfileEditor;
