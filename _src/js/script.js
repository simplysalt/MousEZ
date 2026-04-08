const cursors = [
    { id: "pointer", label: "Normal Select", keys: ["normal", "default", "arrow", "1"], linux: ["left_ptr", "default", "arrow", "top_left_arrow"], css: "default" },
    { id: "help", label: "Help Select", keys: ["help", "question", "2"], linux: ["help", "left_ptr_help", "question_arrow"], css: "help" },
    { id: "working", label: "Working", keys: ["work", "progress", "background", "3"], linux: ["left_ptr_watch", "progress"], css: "progress" },
    { id: "busy", label: "Busy", keys: ["busy", "wait", "watch", "4"], linux: ["watch", "wait"], css: "wait" },
    { id: "cross", label: "Precision", keys: ["cross", "precision", "5"], linux: ["cross", "cross_reverse", "diamond_cross", "tcross"], css: "crosshair" },
    { id: "text", label: "Text Select", keys: ["text", "beam", "xterm", "6"], linux: ["xterm", "text", "ibeam"], css: "text" },
    { id: "handwriting", label: "Handwriting", keys: ["handwriting", "pencil", "7"], linux: ["pencil"], css: "alias" },
    { id: "unavailable", label: "Unavailable", keys: ["unavailable", "forbidden", "no", "8"], linux: ["crossed_circle", "circle"], css: "not-allowed" },
    { id: "vertical", label: "Vertical Resize", keys: ["vert", "ns", "9"], linux: ["v_double_arrow", "n-resize", "s-resize", "ns-resize", "size_ver", "sb_v_double_arrow"], css: "ns-resize" },
    { id: "horizontal", label: "Horizontal Resize", keys: ["horz", "ew", "10"], linux: ["h_double_arrow", "e-resize", "w-resize", "ew-resize", "size_hor", "sb_h_double_arrow"], css: "ew-resize" },
    { id: "diag1", label: "Diagonal 1 (NW-SE)", keys: ["dgn1", "nwse", "11"], linux: ["nwse-resize", "size_fdiag", "bd_double_arrow"], css: "nwse-resize" },
    { id: "diag2", label: "Diagonal 2 (NE-SW)", keys: ["dgn2", "nesw", "12"], linux: ["nesw-resize", "size_bdiag", "fd_double_arrow"], css: "nesw-resize" },
    { id: "move", label: "Move", keys: ["move", "fleur", "13"], linux: ["fleur", "all-scroll"], css: "move" },
    { id: "alt", label: "Alternate Select", keys: ["alternate", "up", "14"], linux: ["sb_up_arrow"], css: "cell" },
    { id: "link", label: "Link Select", keys: ["link", "hand", "pointer", "15"], linux: ["hand", "hand1", "hand2", "pointer"], css: "pointer" }
];

const state = {
    assignments: {},
    unassigned: []
};

function clearContents(...elements) {
    for (const element of elements)
    element.innerHTML = ``;
}

function render() {
    const grid = document.getElementById(`cursor-grid`);
    const tray = document.getElementById(`tray-content`);
    clearContents(grid, tray);

    cursors.forEach(cursor => {
        const slot = document.createElement(`div`);
                slot.classList.add(`slot`);
                slot.setAttribute('data-slot-id', cursor.id);

        if (state.assignments[cursor.id]) {
            let file = state.assignments[cursor.id];
            slot.innerHTML = `
                <div class="cursor-label">${cursor.label}</div>
                <div class="file-name">${file.name}</div>
                <button onclick="unassign('${cursor.id}')">Unassign</button>
            `;
            console.log(`${cursor.label} is assigned to: ${file.name}`)
        } else {
            slot.innerHTML = `
                <div class="cursor-label">${cursor.label}</div>
                <div class="drag-drop">Drag/Drop here</div>
            `;
            console.log(`${cursor.id} is empty.`)
        }
        grid.appendChild(slot);

        // ADD SORTABLE.JS HERE
        // TO "DEPRECATE" EVENT LISTENERS

    slot.addEventListener('dragover', i =>
        i.preventDefault()); // Permit dropping

    slot.addEventListener('drop', i => {
        i.preventDefault();
        drop(i, cursor.id);});
    });
}

function unassign(id) {
    const file = state.assignments[id];
    delete state.assignments[id];
    
    const isDuplicate = Object.values(state.assignments).includes(file);
    const existingTrayItem = state.unassigned.includes(file);
    if (!isDuplicate && !existingTrayItem) {
        state.unassigned.push(file);
    }
    render();
}

function drop(event, targetId) {
    const files = event.dataTransfer.files; // accept dropped files
    
// take the first dropped file
    if (files.length > 0) {
        const file = files[0];

    // is the file actually a cursor?
        if (!file.name.endsWith('.cur') && !file.name.endsWith('.ani')) {
            console.warn("Cursor files must be a valid file type.");
            return;
        }
        
        // if target slot is occupied, unassign existing file
        if (state.assignments[targetId]) {
            unassign(targetId); 
        }

        // assign the new file to the target slot
        state.assignments[targetId] = file;
        
        // if file was in Unassigned list, remove it from that list
        state.unassigned = state.unassigned.filter(f => f.name !== file.name);


        render();
    }    
};

render()