export const transactionColor = (type) => {
    if (type === 'FIRED') {
        return 'var(--live)';
    }
    if (type === 'HIRED_INTERIM') {
        return 'var(--gold)';
    }
    return 'var(--field)';
};

export const transactionLabel = (type) => (type ? type.replace(/_/g, ' ') : '-');

const parsed = (dateString) => {
    const date = dateString ? new Date(dateString) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
};

export const formatDateTime = (dateString) => {
    const date = parsed(dateString);
    if (!date) {
        return dateString || '-';
    }
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const formatTime = (dateString) =>
    parsed(dateString)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';

export const dayLabel = (dateString) =>
    parsed(dateString)?.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) || 'Unknown date';

export const coachesOf = (transaction) =>
    (Array.isArray(transaction.coach) ? transaction.coach : [transaction.coach]).filter(Boolean);

export const newestFirst = (transactions) =>
    [...transactions].sort(
        (a, b) => (parsed(b.transaction_date)?.getTime() || 0) - (parsed(a.transaction_date)?.getTime() || 0)
    );

export const groupByDay = (transactions) => {
    const groups = [];
    transactions.forEach((transaction) => {
        const label = dayLabel(transaction.transaction_date);
        const last = groups[groups.length - 1];
        if (last && last.label === label) {
            last.items.push(transaction);
        } else {
            groups.push({ label, items: [transaction] });
        }
    });
    return groups;
};
