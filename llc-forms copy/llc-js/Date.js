// autoFillDate.js

window.addEventListener('DOMContentLoaded', async () => {
    if (navigator.onLine) {
        try {
            const response = await fetch('https://worldtimeapi.org/api/ip');
            if (!response.ok) throw new Error('Failed to fetch date from API');
            const data = await response.json();
            const date = new Date(data.datetime);
            fillDateFields(date);
            fillFullDateNumeric(date);
        } catch (error) {
            console.warn("API fetch failed, using system time instead.");
            const fallbackDate = new Date();
            fillDateFields(fallbackDate);
            fillFullDateNumeric(fallbackDate);
        }
    } else {
        console.warn("Offline: Using system time.");
        const fallbackDate = new Date();
        fillDateFields(fallbackDate);
        fillFullDateNumeric(fallbackDate);
    }
});

// Add ordinal suffix to day
function getDayWithSuffix(day) {
    const j = day % 10,
          k = day % 100;

    if (j === 1 && k !== 11) return `${day}st`;
    if (j === 2 && k !== 12) return `${day}nd`;
    if (j === 3 && k !== 13) return `${day}rd`;
    return `${day}th`;
}

// Fill in date fields for F and S
function fillDateFields(dateObj) {
    const day = getDayWithSuffix(dateObj.getDate());
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const year = dateObj.getFullYear();

    const idPrefixes = ['F', 'S'];

    idPrefixes.forEach(prefix => {
        const dayElement = document.getElementById(`${prefix}declarationDay`);
        const monthElement = document.getElementById(`${prefix}declarationMonth`);
        const yearElement = document.getElementById(`${prefix}declarationYear`);

        if (dayElement) dayElement.textContent = day;
        if (monthElement) monthElement.textContent = month;
        if (yearElement) yearElement.textContent = year;
    });
}

// ✅ Generate full date in numeric format "dd/mm/yyyy"
function getFullDateNumeric(dateObj) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // 0-based
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
}

// ✅ Fill full numeric date into elements with IDs: date1 to date8
function fillFullDateNumeric(dateObj) {
    const fullDate = getFullDateNumeric(dateObj);

    for (let i = 1; i <= 11; i++) {
        const element = document.getElementById(`date${i}`);
        if (element) {
            element.textContent = fullDate;
        }
    }
}
