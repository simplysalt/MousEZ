// SortableJS AND InteractJS are imported in the index <head>.

if (!Sortable) {
    alert(`There's been an issue.\n`+
        `Dependency SortableJS couldn't be fetched.`);
};

// if (split) {
//     alert(`split!`);
// }

// if (typeof interact !== 'undefined') {
//     // library is available
// } else {
//     alert(`InteractJS seems to be unavailable. Minor inconvenience. Carry on.`);
// }

// interact(`#main-resize-bar`)
//   .draggable({
//     origin: 'self',
//     listeners: {
//       move(event) {
//         // const layout = document.querySelector(`.main-layout`);
        
//         // const rect = layout.getBoundingClientRect();
//         // const newWidth = rect.left - event.clientX;
        
//         // const minMaxWidth = newWidth - 10;
        
//         // layout.style.setProperty(`--tray-width`, `${minMaxWidth}px`)
//         }
//     }
// });
const state = {
    assignments: {},
    unassigned: []
};

cursors.forEach(cursor => {
    console.log(cursor.id, Date.now());
})

// unused. will be unecessary with my 11ty technique
// and with reparenting drag n drop code.
//
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

const tray = document.getElementById(`tray-content`);
const slots = document.querySelectorAll(`.slot`);
const cursorItem = ".cursor-item"
const unassignBtn = ".btn-unassign"
const copyBtn = ".btn-copy-handle"

new Sortable(tray, {
    group: {
        name: "cursors",
        // pull: true,
        // put: true,
    },
    // i DO want to sort inside of the tray. i don't want the tray to use the swap operation.
    draggable: cursorItem,
    // swap: false,
    animation: 150,
    ghostClass: "sortable-ghost",
});

let isCloning = false;
document.addEventListener('mousedown', (e) => {
    isCloning = !!e.target.closest(copyBtn);
});

slots.forEach(slot => {
    new Sortable(slot, {
        group: {
            name: 'cursors',
            put: (to) => {if (to.el.querySelector(cursorItem)) return false},
            pull: () => isCloning? 'clone' : true,
            swap: true, // G-2 says SWAP: FALSE,
        swapClass: 'sortable-swap-highlight',
        filter: '.cursor-label, .drag-drop, .btn-unassign .filtered',
        preventOnFilter: true,
        animation: 150,
        ghostClass: 'sortable-ghost',

        // onMove: (evt) => {
        //     const swapping = evt.from.classList.contains(`.slot`);
        //     console.log(swapping); return true;
        // },

        onAdd: (evt) => {
            evt.to.setAttribute('data-assigned', 'true');
        },
        onRemove: (evt) => {
            evt.from.setAttribute('data-assigned', 'false');
        },
        // G-1
        // onEnd: (evt) => {
        //     if (evt.swapItem && evt.from.classList.contains(`.slot`)) {
        //         const tray = document.getElementById(`tray-cotent`);
        //         tray.appendChild(evt.swapItem);

        //         evt.from.setAttribute('data-assigned', 'false');
        //     }
        // end G-1
        // G-2
        
        // end G-2
        }
    });
});
// document.querySelectorAll(`.sortable-zone`).forEach(zone => {
//     new Sortable(zone, {
//         group: {
//             name: `cursors`,
            
//             put: true,
//             // put: (to) => {
//             //     // Tray always accepts new items
//             //     if (to.el.id === `tray-content`) return true;

//             //     // Slots only accept if they're "empty".
//             //     return !to.el.querySelector(`.cursor-item`);
//             // }
//         },

//         swap: true,
//         swapClass: `sortable-swap-highlight`,
//         draggable: ".cursor-item",

//         animation: 150,
//         ghostClass: `sortable-ghost`,
//         filter: '.filtered, .cursor-label, .drag-drop',
//         preventOnFilter: true,
//         // onAdd: (evt) => {
//         //     const item = evt.item;
//         //     const target = evt.to.closest(`.slot`);

//         //     if (target) {
//         //         const cursorID = target.getAttribute(`data-cursor-id`);
//         //         target.setAttribute(`data-assigned`, `true`);
//         //         console.log(`Assigned cursor to ${cursorID}`);
//         //     } else {
//         //         evt.from.closest(`.slot`)?.setAttribute(`data-assigned`, `false`);
//         //     }
//         // }

//        onAdd: (evt) => {
//             if (evt.to.classList.contains('slot')) {
//                 evt.to.setAttribute('data-assigned', 'true');
//             }
//         },
//         onRemove: (evt) => {
//             if (evt.from.classList.contains('slot')) {
//                 evt.from.setAttribute('data-assigned', 'false');
//             }

