/**
 * @fileoverview Handles the client-side logic of the editor.
 */

// Save last key to automatically replace inserted closed chars
let lastKeyPressed = undefined;

// Save the buttons' last states
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
  false,
  true,
  false,
  true,
  true,
];

const buttonIds = ['run', 'example', 'upload', 'download', 'delete'];

// Sets visual loading by disabling buttons and setting the cursor
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

// Unsets the visual loading
const unsetLoading = () => {
  // Remove loading class
  document.body.classList.remove('loading');
  document.getElementById('code').classList.remove('loading');

  // Set the buttons to their state before loading
  buttonIds.map((id, index) =>
    document.getElementById(id).disabled = lastButtonStates[index]);
};

// Correctly renders console output with colors that are encoded by ANSI codes
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

const code = document.getElementById('code');

// TODO Maybe move this to a separate file
// Some UX improvements for using the "code editor"
code.addEventListener('keydown', (e) => {
  const start = code.selectionStart;
  const end = code.selectionEnd;
  const value = code.value;

  const keys = ['{', '(', '[', '\'', '"', '`'];

  // Returns the "closing" char for a given key input
  const keyComplement = (key) => {
    switch (key) {
      case '{':
        return '}';
      case '(':
        return ')';
      case '[':
        return ']';
      default:
        return key;
    }
  };

  const keyComplements = keys.map((k) => keyComplement(k));

  // Shortcuts
  if (e.ctrlKey) {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('run').click();
    } else if (e.key === '#') {
      e.preventDefault();

      // All lines
      const lines = value.split('\n');
      const lineStartIndices = [0];

      // Calculate the start index for each line
      for (let i = 0; i < lines.length; i++) {
        if (i != lines.length - 1) {
          lineStartIndices.push(lineStartIndices[i] + lines[i].length + 1);
        }
      }

      const selectedLines = [];

      // Check which lines are selected by...
      for (let i = 0; i < lineStartIndices.length; i++) {
        // Taking the interval [currentLineStart, nextLineStart)
        const currentLineStart = lineStartIndices[i];
        // Virtually insert a new line after the last line to handle
        // its selection correctly
        const nextLineStart = i !== lineStartIndices.length - 1 ?
          lineStartIndices[i + 1] :
          currentLineStart + lines[lineStartIndices.length - 1].length + 1;

        // If the selection is in this interval (either the start or the end)
        // the line is selected, otherwise it is skipped
        if ((currentLineStart <= start && start < nextLineStart) ||
          (currentLineStart <= end && start < nextLineStart)) {
          // Line is in selection
          selectedLines.push([lines[i], i]);
        }
      }

      const minTabIdentation = Math.min(...selectedLines.map(([el, _]) => {
        let count = 0;
        for (const c of el) {
          if (c === '\t') {
            count++;
          } else {
            break;
          }
        }
        return count;
      }),
      );

      // Now, one can insert the '//' characters before each of those lines,
      // if they are not present, otherwise remove them

      const areCommentedOut = selectedLines.every(
        ([el, _]) => el.trim().startsWith('//'));

      for (const [selectedLine, index] of selectedLines) {
        let newLine = selectedLine;
        if (areCommentedOut) {
          // Remove the '//' characters
          newLine = selectedLine.replace(
            '\t'.repeat(minTabIdentation) + '// ',
            '\t'.repeat(minTabIdentation));
        } else {
          // Insert the '//' characters
          newLine = '\t'.repeat(minTabIdentation) + '// ' +
            selectedLine.replace('\t'.repeat(minTabIdentation), '');
        }
        lines[index] = newLine;
      }

      // Shift the start and end of selection by 3 characters, depending
      // on whether the lines were or were not already commented

      const newStart = Math.max(
        start + (areCommentedOut ? -3 : 3),
        lineStartIndices.find((i) => i === start) ?? 0);
      const newEnd = Math.max(
        end + (areCommentedOut ? -3 : 3) * selectedLines.length,
        (lineStartIndices.find((i) => i === end) ?? lineStartIndices.length));

      // Putting it all together:
      // Set the new value for the code area as well as the selection
      code.value = lines.join('\n');
      code.selectionStart = newStart;
      code.selectionEnd = newEnd;
    }
  }

  if (e.key === 'Tab') {
    e.preventDefault();

    // Insert a \t character
    code.value = value.substring(0, start) + '\t' + value.substring(end);
    code.selectionStart = code.selectionEnd = start + 1;

    // When one of the keys is pressed, insert the key and its complement
  } else if (keys.includes(e.key) && lastKeyPressed !== e.key) {
    e.preventDefault();

    const selectedText = value.substring(start, end) ?? '';
    code.value = value.substring(0, start) + e.key + selectedText +
      keyComplement(e.key) + value.substring(end);
    code.selectionStart = code.selectionEnd = start + 1;

    // If backspace is pressed if the cursor is in between two chars (as above),
    // remove both
  } else if (e.key === 'Backspace') {
    // Remove both symbols at once
    if (value[start - 1] === '{' && value[end] === '}' ||
      value[start - 1] === '(' && value[end] === ')' ||
      value[start - 1] === '[' && value[end] === ']' ||
      value[start - 1] === '"' && value[end] === '"' ||
      value[start - 1] === '\'' && value[end] === '\'' ||
      value[start - 1] === '`' && value[end] === '`'
    ) {
      e.preventDefault();
      code.value = value.substring(0, start - 1) + value.substring(end + 1);
      code.selectionStart = code.selectionEnd = start - 1;
    }
  } else if (keyComplements.includes(e.key)) {
    if (!!lastKeyPressed && keyComplement(lastKeyPressed) === e.key) {
      e.preventDefault();
      code.selectionStart = code.selectionEnd = start + 1;
    }
  }

  // Only save last key if it is auto-filled with the complement
  lastKeyPressed = keys.includes(e.key) ? e.key : undefined;
});

// Disable the download / delete button if the code is empty
code.addEventListener('keyup', (e) => {
  if (code.value.trim() === '') {
    document.getElementById('download').disabled = true;
    document.getElementById('delete').disabled = true;
  } else {
    document.getElementById('download').disabled = false;
    document.getElementById('delete').disabled = false;
  }
});

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
