const state = {
    metadata: {
        name: "Custom Cursors",
        author: "Unknown"
    },
    settings: {
        windows: {
            useExtended: false, // false = the main 8, true = all 15 windows cursors
            renameFiles: true, // standardize exported names for simplicity
            useFallbacks: true // replace missing cursors with windows defaults 
        },
        linux: {
            method: "symlink", // "symlink" OR "duplicate"; defaults to "duplicate".
            extraCompatability: false // symlink TF outta these files with ancient hex codes and IDs
        }
    },
    slots: {
        pointer: { winFile: null, linFile: null },
        help:    { winFile: null, linFile: null },
        work:    { winFile: null, linFile: null },
        busy:    { winFile: null, linFile: null },
        text:    { winFile: null, linFile: null },
        unavail: { winFile: null, linFile: null },
        alt:     { winFile: null, linFile: null },
        link:    { winFile: null, linFile: null },
        move:    { winFile: null, linFile: null },
        handwrt: { winFile: null, linFile: null },
        precise: { winFile: null, linFile: null },
        diag1:   { winFile: null, linFile: null },
        diag2:   { winFile: null, linFile: null },
        vres:    { winFile: null, linFile: null },
        hres:    { winFile: null, linFile: null },
    }
};

let successfulFiles = []; // These files passed with flying colors.
let renamedFiles = [];    // Subset of success: {oldName, newName}
let failedFiles = [];     // { name, reason }



function nameThatFile(slotId, file) {
    if (!file) return null;
    if (!file.name.includes('.')) {
        console.error(`File "${file.name}" rejected: No file extension found.`);
        return null; // TODO: trigger a UI alert when this happens.
    }
    if (state.settings.windows.renameFiles) {
        const ext = file.name.split('.').pop();
        const newName = ext ? `${slotId}.${ext}` : null;
        renamedFiles.push(file);
        return newName;
    }
    return file.name;
}

slots.forEach(slot => {
    const file = checkIfTheresAFileAssignedToThe(slot); // imaginary function
    const slotId = probablyCheckTheCSSDataIdAttributeOfThe(slot);
    nameThatFile(slotId, file);
});

// maybeTODO: Provide UI dropdowns for lists of each of successfulFiles, renamedFiles (inside of successfulFIles), and failedFiles (etc?).