//         }
//     })
// });

const extensions = {
    windows: [`.cur`, `.ani`],
    linux: [`.xcursor`, `.cursor`]
};

// Allow items to be dropped in while being dragged over the page.
// This feels so unnecesarry but it literally does not work otherwise. 
window.addEventListener('click', (e) => {
    const btn = e.target.closest(unassignBtn);
    if (!unassignBtn) return;
    const item = btn.closest(cursorItem);
    if (item.closest('.slot')) {
        const isDuplicate = Array.from(tray.children).some(
            child => child.getAttribute('title') === item.getAttribute('title')
        );
    if (isDuplicate) {
        item.remove();
    } else {
        tray.appendChild(item);
    }

    slot.setAttribute('data-assigned', 'false');
    }
})

window.addEventListener(`dragover`, (e) => {
    e.preventDefault();
})

window.addEventListener(`drop`, (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    if (files.length > 0) {
        Array.from(files).forEach(file => {
            
            const isWindowsFile = extensions.windows.some(ext => file.name.endsWith(ext));
            const isLinuxFile = extensions.linux.some(ext => file.name.endsWith(ext));
            if (!isWindowsFile && !isLinuxFile) {
                alert(`"${file.name}" is the wrong file type!\n`+
                    `Must be one of the following:\n`+
                    `- .CUR \n- .ANI\n- .XCURSOR\n- .CURSOR `);
            }
            if (isWindowsFile || isLinuxFile) {
                addToTray(file, isWindowsFile ? 'windows' : 'linux');
            }

        });
    }
});

// TODO: fix "undefined" random ID
const randId = (length = 8) => {
  Math.random().toString(36).substring(2, 2 + length);
}

function addToTray(file, OS) {
    const tray = document.getElementById(`tray-content`);
    const div = document.createElement(`div`);
    const Id = randId(8);
    div.className = `cursor-item`;
    // div.setAttribute(`draggable`, `true`);
    div.setAttribute(`data-operating-system`, `${OS}`);
    div.setAttribute(`title`, `${file.name}`);
    div.style.anchorName = `--${Id}`;

    console.log(Id, randId());

    const fileURL = URL.createObjectURL(file);
    
    div.innerHTML = `
        <div class="file-icon pixelart">
            <img src="${fileURL}"
            class="debug"
            alt="${file.name}"></div>
        <div class="file-name">"${file.name}"</div>
        <div data-operating-system="${OS}" class="cursor-os"></div>
        
        <div class="slot-actions">
            <div class="btn-copy-handle">⧉ Drag Copy</div>
            <div class="btn-unassign"
            style="anchor-scope: --${Id}; position-anchor: --${Id}; position: absolute;
            top: anchor(top); right: anchor(right)">✖</div>
        </div>
        `;

    div._fileReference = file;
    tray.appendChild(div);
}

// const resizer = document.getElementById('main-resize-bar');
// const layout = document.querySelector('.main-layout');

// resizer.addEventListener('mousedown', (e) => {
//     e.preventDefault();
//     document.addEventListener('mousemove', handleMouseMove);
//     document.addEventListener('mouseup', stopResizing);
//     document.body.style.cursor = 'col-resize';
// });

// function handleMouseMove(e) {
//     // G: this is not a correct offset. it snaps far off to the side of my cursor. why not use dx of initial and current mouse position?
//     const newWidth = window.innerWidth - e.clientX - 45;
    
//     // G: why not just set the width of .tray and leave this defined as `1fr 10px auto` in css?:
//     document.getElementById(`cursor-tray`).style.width = `${newWidth}px`;
// }

// function stopResizing() {
//     document.removeEventListener('mousemove', handleMouseMove);
//     document.removeEventListener('mouseup', stopResizing);
//     document.body.style.cursor = 'default';
// }

// Split(['#cursor-grid', '#cursor-tray'], {
//     sizes: [75, 25],
//     ondragstart: function () {
//     document.querySelector(`.gutter`).forEach(e => e.classList.add(`active`))
// },
//     ondragend: function () {
//     document.querySelector(`.gutter`).forEach(e => e.classList.remove(`active`))
// },
//     minSize: [180, 100],
//     expandToMin: true,
//     gutterSize: 5,
//     direction: 'horizontal',
//     cursor: 'col-resize',
//     gutterAlign: 'end',
//     snapOffset: 0,
// })