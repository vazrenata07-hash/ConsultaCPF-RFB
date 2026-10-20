from pathlib import Path
from zipfile import ZipFile
from copy import copy
root=Path(__file__).resolve().parent
base=Path('/workspace/work/v266/Mint-Browser-v26.6-Saque-10ms.apk')
with ZipFile(root/'assembled.apk') as compiled:
    changes={name:compiled.read(name) for name in ['classes.dex','classes2.dex','classes3.dex']}
changes['assets/mint-rebuilt.js']=(root/'assets/mint-rebuilt.js').read_bytes()
with ZipFile(base) as source,ZipFile(root/'v267-unsigned.apk','w') as target:
    for entry in source.infolist():
        name=entry.filename;upper=name.upper()
        if upper.startswith('META-INF/') and (upper.endswith(('.SF','.RSA','.DSA','.EC')) or upper=='META-INF/MANIFEST.MF'):
            continue
        target.writestr(copy(entry),changes[name] if name in changes else source.read(name))
