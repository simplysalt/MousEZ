const cursors = {{ cursors | json }}

const state = {
    assignments: {},
    unassigned: []
};

function clearHTML(...elements) {
    for (const element of elements)
    element.innerHTML = ``;
}

function render() {

    cursors.forEach(cursor => {
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

// render()