"""Configuração Buster reconstruída de ``Contas_pix._configurar_buster``.

O método original sempre gravava ``enableManagedLocalServices: false``.
Esta versão de integração preserva a configuração por padrão. Para mudar
explicitamente, use ``configurar_buster_local(True)`` ou ``False``; a escolha
remota exige que o usuário configure seu próprio serviço nas opções da extensão.

Este arquivo não contém chaves de serviço nem lê o arquivo secrets.txt.
"""

import json
import time
import urllib.request


# Texto literal da constante classe_mp[88].
JS_LER_MODELO_LOCAL = (
    "chrome.storage.local.get('enableManagedLocalServices').then(o => String(o.enableManagedLocalServices))"
)

# Texto literal da constante classe_mp[92]; o original usava sempre esta opção.
JS_DESLIGAR_MODELO_LOCAL_ORIGINAL = (
    "chrome.storage.local.set({enableManagedLocalServices: false})"
)

# Adaptação de integração: opção local explícita, usando a mesma chave.
JS_LIGAR_MODELO_LOCAL = (
    "chrome.storage.local.set({enableManagedLocalServices: true})"
)


class BusterConfigMixin:
    """Requer ``self.driver`` de uma sessão Selenium Chromium já aberta."""

    def _configurar_buster(self):
        """Mantém o nome de integração e preserva a preferência da extensão."""
        return self.configurar_buster_local()

    def configurar_buster_local(self, enable_managed_local_services=None):
        """Preserva ou configura o modo de transcrição da extensão Buster.

        ``None`` preserva a configuração; ``True`` ativa o modelo local;
        ``False`` desliga o local para usar o serviço remoto configurado nas
        opções da extensão. O retorno indica se o worker foi localizado e,
        quando solicitado, se a preferência estabilizou.

        A descoberta do worker, RPC ``_eval``, prazos, intervalo e confirmação
        por quatro leituras reproduzem o fluxo nativo. A escolha de preferência
        foi parametrizada para não ligar um serviço remoto automaticamente.
        """
        if enable_managed_local_services is not None and not isinstance(
            enable_managed_local_services, bool
        ):
            raise TypeError("enable_managed_local_services deve ser bool ou None")

        import websocket as _ws

        try:
            caps = self.driver.capabilities
            opts = caps.get("goog:chromeOptions") or caps.get("chrome") or {}
            addr = opts.get("debuggerAddress", "")
        except Exception:
            addr = ""
        if not addr:
            return False

        conn = None
        try:
            alvo = None
            limite = time.time() + 15
            while time.time() < limite:
                try:
                    with urllib.request.urlopen(
                        "http://" + addr + "/json", timeout=2
                    ) as resp:
                        alvos = json.loads(resp.read().decode("utf-8"))
                    for t in alvos:
                        if (
                            t.get("type") == "service_worker"
                            and "src/background/script.js" in t.get("url", "")
                        ):
                            alvo = t
                            break
                except Exception:
                    pass
                if alvo:
                    break
                time.sleep(0.3)

            if not alvo:
                print("[buster] service worker não apareceu — a extensão não carregou")
                return False

            conn = _ws.create_connection(
                alvo["webSocketDebuggerUrl"], suppress_origin=True, timeout=10
            )
            contador = [0]

            def _eval(expr):
                contador[0] += 1
                ident = contador[0]
                conn.send(
                    json.dumps(
                        {
                            "id": ident,
                            "method": "Runtime.evaluate",
                            "params": {
                                "expression": expr,
                                "awaitPromise": True,
                                "returnByValue": True,
                            },
                        }
                    )
                )
                while True:
                    msg = json.loads(conn.recv())
                    if msg.get("id") == ident:
                        return msg.get("result", {}).get("result", {}).get("value")

            if enable_managed_local_services is None:
                # Adaptação: a versão original não tinha este caminho de preservação.
                _eval(JS_LER_MODELO_LOCAL)
                return True

            esperado = "true" if enable_managed_local_services else "false"
            script = (
                JS_LIGAR_MODELO_LOCAL
                if enable_managed_local_services
                else JS_DESLIGAR_MODELO_LOCAL_ORIGINAL
            )
            estavel = 0
            limite = time.time() + 12
            while time.time() < limite:
                atual = _eval(JS_LER_MODELO_LOCAL)
                if atual == esperado:
                    estavel += 1
                    if estavel >= 4:
                        return True
                else:
                    estavel = 0
                    _eval(script)
                time.sleep(0.4)
            print("[buster] não consegui fixar a preferência de modelo local")
            return False
        except Exception as e:
            print("[buster] falha ao configurar: " + str(e))
            return False
        finally:
            if conn is not None:
                try:
                    conn.close()
                except Exception:
                    pass
