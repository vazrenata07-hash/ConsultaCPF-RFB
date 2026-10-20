"""Uso independente: python -m recaptcha.exemplo --url URL --browser-binary BIN."""

import argparse
from pathlib import Path

from .solver import RecaptchaSolver


def main():
    parser = argparse.ArgumentParser(description="Exemplo do fluxo reCAPTCHA/Buster")
    parser.add_argument("--url", required=True, help="Página que contém o desafio")
    parser.add_argument(
        "--extensao", type=Path,
        default=Path(__file__).resolve().parent / "buster",
        help="Pasta da extensão descompactada, com manifest.json",
    )
    parser.add_argument(
        "--browser-binary", required=True, type=Path,
        help="Executável Chromium ou Chrome for Testing que aceita --load-extension",
    )
    parser.add_argument("--timeout", type=float, default=90)
    args = parser.parse_args()

    from selenium import webdriver

    extensao = args.extensao.resolve()
    if not (extensao / "manifest.json").is_file():
        parser.error("A pasta --extensao precisa conter manifest.json")
    if not args.browser_binary.is_file():
        parser.error("Não achei o executável informado em --browser-binary")

    options = webdriver.ChromeOptions()
    options.binary_location = str(args.browser_binary.resolve())
    options.add_argument("--load-extension=" + str(extensao))
    driver = webdriver.Chrome(options=options)
    try:
        driver.get(args.url)
        solver = RecaptchaSolver(driver)
        # O pacote mantém o modelo local e não provisiona chaves de terceiros.
        # Pode ser preciso baixar o modelo pelas opções da extensão na primeira vez.
        solver.configurar_buster_local(True)
        input("Abra o formulário/desafio na janela e pressione Enter aqui. ")
        sucesso = solver.resolver_recaptcha(timeout=args.timeout)
        print("Resolvido:", sucesso)
        print("Desafio de áudio recusado:", solver.recaptcha_bloqueado)
        input("Pressione Enter para fechar o navegador. ")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
