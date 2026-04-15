// SortableJS is imported in the index <head>.

const state = {
    assignments: {},
    unassigned: []
};

// unused. will be unecessary with my 11ty technique
// and with reparenting drag n drop code.
function clearHTML(...elements) {
    elements.forEach(e => (e.innerHTML = ``))
};

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
        group: {
            name: `cursors`,
            put: (to) => {
                if (to.el.id === `tray-content`) return true;
                return to.el.children.length === 0;
            }
        },
        animation: 150,
        ghostClass: `sortable-ghost`,
        // onAdd: (evt) => {
        //     const item = evt.item;
        //     const target = evt.to.closest(`.slot`);

        //     if (target) {
        //         const cursorID = target.getAttribute(`data-cursor-id`);
        //         target.setAttribute(`data-assigned`, `true`);
        //         console.log(`Assigned cursor to ${cursorID}`);
        //     } else {
        //         evt.from.closest(`.slot`)?.setAttribute(`data-assigned`, `false`);
        //     }
        // }
        onAdd: (evt) => {
            const target = evt.to.closest(`.slot`);
            const source = evt.from.closest(`.slot`);

            // If moved INTO a slot
            if (target) {
                target.setAttribute(`data-assigned`, `true`);
            }

            // If moved OUT OF a slot (back to tray)
            if (source && !evt.to.closest('.slot')) {
                source.setAttribute(`data-assigned`, `false`);
            }
        },
        onRemove: (evt) => {
            const source = evt.from.closest(`.slot`);
            if (source) {
                source.setAttribute(`data-assigned`, `false`);
            }
        }

    });
});

const extensions = {
    windows: [`.cur`, `.ani`],
    linux: [`.xcursor`, `.cursor`]
};

// Allow items to be dropped in while being dragged over the page.
// This feels so unnecesarry but it literally does not work otherwise. 
window.addEventListener(`dragover`, (e) => {
    e.preventDefault();
})

window.addEventListener(`drop`, (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    if (files.length > 0) {
        Array.from(files).forEach(file => {
            
            const isWindowsFile = extensions.windows.some(ext => file.name.endsWith(ext));
            if (!isWindowsFile && !isLinuxFile) {
                alert(`${file.name} is not a supported filetype!`);
            }
            if (isWindowsFile) {
                // alert(`${file.name} accepted.`);
                addToTray(file, `windows`);
            }

        });
    }
});

function addToTray(file, OS) {
    const tray = document.getElementById(`tray-content`);
    const div = document.createElement(`div`);
    div.className = `cursor-item`;
    // div.setAttribute(`draggable`, `true`);
    div.setAttribute(`data-operating-system`, `${OS}`)
    div.setAttribute(`title`, `${OS}`)

    const fileURL = URL.createObjectURL(file);
    
    div.innerHTML = `
        <div class="file-icon">
            <img src="${fileURL}" class="pixelart" alt="${file.name}">
        </div>
        <div class="file-name">"${file.name}"</div>
        <div data-operating-system="${OS}" class="cursor-os"></div>
        `;

    div._fileReference = file;

    tray.appendChild(div);
}

const resizer = document.getElementById('main-resize-bar');
const layout = document.querySelector('.main-layout');

resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
});

function handleMouseMove(e) {
    // G: this is not a correct offset. it snaps far off to the side of my cursor. why not use dx of initial and current mouse position?
    const newWidth = window.innerWidth - e.clientX - 45;
    
    // G: why not just set the width of .tray and leave this defined as `1fr 10px auto` in css?:
    document.getElementById(`cursor-tray`).style.width = `${newWidth}px`;
}

function stopResizing() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
}