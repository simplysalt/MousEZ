[version]
signature="$CHICAGO"

[DefaultInstall]
CopyFiles = Scheme.cur
AddReg    = Scheme.red

import { json } from "stream/consumers";

const input = {
    schemeName: document.getElementById(`foo`).value,
}

const scheme = {}
scheme.name = input.schemeName;

console.log(JSON.stringify(scheme));