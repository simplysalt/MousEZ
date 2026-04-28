// SortableJS is imported in the HTML <head>.

if (!Sortable) {
    alert(`Dependency SortableJS couldn't be fetched.\n`+
        `Perhaps... try again?`);
};

const state = {
    // Auto-create object keys for every ID in ${cursors}
    // "acc" is short for accumulator 
    assignments: cursors.reduce((acc, cursor) => {
        acc[cursor.id] = null;
        return acc;
    }, {}),
    unassigned: []
};
console.log("Init'd with IDs:", Object.keys(state.assignments));

const tray = document.getElementById(`tray-content`);
const slots = document.querySelectorAll(`.slot`);
const cursorItem = ".cursor-item"
const unassignBtn = ".btn-unassign"
const copyBtn = ".btn-copy-handle"
let pageModified = false;

function syncState() {
    slots.forEach(slot => {
        const slotId = slot.getAttribute(`data-cursor-id`);
        const item = slot.querySelector(`.cursor-item`);

        state.assignments[slotId] = item ? {
            ogFile: item._fileReference,
            name: item.getAttribute(`title`),
            os: item.getAttribute(`data-operating-system`),
        } : null;
    });

    state.unassigned = Array.from(tray.querySelectorAll(`.cursor-item`)).map(item => ({
        name: item.getAttribute(`title`),
        fileReference: item._fileReference,
    }));
    pageModified = true;
    console.log(`[EZ-CUR] Assignment state:`, state.assignments, state.unassigned);
}

new Sortable(tray, {
    group: {
        name: "cursors",
        // pull: true,
        // put: true,
    },
    onEnd: () => syncState(),
    // i DO want to sort inside of the tray. i don't want the tray to use the swap operation.
    draggable: cursorItem,
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
      pull: () => isCloning ? 'clone' : true,
    },
    // swap: true,
    swapClass: 'sortable-swap-highlight',
    filter: '.cursor-label, .drag-drop, .filtered',
    preventOnFilter: true,
    // draggable: cursorItem,
    animation: 150,
    ghostClass: 'sortable-ghost',

    // onMove: (evt) => {
    //     const swapping = evt.from.classList.contains(`.slot`);
    //     console.log(swapping); return true;
    // },

    onAdd:(evt) => {
      syncState();
      evt.to.setAttribute('data-assigned', 'true');
      // const item = evt.item;
      // const newId = randId(8);
      // const newAnchor = `--${newId}`

      // item.style.anchorName = newAnchor;

      // const slotActions = item.querySelector('.slot-actions');

      // if (slotActions) slotActions.style.positionAnchor = newAnchor;

      // console.log(`Slot add: New ID ${newAnchor} to item.`);
    },
    onRemove: (evt) => {
        evt.from.setAttribute('data-assigned', 'false');
        syncState();
    },

    // none of the other event types (onMove, onUpdate, etc.) work either. i tested a few
    onEnd: () => {
      syncState();
      console.log(`drag end event triggered`);
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

// window.addEventListener('beforeunload', (e) => {
//   if (pageModified === true) {
//     e.preventDefault();
//     e.returnValue = '';
//   }
// });

// Allow items to be dropped in while being dragged over the page.
// This feels so unnecesarry but it literally does not work otherwise. 
window.addEventListener('click', (e) => {
  try {
    const btn = e.target.closest(unassignBtn);
    if (!btn) return;

    const item = btn.closest(`.cursor-item`);
    const slot = item.closest(`.slot`)
    if (slot) {
      if (!item._fileReference) {
        tray.appendChild(item);
      } else {
        const isDuplicate = Array.from(tray.children).some(
            child => child._fileReference && child.getAttribute('title') === item.getAttribute('title')
        );
        if (isDuplicate) {
            item.remove();
        } else {
            tray.appendChild(item);
        }
      }
        slot.setAttribute('data-assigned', 'false');
        syncState();
    }
  } catch(err) {
    console.error(`Click event error`, err)
  };
})

const dropZone = document.getElementById(`drop-zone-overlay`);
let dragCounter = 0;
window.addEventListener(`dragenter`, (e) => {
  e.preventDefault();
  dragCounter++;
  dropZone.setAttribute(`visible`, `true`);
});

window.addEventListener(`dragover`, (e) => {
  e.preventDefault();
  // e.dataTransfer.dropEffect = "copy";
});

window.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dragCounter--;
  if (dragCounter <= 0) {
    dropZone.setAttribute('visible', `false`);
  }
});

window.addEventListener(`drop`, (e) => {
    e.preventDefault();
    dragCounter = 0;
    dropZone.setAttribute('visible', `false`);

    const files = e.dataTransfer.files;

    if (files.length > 0) {
        Array.from(files).forEach(file => {
            
            const isWindowsFile = extensions.windows.some(ext => file.name.endsWith(ext));
            const isLinuxFile = extensions.linux.some(ext => file.name.endsWith(ext));
            if (!isWindowsFile && !isLinuxFile) {
                // alert(`"${file.name}" is the wrong file type!\n`+
                //     `Must be one of the following:\n`+
                //     `- .CUR \n- .ANI\n- .XCURSOR\n- .CURSOR `);
                return;
            }
            if (isWindowsFile || isLinuxFile) {
                addToTray(file, isWindowsFile ? 'windows' : 'linux');
            }

        });
    }
});
function randId(length) {
    if (!length) {console.log('Provide a length value.'); return "";}
    return Math.random().toString(36).substring(2, 2 + length)}
    
function addToTray(file, OS) {
    const tray = document.getElementById(`tray-content`);
    const div = document.createElement(`div`);
    const id = randId(8);
    div.className = `cursor-item`;
    div.setAttribute(`draggable`, `true`);
    div.setAttribute(`data-operating-system`, `${OS}`);
    div.setAttribute(`title`, `${file.name}`);
    
    console.log(id);
    
    const fileURL = URL.createObjectURL(file);
    
    div.innerHTML = `
    <div class="file-icon pixelart">
    <img src="${fileURL}" alt="${file.name}" class="debug"></div>
    <div class="file-name">"${file.name}"</div>
    <div data-operating-system="${OS}" class="cursor-os"></div>
    
    <div class="slot-actions">
      <div class="btn-copy-handle">⧉</div>
      <div class="btn-unassign filtered">-</div>
    </div>
    `;
    
    div._fileReference = file;
    tray.appendChild(div);
    syncState();
}