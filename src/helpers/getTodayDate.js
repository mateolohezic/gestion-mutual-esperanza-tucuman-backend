const getTodayDate = () => {
    const date = new Date();
    return new Intl.DateTimeFormat('en-CA').format(date);
};

module.exports = { getTodayDate };