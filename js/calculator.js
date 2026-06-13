/* ==========================================================================
   autoRI-studio - js/calculator.js
   ========================================================================== */
export function initROICalculator() {
    const inputEmployees = document.getElementById('inputEmployees');
    const inputHours = document.getElementById('inputHours');
    const inputCost = document.getElementById('inputCost');

    const valEmployees = document.getElementById('valEmployees');
    const valHours = document.getElementById('valHours');
    const valCost = document.getElementById('valCost');

    const resultHours = document.getElementById('resultHours');
    const resultMonthly = document.getElementById('resultMonthly');
    const resultYearly = document.getElementById('resultYearly');

    if (!inputEmployees || !inputHours || !inputCost) return;

    function calculateSavings() {
        const employees = parseInt(inputEmployees.value);
        const hours = parseInt(inputHours.value);
        const cost = parseInt(inputCost.value);

        // Update slider value displays
        valEmployees.textContent = employees;
        valHours.textContent = `${hours} שעות`;
        valCost.textContent = `₪${cost}`;

        // Calculations
        // Average weeks in month: 4.33
        const monthlyHoursSaved = Math.round(employees * hours * 4.33);
        const monthlyMoneySaved = Math.round(monthlyHoursSaved * cost);
        const yearlyMoneySaved = Math.round(monthlyMoneySaved * 12);

        // Format with thousand separator
        resultHours.textContent = monthlyHoursSaved.toLocaleString('he-IL');
        resultMonthly.textContent = `₪${monthlyMoneySaved.toLocaleString('he-IL')}`;
        resultYearly.textContent = `₪${yearlyMoneySaved.toLocaleString('he-IL')}`;

        // Update savings potential badge dynamically
        const savingsBadge = document.getElementById('savingsBadge');
        if (savingsBadge) {
            savingsBadge.className = 'savings-potential-badge'; // Reset classes
            if (monthlyMoneySaved < 2000) {
                savingsBadge.classList.add('badge-basic');
                savingsBadge.textContent = 'פוטנציאל יעילות בסיסי';
            } else if (monthlyMoneySaved >= 2000 && monthlyMoneySaved < 5000) {
                savingsBadge.classList.add('badge-significant');
                savingsBadge.textContent = 'פוטנציאל ייעול משמעותי! ⚡';
            } else {
                savingsBadge.classList.add('badge-huge');
                savingsBadge.textContent = 'פוטנציאל חיסכון אדיר לעסק! 🌟';
            }
        }

        // Trigger scale-pop animation on changes
        [resultHours, resultMonthly, resultYearly].forEach(el => {
            el.classList.remove('scale-pop');
            void el.offsetWidth; // Force reflow to restart CSS animation
            el.classList.add('scale-pop');
        });
    }

    inputEmployees.addEventListener('input', calculateSavings);
    inputHours.addEventListener('input', calculateSavings);
    inputCost.addEventListener('input', calculateSavings);

    // Initial calculation
    calculateSavings();
}
