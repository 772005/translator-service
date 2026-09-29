"""Smoke-test the deployed Vercel translation API."""

import argparse

import requests


DEFAULT_BASE_URL = "https://translator-service-one.vercel.app"
TEST_TEXT = "\u092e\u0941\u091d\u0947 \u0906\u091c \u0915\u093e\u092e \u092a\u0930 \u091c\u093e\u0928\u093e \u0939\u0948\u0964"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    args = parser.parse_args()
    base_url = args.base_url.rstrip("/")

    health_response = requests.get(f"{base_url}/api/health", timeout=15)
    health_response.raise_for_status()
    health = health_response.json()
    if health.get("status") != "healthy":
        raise RuntimeError(f"Health check failed: {health}")
    print("Health check: PASS", health)

    translation_response = requests.post(
        f"{base_url}/api/translate",
        json={"text": TEST_TEXT},
        timeout=30,
    )
    translation_response.raise_for_status()
    translation = translation_response.json()
    if not translation.get("success") or not translation.get("english_text"):
        raise RuntimeError(f"Translation check failed: {translation}")
    print("Translation check: PASS")
    print("Original:", translation["original_text"])
    print("English:", translation["english_text"])


if __name__ == "__main__":
    main()