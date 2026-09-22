"""Envio de mensagem via CallMeBot (WhatsApp).

Credenciais lidas de variáveis de ambiente (GitHub Secrets em produção):
- CALLMEBOT_PHONE (número com DDI, sem "+", ex: "5579998278228")
- CALLMEBOT_APIKEY
"""
import os
import urllib.parse

import requests

CALLMEBOT_URL = "https://api.callmebot.com/whatsapp.php"


def send_whatsapp_message(text: str) -> str:
    phone = os.environ["CALLMEBOT_PHONE"]
    apikey = os.environ["CALLMEBOT_APIKEY"]

    response = requests.get(
        CALLMEBOT_URL,
        params={"phone": phone, "text": text, "apikey": apikey},
        timeout=30,
    )
    response.raise_for_status()
    return response.text


if __name__ == "__main__":
    result = send_whatsapp_message(
        "Teste do Monitor de Preços: se você recebeu isso, o envio real via "
        "CallMeBot está funcionando."
    )
    print(f"Resposta do CallMeBot: {result}")
