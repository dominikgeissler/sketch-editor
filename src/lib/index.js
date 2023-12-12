/**
 * @fileoverview Handles the client-side logic of the editor.
 */

/**
 * Buttons' last states `disabled`-state
 * Order:
 *  * Run
 *  * Example
 *  * Upload
 *  * Download
 *  * Delete
 */
let lastButtonStates = [
  // Run
  false,
  // Example
  true,
  // Upload
  false,
  // Download
  true,
  // Delete
  true,
];

/**
 * All button ids that should be disabled by {@link setLoading}
 * @type {string[]}
 */
const buttonIds = ['run', 'example', 'upload', 'download', 'delete'];

/**
 * Sets visual loading by disabling buttons and setting the cursor
 */
const setLoading = () => {
  // Add the loading class to display progress cursor
  document.body.classList.add('loading');
  document.getElementById('code').classList.add('loading');

  // Save the current states
  lastButtonStates = buttonIds
    .map((id) => document.getElementById(id).disabled);

  // Disable the buttons
  buttonIds.forEach((id) => document.getElementById(id).disabled = true);
};

/**
 * Unsets the visual loading
 */
const unsetLoading = () => {
  // Remove loading class
  document.body.classList.remove('loading');
  document.getElementById('code').classList.remove('loading');

  // Set the buttons to their state before loading
  buttonIds.map((id, index) =>
    document.getElementById(id).disabled = lastButtonStates[index]);
};

/**
 * Correctly renders console output with colors that
 * are encoded by ANSI codes.
 * @param {string} txt The output of the SKETCH process.
 * @return {string} The HTML-"encoded" return.
 */
const renderText = (txt) => {
  const ansiRegex = /\[\d+;\d+m/g;

  // First, replace the \n by br tags
  let htmlText = txt.replace(/\n/g, '<br>');

  htmlText = txt.replace(ansiRegex, (m) => {
    // Retrieve the code and split it to obtain style and color
    const colorCode = m.slice(1, -1);
    const [, color] = colorCode.split(';');

    let cssClass = '';

    // Color code <-> class
    switch (color) {
      case '31':
        cssClass = 'red';
        break;
      case '32':
        cssClass = 'green';
        break;
      // ...
      default:
        break;
    }

    return `<span class="${cssClass}">`;
  });

  // Close span tags
  return htmlText.replace(/\[0m/g, '</span>');
};

// ## Select ##
// Disable the button if no example is selected
document.getElementById('example-select').addEventListener('change', (e) => {
  document.getElementById('example').disabled = e.target.value === '';
});

// ###########
// # Buttons #
// ###########

// Run the program
document.getElementById('run').addEventListener('click', async (e) => {
  const codeContent = document.getElementById('code').value;

  document.getElementById('output').innerHTML = '';
  document.getElementById('download-output').hidden = true;

  // Set the visual loading
  setLoading();

  // Send the program to the server to execute it
  // Afterwards display the result message
  await fetch('/', {
    method: 'POST',
    body: `code=${encodeURIComponent(codeContent)}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then((res) => res.text())
    .then((data) =>
      document.getElementById('output').innerHTML = `<pre>${renderText(data)}`)
    .catch((err) => console.error('Error: ', err));
  unsetLoading();
  document.getElementById('output').hidden = false;

  // Show the "download output" button
  document.getElementById('download-output').hidden = false;

  // Disable all buttons that have to do with code being present
  document.getElementById('download').disabled = true;
  document.getElementById('delete').disabled = true;
});

// Load an example
document.getElementById('example').addEventListener('click', (e) => {
  const exampleSelect = document.getElementById('example-select');
  const code = document.getElementById('code');
  const file = exampleSelect.value;
  if (!!file) {
    // Reset selected example
    exampleSelect.value = '';

    // Set the visual loading
    setLoading();

    // Get the selected examples' code from the server
    fetch('/load-example', {
      method: 'POST',
      body: `selectedFile=${encodeURIComponent(file)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then((res) => res.text())
      .then((data) => {
        code.value = data;
      })
      .catch((err) => console.error('Error:', err));
    // Unset the visual loading
    unsetLoading();

    // Disable the button again
    document.getElementById('example').disabled = true;

    // Enable the download / delete button
    document.getElementById('download').disabled = false;
    document.getElementById('delete').disabled = false;
  }
});

// Download the code
document.getElementById('download').addEventListener('click', (e) => {
  const code = document.getElementById('code');
  const file = new Blob([code.value], {
    type: 'text/plain',
  });

  // Create a link and click it to download the file
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = 'sketch.sk';
  a.click();
});

// Upload a file
document.getElementById('upload').addEventListener('click', (e) => {
  // Create a file input and click it to open the file dialog
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.sk'; // Only accept .sk files
  input.click();

  // When a file is selected, upload its content to the code editor
  input.addEventListener('change', (e) => {
    // If the code editor is not empty, ask the user whether he
    // wants to overwrite it
    if (document.getElementById('code').value.trim() !== '') {
      if (
        !confirm('Uploading a file will overwrite the current code. ' +
          'Do you want to continue?')) {
        return;
      }
    }

    const file = e.target.files[0];

    // Extract the files content
    const reader = new FileReader();
    reader.readAsText(file);

    // Put the files content into the code editor
    reader.onload = () => {
      document.getElementById('code').value = reader.result;

      // Enable the buttons that need code to be present
      document.getElementById('download').disabled = false;
      document.getElementById('delete').disabled = false;
    };
  });
});

// Delete the current code
document.getElementById('delete').addEventListener('click', (e) => {
  if (confirm('Are you sure you want to delete the current code?')) {
    document.getElementById('code').value = '';

    // Set the buttons to "disabled"
    document.getElementById('download').disabled = true;
    document.getElementById('delete').disabled = true;
  }
});

// Download the output
document.getElementById('download-output').addEventListener('click', (e) => {
  // Get the output zip archive from the server
  fetch('/download-output', {
    method: 'POST',
  })
    .then((res) => res.blob())
    .then((data) => {
      // Create a link and click it to download the file
      const a = document.createElement('a');
      a.href = URL.createObjectURL(data);
      a.download = 'output.tar.gz';
      a.click();
    })
    .catch((err) => console.error('Error: ', err));
});
