import { Sortable } from "sortablejs";

const cursors = {{ cursors | json }};

const state = {
    assignments: {},
    unassigned: []
};

// unused. will be unecessary with my 11ty technique
// and with reparenting drag n drop code.
function clearHTML(...elements) {
    for (const element of elements)
    element.innerHTML = ``;
}

// //
// const slots = document.getElementsByClassName(`slot`);
// slots.forEach(slot => {
//     slot.addEventListener('dragover', i =>
//         i.preventDefault()); // Permit dropping

//     slot.addEventListener('drop', i => {
//         i.preventDefault();
//         drop(i);
//     });
// });

// // 
// const slotItems = document.getElementsByClassName(`slot-item`);
// slotItems.forEach(item => {
//     item.addEventListener(`dragstart`, i =>
//         i.preventDefault()); // is this even necessary?
// });

document.querySelectorAll(`.sortable-zone`).forEach(zone => {
    new Sortable(zone, {
        group: `cursors`,
        animation: 0,
        ghostClass: `sortable-ghost`,
        onAdd: (evt) => {
            const item = evt.item;
            const target = evt.to.closest(`.slot`);

            if (target) {
                const cursorID = target.getAttribute(`data-cursor-id`);
                target.setAttribute(`data-assigned`, `true`);
                console.log(`Assigned cursor to ${cursorID}`);
            } else {
                evt.from.closest(`.slot`)?.setAttribute(`data-assigned`, `false`);
            }
        }
    });
});

window.addEventListener(`drop`, (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    if (files.length > 0) {
        files.forEach(file => {
            if (file.name.endsWith(`.cur`) || file.name.endsWith('.ani')) {
                addToTray(file);
            }
        });
    }
});

function addToTray(file) {
    const tray = document.getElementById(`tray-content`);
    const div = document.createElement(`div`)
    div.className = `cursor-item`;
    div.innerHTML = `
        <img src="/assets/stupid-cursor.png">
        <div class="file-name">${file.name}</div>
    `;

    div._fileReference = file;
}

// LAST CODED HERE

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