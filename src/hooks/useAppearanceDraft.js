import { useEffect, useRef, useState } from 'react';

const differs = (form, baseline) => Object.keys(form).some((key) => form[key] !== baseline[key]);
const rebase = (form, baseline, incoming) =>
    Object.fromEntries(
        Object.entries(incoming).map(([key, value]) => [key, form[key] !== baseline[key] ? form[key] : value])
    );

export const useAppearanceDraft = (sourceForm, onDirtyChange) => {
    const [form, setForm] = useState(sourceForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);
    const formRef = useRef(sourceForm);
    const baselineRef = useRef(sourceForm);
    const scopeRef = useRef(null);

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        return () => {
            scope.active = false;
        };
    }, []);

    useEffect(() => {
        const changed = differs(sourceForm, baselineRef.current);
        const next = rebase(formRef.current, baselineRef.current, sourceForm);
        baselineRef.current = sourceForm;
        formRef.current = next;
        setForm(next);
        if (changed) {
            setError(null);
            setSaved(false);
        }
        onDirtyChange?.(differs(next, sourceForm));
    }, [sourceForm]);

    const changeForm = (update) => {
        const next = update(formRef.current);
        formRef.current = next;
        setForm(next);
        setSaved(false);
        onDirtyChange?.(differs(next, baselineRef.current));
    };

    const save = async (saveForm) => {
        const scope = scopeRef.current;
        const submitted = formRef.current;
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            const persisted = await saveForm(submitted);
            if (!scope.active) {
                return;
            }
            const next = rebase(formRef.current, submitted, persisted);
            baselineRef.current = persisted;
            formRef.current = next;
            setForm(next);
            const dirty = differs(next, persisted);
            setSaved(!dirty);
            onDirtyChange?.(dirty);
        } catch (err) {
            if (scope.active) {
                setError(err.message || 'Failed to save');
            }
        } finally {
            if (scope.active) {
                setSaving(false);
            }
        }
    };

    return { form, changeForm, saving, error, saved, save };
};
