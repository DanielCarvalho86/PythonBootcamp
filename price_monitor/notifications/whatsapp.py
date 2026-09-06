"""Envio de mensagens de alerta via WhatsApp (Twilio Sandbox).

Credenciais lidas de variáveis de ambiente (GitHub Secrets em produção):
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_WHATSAPP_FROM (número do sandbox/produção Twilio, formato "whatsapp:+1415...")
- WHATSAPP_TO (número do destinatário, formato "whatsapp:+55...")
"""
import os

import requests

TWILIO_API_URL = "https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"


def send_whatsapp_message(body: str) -> dict:
    sid = os.environ["TWILIO_ACCOUNT_SID"]
    token = os.environ["TWILIO_AUTH_TOKEN"]
    from_number = os.environ.get("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
    to_number = os.environ["WHATSAPP_TO"]

    response = requests.post(
        TWILIO_API_URL.format(sid=sid),
        data={"From": from_number, "To": to_number, "Body": body},
        auth=(sid, token),
        timeout=30,
    )
    if not response.ok:
        raise RuntimeError(f"Twilio respondeu {response.status_code}: {response.text}")
    return response.json()


if __name__ == "__main__":
    result = send_whatsapp_message(
        "Teste do Monitor de Preços: se você recebeu isso, o pipeline de "
        "alerta via WhatsApp está funcionando."
    )
    print(f"Mensagem enviada. SID: {result.get('sid')}, status: {result.get('status')}")
