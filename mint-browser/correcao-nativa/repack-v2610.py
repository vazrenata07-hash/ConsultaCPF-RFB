from pathlib import Path
from zipfile import ZipFile
from copy import copy
root=Path(__file__).resolve().parent
with ZipFile(root/'assembled.apk') as compiled:
    changes={name:compiled.read(name) for name in ['classes.dex','classes2.dex','classes3.dex']}
changes['assets/mint-rebuilt.js']=(root/'assets/mint-rebuilt.js').read_bytes()
with ZipFile(root/'MODmint.apk') as source,ZipFile(root/'v2610-unsigned.apk','w') as target:
    for entry in source.infolist():
        name=entry.filename;upper=name.upper()
        if upper.startswith('META-INF/') and (upper.endswith(('.SF','.RSA','.DSA','.EC')) or upper=='META-INF/MANIFEST.MF'):
            continue
        target.writestr(copy(entry),changes.get(name,source.read(name)))
print('Repacked directly from MODmint.apk; classes4.dex and all other base entries retained.')
