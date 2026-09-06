"""Lista os Content Templates disponíveis na conta Twilio (diagnóstico único)."""
import os

import requests

CONTENT_API_URL = "https://content.twilio.com/v1/Content"


def main() -> None:
    sid = os.environ["TWILIO_ACCOUNT_SID"]
    token = os.environ["TWILIO_AUTH_TOKEN"]

    response = requests.get(CONTENT_API_URL, auth=(sid, token), timeout=30)
    if not response.ok:
        raise RuntimeError(f"Twilio respondeu {response.status_code}: {response.text}")

    data = response.json()
    contents = data.get("contents", [])
    print(f"Total de templates encontrados: {len(contents)}\n")
    for item in contents:
        print(f"- SID: {item.get('sid')}")
        print(f"  friendly_name: {item.get('friendly_name')}")
        print(f"  language: {item.get('language')}")
        print(f"  types: {list(item.get('types', {}).keys())}")
        print()


if __name__ == "__main__":
    main()
