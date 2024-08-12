/**
 * Removes diacritics from a string.
 * 
 * @param {string} str - The input string.
 * @returns {string} - The string without diacritics.
 */
function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Convert a date string to brazilian format
 * 
 * @param {string} dateString - The input string.
 * @returns {string} - The string in brazilian format.
 */
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Convert a numeral string to brazilian currency format
 * 
 * @param {string} value - The input string.
 * @returns {string} - The string in brazilian currency format.
 */
function formatCurrency(value) {
    return typeof value === 'number' ? value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) : '';
}

/**
 * Updates an array with new data.
 * 
 * This function appends the provided data to the end of the target array.
 * 
 * @param {Array} targetArray - The array to be updated.
 * @param {*} data - The data to be added to the array.
 *
 * @returns {void} - This function does not return a value.
 */

function updateData(targetArray, data) {
    targetArray.push(data);
}

/**
 * Clears all checkboxes within the specified selector.
 * 
 * This function selects all elements matching the provided selector and sets their 'checked' property to false.
 * 
 * @param {string} selector - The CSS selector used to identify the checkboxes to be cleared.
 * 
 * @returns {void} - This function does not return a value.
 */
function clearCheckboxes(selector) {
    document.querySelectorAll(selector).forEach(checkbox => {
        checkbox.checked = false;
    });
}

/**
 * Resets the selected option in a dropdown menu.
 * 
 * This function sets the 'selectedIndex' property of the provided dropdown element to 0, resetting the selected option to the first one.
 * 
 * @param {HTMLSelectElement} dropdown - The dropdown menu element to be reset.
 * 
 * @returns {void} - This function does not return a value.
 */
function resetDropdown(dropdown) {
    dropdown.selectedIndex = 0;
}

/**
 * Resets the global variables related to location, office, and election code.
 * 
 * This function sets the values of the global variables `locationCode`, `officeId`, and `electionCode` to `null`.
 * 
 * @returns {void} - This function does not return a value.
 */
function resetVariables() {
    locationCode = null;
    officeId = null;
    electionCode = null;
}

/**
 * Clears the input fields and selected candidates.
 * 
 * This function resets the value of the search box and clears the selected candidates array.
 * 
 * @returns {void} - This function does not return a value.
 */
function clearInputs() {
    searchBox.value = '';
    selectedCandidates.length = 0;
}

/**
 * Clears the user interface by resetting and hiding elements.
 * 
 * This function clears the content of specific UI elements and hides the print button.
 * 
 * @returns {void} - This function does not return a value.
 */
function clearUI() {
    suggestions.innerHTML = '';
    totalCandidates.innerHTML = '--';
    candidatesContainer.innerHTML = '';
    printButton.style.display = 'none';
}