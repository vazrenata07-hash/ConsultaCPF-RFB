"""Exemplo de integração novo; não é um arquivo original do CPAprime.

Uso: python resolver_geetest.py https://sua-pagina
O navegador é aberto para você chegar ao desafio antes de iniciar o solver.
"""

import argparse

from selenium import webdriver

from geetest_recuperado import GeeTestSolver


def main():
    parser = argparse.ArgumentParser(description="GeeTest recuperado do CPAprime")
    parser.add_argument("url", help="Página que contém o desafio")
    args = parser.parse_args()
    options = webdriver.ChromeOptions()
    options.add_experimental_option(
        "mobileEmulation",
        {
            "deviceMetrics": {
                "width": 412,
                "height": 915,
                "pixelRatio": 1,
                "mobile": True,
                "touch": True,
            }
        },
    )
    driver = webdriver.Chrome(options=options)
    try:
        driver.get(args.url)
        input("Deixe o desafio visível e pressione Enter para resolver: ")
        solver = GeeTestSolver(driver)
        print("Resultado:", solver.resolver())
        input("Pressione Enter para fechar o navegador: ")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
