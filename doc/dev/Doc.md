# Doc

To create the javascript doc run the following command

```bash
npm run doc
```

The documentation will be created [in this folder](generated).

## Basic structure

```
.
├── examples    // Sketch files that can be loaded in the editor
├── index.html  // The base html page
├── lib         // The javascript files
└── static      // Static files (css, icon)
```

### Examples
Most of the examples are from the original paper showing the basic constructs which are used within the SKETCH language.

### `index.html`
This file models the basic structure of the index page.

### Lib
Here, one can find the server-side and client-side logic.

```
├── editor.js   // UX-improvements for the code editor
├── index.js    // Main logic for the client-side index page
├── server.js   // Server logic
└── setup.js    // Functions that are needed to setup
```

### Static
Here files are stored that are not needed for dynamic display. These incldue the `styles.css` as well as the `favicon.ico`.
