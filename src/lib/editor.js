/**
 * @fileoverview Provides some UX improvements for the text editor
 * to feel a bit more like an IDE.
 */

/**
 * Last key to be pressed (only considers key in {@link keys})
 * @type {string | undefined}
 */
let lastKeyPressed = undefined;

/**
 * All keys that can be autocompleted
 * @type {string[]}
 */
const keys = ['{', '(', '[', '\'', '"', '`'];

/**
   * Returns the "closing" char for a given key input (for {@link keys})
   * @param {string} key the key pressed
   * @return {string} the complement key
   */
const keyComplement = (key) => {
  switch (key) {
    case '{':
      return '}';
    case '(':
      return ')';
    case '[':
      return ']';
    default:
      // Used for the quotation strings
      return key;
  }
};

/**
 * Set of all key complements
 * @type {string[]}
 */
const keyComplements = keys.map((k) => keyComplement(k));

/**
 * Combination of functions for UX-improvements in the
 * code editor. Currently handles the following features:
 *  * Autocomplete any key in {@link keys}
 *  * Automatically remove both keys after autocompleting
 *  * Run on Ctrl + Enter
 *  * Tabbing
 *  * Comment in / out
 *    * Uses the maximum tab indentation to move '//' as much in as possible
 * @param {KeyboardEvent} e The event which is emitted from keypresses
 *  in the textarea.
 */
const editor = (e) => {
  const start = code.selectionStart;
  const end = code.selectionEnd;
  const value = code.value;

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

      /**
       * Minimum of number of tabs that are infront of each line
       */
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
      // Also limit the newStart / newEnd to the current lines start resp.
      // end or the editors start resp. end
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
    const k = value[start - 1];

    if (keys.includes(k) && keyComplement(k) === value[end]) {
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
};

const code = document.getElementById('code');

// Some UX improvements for using the "code editor"
code.addEventListener('keydown', (e) => {
  // Pass the event to the editor
  editor(e);
});
