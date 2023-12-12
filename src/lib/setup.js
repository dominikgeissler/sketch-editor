/**
 * @fileoverview This file contains the setup for the example select-dropdown.
 */

// Load all programs in the /examples folder and add them as selectable options
// into the select-dropdown
document.addEventListener("DOMContentLoaded", () => {
  const addOptions = (files) => {
    const select = document.getElementById("example-select");
    files.sort();
    files.forEach((f) => {
      const option = document.createElement("option");
      option.value = f;
      option.text = f;
      select.appendChild(option);
    });
  };

  // Get all examples in the /examples folder
  fetch("/examples")
    .then((res) => res.json())
    .then((data) => addOptions(data))
    .catch((err) => console.error("Error: ", err));
});
