/**
 * @fileoverview Handles the client-side logic of the editor.
 */


/*
  TODO:
    The (un)setLoading functions currently don't take the buttons'
    behavior into account. For example, after the user loads an example
    (and the selection is removed) the "Load Example"-button is
    enabled by the unsetLoading-function, even though it should
    be disabled as there is no example selected.
*/

// Sets visual loading by disabling buttons and setting the cursor
const setLoading = () => {
  // Add the loading class to display progress cursor
  document.body.classList.add('loading');
  document.getElementById('code').classList.add('loading');

  // Disable the buttons
  document.getElementById('run').disabled = true;
  document.getElementById('example').disabled = true;
  document.getElementById('example-select').disabled = true;
};

// Unsets the visual loading
const unsetLoading = () => {
  // Remove loading class
  document.body.classList.remove('loading');
  document.getElementById('code').classList.remove('loading');

  // Enable the buttons
  document.getElementById('run').disabled = false;
  document.getElementById('example').disabled = false;
  document.getElementById('example-select').disabled = false;
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

// Some UX improvements for using the "code editor"
code.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('run').click();
  } else if (e.key === 'Tab') {
    e.preventDefault();

    // Insert a \t character
    const start = code.selectionStart;
    const end = code.selectionEnd;
    const value = code.value;
    code.value = value.substring(0, start) + '\t' + value.substring(end);
    code.selectionStart = code.selectionEnd = start + 1;

    // When '{' is inserted, automatically insert a '}' as well and move
    // the cursor
  } else if (e.key === '{') {
    e.preventDefault();

    const start = code.selectionStart;
    const end = code.selectionEnd;
    const value = code.value;
    code.value = value.substring(0, start) + '{' + '}' + value.substring(end);
    code.selectionStart = code.selectionEnd = start + 1;

    // When '(' is inserted, automatically insert a ')' as well and move
    // the cursor
  } else if (e.key === '(') {
    e.preventDefault();

    const start = code.selectionStart;
    const end = code.selectionEnd;
    const value = code.value;
    code.value = value.substring(0, start) + '(' + ')' + value.substring(end);
    code.selectionStart = code.selectionEnd = start + 1;

    // When '[' is inserted, automatically insert a ']' as well and move
    // the cursor
  } else if (e.key === '[') {
    e.preventDefault();

    const start = code.selectionStart;
    const end = code.selectionEnd;
    const value = code.value;
    code.value = value.substring(0, start) + '[' + ']' + value.substring(end);
    code.selectionStart = code.selectionEnd = start + 1;

    // If backspace is pressed if the cursor is in between two brackets,
    // remove both
  } else if (e.key === 'Backspace') {
    const start = code.selectionStart;
    const end = code.selectionEnd;
    const value = code.value;

    if (value[start - 1] === '{' && value[end] === '}') {
      e.preventDefault();
      code.value = value.substring(0, start - 1) + value.substring(end + 1);
      code.selectionStart = code.selectionEnd = start - 1;
    } else if (value[start - 1] === '(' && value[end] === ')') {
      e.preventDefault();
      code.value = value.substring(0, start - 1) + value.substring(end + 1);
      code.selectionStart = code.selectionEnd = start - 1;
    } else if (value[start - 1] === '[' && value[end] === ']') {
      e.preventDefault();
      code.value = value.substring(0, start - 1) + value.substring(end + 1);
      code.selectionStart = code.selectionEnd = start - 1;
    }
  }
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
