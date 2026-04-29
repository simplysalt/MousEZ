// DO NOT MODIFY
const regNames = [
  "Arrow", "Help", "AppStarting", "Wait", "Crosshair",
  "IBeam", "NWPen", "No", "SizeNS", "SizeWE",
  "SizeNWSE", "SizeNESW", "SizeAll", "UpArrow", "Hand"
];

let schemeName = "cool custom cursors"

const regValues = regNames.map(key => {
  const file = userUploads[key];
  // if file exists, return path. otherwise, return empty string
  return file ? `%10%\\cursors\\${schemeName}\\${file}` : "";
}).join(",");

const regLine = `HKCU,"Control Panel\\Cursors\\Schemes","${schemeName}",,${regValues}"`;

const infTemplate = `
[Version]
signature="$Windows NT$"

[DefaultInstall]
CopyFiles = Scheme.Cur
AddReg    = Scheme.Reg

[DestinationDirs]
Scheme.Cur = 10,"Cursors\\${schemeName}"

[Scheme.Reg]
${regLine}

[Scheme.Cur]
${Object.values(userUploads).filter(f => f).join('\n')}

[Strings]
; where mah strings at :interrobang:
${stringsSection}
`;