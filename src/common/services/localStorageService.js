export const setItem = (item, value) => {
    localStorage.setItem(item, JSON.stringify(value));
};

export const getItem = item => {
    const itemValue = localStorage.getItem(item);
    if (typeof itemValue !== 'string') {
        return undefined;
    }

    return JSON.parse(itemValue);
};
