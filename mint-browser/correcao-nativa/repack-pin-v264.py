from pathlib import Path
from zipfile import ZipFile
from copy import copy
import hashlib

root = Path(__file__).resolve().parent
base = Path('/workspace/work/v263/Mint-Browser-v26.3-DNS-Mines-Ajustavel.apk')
assert hashlib.sha256(base.read_bytes()).hexdigest() == '1aff3a50b6394abb40784ff16712c5127898c651042d1ed1495a6562531dae64'
script = (root/'assets/mint-rebuilt.js').read_bytes()
with ZipFile(base) as source:
    with ZipFile(root/'v264-unsigned.apk', 'w') as target:
        for entry in source.infolist():
            name = entry.filename
            upper = name.upper()
            if upper.startswith('META-INF/') and (upper.endswith(('.SF','.RSA','.DSA','.EC')) or upper == 'META-INF/MANIFEST.MF'):
                continue
            target.writestr(copy(entry), script if name == 'assets/mint-rebuilt.js' else source.read(name))
    with ZipFile(root/'v264-unsigned.apk') as result:
        assert result.testzip() is None
        for name in source.namelist():
            if name.startswith('META-INF/') or name == 'assets/mint-rebuilt.js':
                continue
            assert result.read(name) == source.read(name), name
print('Repacked V26.3; only the withdrawal PIN JavaScript changed.')
