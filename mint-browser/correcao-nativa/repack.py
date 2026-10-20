from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import copy
import hashlib

root = Path(__file__).resolve().parent
base = Path('/workspace/work/signed/compact-aligned-debugSigned.apk')
assert hashlib.sha256(base.read_bytes()).hexdigest() == '270f7511042ce78f78b925dda17012ab432e329f8482337defbc44c3c4e9d64d'
with ZipFile(root / 'assembled.apk') as compiled:
    changes = {name: compiled.read(name) for name in ['classes.dex', 'classes2.dex', 'classes3.dex']}
for name in ['mint-rebuilt.js', 'mint-config-prefix.js']:
    changes['assets/' + name] = (root / 'assets' / name).read_bytes()
changes['assets/mint-matrix.html'] = (root / 'decoded/assets/mint-matrix.html').read_bytes()

with ZipFile(base) as source:
    with ZipFile(root / 'v263-unsigned.apk', 'w') as target:
        seen = set()
        for item in source.infolist():
            name = item.filename
            upper = name.upper()
            if upper.startswith('META-INF/') and (upper.endswith(('.SF', '.RSA', '.DSA', '.EC')) or upper == 'META-INF/MANIFEST.MF'):
                continue
            target.writestr(copy(item), changes[name] if name in changes else source.read(name))
            seen.add(name)
        for name, content in changes.items():
            if name not in seen:
                target.writestr(name, content, compress_type=ZIP_DEFLATED)
    with ZipFile(root / 'v263-unsigned.apk') as result:
        for name in ['AndroidManifest.xml', 'resources.arsc', 'classes4.dex']:
            assert result.read(name) == source.read(name), name
        for name, content in changes.items():
            assert result.read(name) == content, name
        assert result.testzip() is None
print('Repacked original release; native CAPTCHA DEX, resources, manifest and Matrix layout retained.')
