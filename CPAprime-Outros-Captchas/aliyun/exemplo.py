"""Exemplo de integração; o aplicativo fornece o seu driver já aberto."""
try:
    from .aliyun import AliyunResolver
except ImportError:
    from aliyun import AliyunResolver


def integrar(driver):
    """Recebe um driver compatível com Selenium/Chrome CDP, sem abrir sites."""
    resolvedor = AliyunResolver(driver)
    return resolvedor.resolver_aliyun_se_aparecer(tentativas=3)


if __name__ == '__main__':
    print('Importe integrar(driver) no seu aplicativo e forneça o driver já aberto.')
