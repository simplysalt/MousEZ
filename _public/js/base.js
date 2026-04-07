        const slotsConfig = [
            { id: "pointer", label: "Normal Select", keys: ["normal", "default", "arrow", "1"], linux: ["left_ptr", "default", "arrow", "top_left_arrow"], css: "default" },
            { id: "help", label: "Help Select", keys: ["help", "question", "2"], linux: ["help", "left_ptr_help", "question_arrow"], css: "help" },
            { id: "work", label: "Working", keys: ["work", "progress", "background", "3"], linux: ["left_ptr_watch", "progress"], css: "progress" },
            { id: "busy", label: "Busy", keys: ["busy", "wait", "watch", "4"], linux: ["watch", "wait"], css: "wait" },
            { id: "cross", label: "Precision", keys: ["cross", "precision", "5"], linux: ["cross", "cross_reverse", "diamond_cross", "tcross"], css: "crosshair" },
            { id: "text", label: "Text Select", keys: ["text", "beam", "xterm", "6"], linux: ["xterm", "text", "ibeam"], css: "text" },
            { id: "hand", label: "Handwriting", keys: ["handwriting", "pencil", "7"], linux: ["pencil"], css: "alias" },
            { id: "unavailable", label: "Unavailable", keys: ["unavailable", "forbidden", "no", "8"], linux: ["crossed_circle", "circle"], css: "not-allowed" },
            { id: "vert", label: "Vertical Resize", keys: ["vert", "ns", "9"], linux: ["v_double_arrow", "n-resize", "s-resize", "ns-resize", "size_ver", "sb_v_double_arrow"], css: "ns-resize" },
            { id: "horz", label: "Horizontal Resize", keys: ["horz", "ew", "10"], linux: ["h_double_arrow", "e-resize", "w-resize", "ew-resize", "size_hor", "sb_h_double_arrow"], css: "ew-resize" },
            { id: "dgn1", label: "Diagonal 1 [NW-SE]", keys: ["dgn1", "nwse", "11"], linux: ["nwse-resize", "size_fdiag", "bd_double_arrow"], css: "nwse-resize" },
            { id: "dgn2", label: "Diagonal 2 [NE-SW]", keys: ["dgn2", "nesw", "12"], linux: ["nesw-resize", "size_bdiag", "fd_double_arrow"], css: "nesw-resize" },
            { id: "move", label: "Move", keys: ["move", "fleur", "13"], linux: ["fleur", "all-scroll"], css: "move" },
            { id: "alternate", label: "Alternate Select", keys: ["alternate", "up", "14"], linux: ["sb_up_arrow"], css: "cell" },
            { id: "link", label: "Link Select", keys: ["link", "hand", "pointer", "15"], linux: ["hand", "hand1", "hand2", "pointer"], css: "pointer" }
        ];

        const state = {
            assignments: {}, 
            unassigned: [],
            dontAskAgain: false,
            previewEnabled: false,
            objectUrls: new Map()
        };

        const gridEl = document.getElementById('cursor-grid');
        const trayEl = document.getElementById('tray-content');
        const themeInput = document.getElementById('theme-name');
        const overlay = document.getElementById('drop-zone-overlay');
        const modalContainer = document.getElementById('modal-container');
        const previewBtn = document.getElementById('btn-toggle-preview');

        slotsConfig.forEach(slot => {
            const div = document.createElement('div');
            div.className = 'slot';
            div.dataset.slotId = slot.id;
            div.addEventListener('dragover', e => { e.preventDefault(); div.classList.add('drag-over'); });
            div.addEventListener('dragleave', () => div.classList.remove('drag-over'));
            div.addEventListener('drop', e => {
                e.preventDefault();
                div.classList.remove('drag-over');
                const dragData = e.dataTransfer.getData('application/json');
                if (!dragData) return;
                handleDropToSlot(JSON.parse(dragData), slot.id);
            });
            gridEl.appendChild(div);
        });

        window.addEventListener('dragover', e => {
            e.preventDefault();
            if (!e.dataTransfer.types.includes('application/json')) overlay.style.display = 'flex';
        });

        window.addEventListener('dragleave', e => { if (e.relatedTarget === null) overlay.style.display = 'none'; });

        window.addEventListener('drop', async e => {
            if (e.dataTransfer.types.includes('application/json')) return;
            e.preventDefault();
            overlay.style.display = 'none';
            const items = e.dataTransfer.items;
            for (let i = 0; i < items.length; i++) {
                const entry = items[i].webkitGetAsEntry();
                if (entry) await traverseEntry(entry);
            }
            render();
        });

        async function traverseEntry(entry) {
            if (entry.isFile) {
                const file = await new Promise(resolve => entry.file(resolve));
                if (file.name.endsWith('.cur') || file.name.endsWith('.ani')) processNewFile(file);
            } else if (entry.isDirectory) {
                const reader = entry.createReader();
                const entries = await new Promise(resolve => reader.readEntries(resolve));
                for (const child of entries) await traverseEntry(child);
            }
        }

        function processNewFile(file) {
            if (state.unassigned.some(f => f.name === file.name) || Object.values(state.assignments).some(f => f.name === file.name)) return;
            const name = file.name.toLowerCase();
            let matchedSlot = null;
            const numMatch = name.match(/[\[\(](\d+)[\]\)]/);
            if (numMatch) matchedSlot = slotsConfig.find(s => s.keys.includes(numMatch[1]));
            if (!matchedSlot) matchedSlot = slotsConfig.find(s => s.keys.some(k => name.includes(k)));
            if (matchedSlot && !state.assignments[matchedSlot.id]) state.assignments[matchedSlot.id] = file;
            else state.unassigned.push(file);
        }

        async function handleDropToSlot(data, targetSlotId) {
            const sourceSlotId = data.sourceSlotId;
            const sourceIndex = data.sourceIndex;
            const isCopy = data.isCopy;
            
            // Determine source file safely
            let sourceFile;
            if (sourceSlotId !== undefined) {
                sourceFile = state.assignments[sourceSlotId];
            } else if (sourceIndex !== undefined) {
                sourceFile = state.unassigned[sourceIndex];
            }

            if (!sourceFile) return;

            const targetFile = state.assignments[targetSlotId];
            if (targetFile) {
                if (targetFile.name === sourceFile.name) return;
                
                if (!state.dontAskAgain) {
                    const confirm = await showSwapModal();
                    if (confirm === 'no') return;
                    if (confirm === 'always') state.dontAskAgain = true;
                }
                
                // Safe unassign current occupant
                const fileToMove = state.assignments[targetSlotId];
                delete state.assignments[targetSlotId];
                moveFileToTray(fileToMove);
            }

            // Execute the assignment
            if (sourceSlotId !== undefined) {
                if (!isCopy) delete state.assignments[sourceSlotId];
            } else if (sourceIndex !== undefined) {
                // Ensure index is still valid before splicing
                if (state.unassigned[sourceIndex] === sourceFile) {
                    state.unassigned.splice(sourceIndex, 1);
                }
            }

            state.assignments[targetSlotId] = sourceFile;
            render();
        }

        let modalResolve;
        function showSwapModal() {
            modalContainer.style.display = 'flex';
            return new Promise(resolve => { modalResolve = resolve; });
        }
        function closeModal(choice) {
            modalContainer.style.display = 'none';
            if (modalResolve) modalResolve(choice);
        }
        document.getElementById('modal-yes').onclick = () => closeModal('yes');
        document.getElementById('modal-always').onclick = () => closeModal('always');
        document.getElementById('modal-no').onclick = () => closeModal('no');
        modalContainer.onclick = (e) => { if(e.target === modalContainer) closeModal('no'); };
        window.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal('no'); });

        previewBtn.onclick = () => {
            state.previewEnabled = !state.previewEnabled;
            previewBtn.textContent = `Preview Cursors: ${state.previewEnabled ? 'ON' : 'OFF'}`;
            previewBtn.classList.toggle('active', state.previewEnabled);
            render();
        };

        function render() {
            trayEl.innerHTML = '';
            state.unassigned.forEach((file, index) => {
                const div = document.createElement('div');
                div.className = 'cursor-item';
                div.draggable = true;
                div.textContent = file.name;
                div.addEventListener('dragstart', e => { e.dataTransfer.setData('application/json', JSON.stringify({ sourceIndex: index })); });
                trayEl.appendChild(div);
            });

            document.querySelectorAll('.slot').forEach(slotDiv => {
                const slotId = slotDiv.dataset.slotId;
                const file = state.assignments[slotId];
                const config = slotsConfig.find(s => s.id === slotId);
                slotDiv.innerHTML = `<div class="slot-label">${config.label}</div>`;
                
                if (state.previewEnabled) {
                    if (file) {
                        let url = state.objectUrls.get(file);
                        if (!url) {
                            url = URL.createObjectURL(file);
                            state.objectUrls.set(file, url);
                        }
                        slotDiv.style.cursor = `url(${url}), auto`;
                    } else {
                        slotDiv.style.cursor = config.css;
                    }
                } else {
                    slotDiv.style.cursor = 'default';
                }

                if (file) {
                    const item = document.createElement('div');
                    item.className = 'cursor-item';
                    item.draggable = true;
                    item.textContent = file.name;
                    item.addEventListener('dragstart', e => { e.dataTransfer.setData('application/json', JSON.stringify({ sourceSlotId: slotId })); });
                    slotDiv.appendChild(item);
                    const copyHandle = document.createElement('div');
                    copyHandle.className = 'drag-copy-handle';
                    copyHandle.textContent = '⧉ Drag Copy';
                    copyHandle.draggable = true;
                    copyHandle.addEventListener('dragstart', e => { e.dataTransfer.setData('application/json', JSON.stringify({ sourceSlotId: slotId, isCopy: true })); });
                    slotDiv.appendChild(copyHandle);
                    const unassignBtn = document.createElement('button');
                    unassignBtn.className = 'btn-unassign';
                    unassignBtn.textContent = 'Unassign';
                    unassignBtn.onclick = () => unassign(slotId);
                    slotDiv.appendChild(unassignBtn);
                } else {
                    const hint = document.createElement('div');
                    hint.className = 'empty-hint';
                    hint.textContent = 'Drop here';
                    slotDiv.appendChild(hint);
                }
            });
        }

        function moveFileToTray(file) {
            if (!file) return;
            const alreadyInTray = state.unassigned.some(f => f.name === file.name);
            const stillAssigned = Object.values(state.assignments).some(f => f === file);
            if (!alreadyInTray && !stillAssigned) {
                state.unassigned.push(file);
            }
        }

        function unassign(slotId) {
            const file = state.assignments[slotId];
            if (file) {
                delete state.assignments[slotId];
                moveFileToTray(file);
                render();
            }
        }

        document.getElementById('btn-unassign-all').onclick = () => {
            const assigned = { ...state.assignments };
            Object.keys(assigned).forEach(slotId => {
                const file = state.assignments[slotId];
                delete state.assignments[slotId];
                moveFileToTray(file);
            });
            render();
        };

        document.getElementById('btn-auto-fill').onclick = () => {
            const assignedFiles = Object.values(state.assignments);
            if (assignedFiles.length === 0) return;

            slotsConfig.forEach(slot => {
                if (!state.assignments[slot.id]) {
                    for (const file of assignedFiles) {
                        const name = file.name.toLowerCase();
                        const numMatch = name.match(/[\[\(](\d+)[\]\)]/);
                        if ((numMatch && slot.keys.includes(numMatch[1])) || slot.keys.some(k => name.includes(k))) {
                            state.assignments[slot.id] = file;
                            break;
                        }
                    }
                }
            });

            const selectCluster = ['link', 'help', 'alternate'];
            const fallbackPairs = { 'busy': 'work', 'work': 'busy', 'horz': 'vert', 'vert': 'horz', 'dgn1': 'dgn2', 'dgn2': 'dgn1' };

            slotsConfig.forEach(slot => {
                if (!state.assignments[slot.id]) {
                    if (selectCluster.includes(slot.id)) {
                        state.assignments[slot.id] = 
                            state.assignments['link'] || 
                            state.assignments['help'] || 
                            state.assignments['alternate'] || 
                            state.assignments['pointer'];
                    } 
                    else if (fallbackPairs[slot.id]) {
                        const otherId = fallbackPairs[slot.id];
                        if (state.assignments[otherId]) {
                            state.assignments[slot.id] = state.assignments[otherId];
                        }
                    }
                }
            });
            render();
        };

        document.getElementById('btn-generate').addEventListener('click', async () => {
            const themeName = themeInput.value.trim() || "MyCustomTheme";
            const zip = new JSZip();
            const winFolder = zip.folder("Windows");
            let infStrings = "", infCopyList = "", infSourceFiles = "", regValues = [];
            const linRoot = zip.folder("Linux").folder(themeName);
            const linCursors = linRoot.folder("cursors");
            linRoot.file("index.theme", `[Icon Theme]\nName=${themeName}\nComment=Converted via Web Tool\nInherits=adwaita\n`);
            
            const uniqueFilesToPackage = new Set(Object.values(state.assignments));

            slotsConfig.forEach(slot => {
                const file = state.assignments[slot.id];
                if (file) {
                    if (uniqueFilesToPackage.has(file)) { 
                        winFolder.file(file.name, file); 
                        uniqueFilesToPackage.delete(file); 
                    }
                    infStrings += `${slot.id} = "${file.name}"\n`;
                    infCopyList += `"${file.name}"\n`;
                    infSourceFiles += `"${file.name}" = 1\n`;
                    regValues.push(`%10%\\%CUR_DIR%\\%${slot.id}%`);
                    slot.linux.forEach(alias => { linCursors.file(alias, file); });
                } else regValues.push(""); 
            });
            const infContent = `[Version]\nsignature="$CHICAGO$"\n\n[DefaultInstall]\nCopyFiles = Scheme.Cur\nAddReg    = Scheme.Reg\n\n[DestinationDirs]\nScheme.Cur = 10, "%CUR_DIR%"\n\n[SourceDisksNames]\n1 = "Cursor Root",,\n\n[SourceDisksFiles]\n${infSourceFiles}\n\n[Scheme.Reg]\nHKCU,"Control Panel\\Cursors\\Schemes","%SCHEMENAME%",0x00000000,"${regValues.join(',')}"\n\n[Scheme.Cur]\n${infCopyList}\n\n[Strings]\nCUR_DIR       = "Cursors\\${themeName}"\nSCHEMENAME    = "${themeName}"\n${infStrings}`;
            winFolder.file("install.inf", infContent);
            const content = await zip.generateAsync({ type: "blob" });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download = `${themeName}_package.zip`;
            a.click();
        });

        render();