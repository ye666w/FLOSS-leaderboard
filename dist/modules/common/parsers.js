export const parseOptionalPositiveInt = (value) => {
    if (value == null || value === '') {
        return undefined;
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
};
export const parseRequiredInt = (value) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
        return null;
    }
    return parsed;
};
export const parseBigIntValue = (value) => {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return null;
    }
    try {
        return BigInt(value);
    }
    catch {
        return null;
    }
};
//# sourceMappingURL=parsers.js.map