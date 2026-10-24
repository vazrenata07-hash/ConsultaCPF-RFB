from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import copy
root=Path(__file__).resolve().parent
base=Path('/workspace/work/v2610/Mint-Browser-v26.10-Base-MODmint-Bloqueio.apk')
with ZipFile(root/'assembled.apk') as compiled:
    changed_dex=compiled.read('classes3.dex')
with ZipFile(base) as source,ZipFile(root/'v2611-unsigned.apk','w') as target:
    for entry in source.infolist():
        name=entry.filename;upper=name.upper()
        if upper.startswith('META-INF/') and (upper.endswith(('.SF','.RSA','.DSA','.EC')) or upper=='META-INF/MANIFEST.MF'):
            continue
        target.writestr(copy(entry),changed_dex if name=='classes3.dex' else source.read(name))
    target.writestr('assets/mint-debugger.js',(root/'assets/mint-debugger.js').read_bytes(),compress_type=ZIP_DEFLATED)
print('Repacked V26.10: changed only classes3.dex and added independent mint-debugger.js asset; original script and DEX1/2/4 preserved.')
