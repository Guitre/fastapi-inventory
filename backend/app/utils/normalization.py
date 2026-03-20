import re
import unicodedata


def normalize_name(raw: str) -> str:
    """Canonical key for deduplication.

    'Açaí  com  Guaraná' → 'acai com guarana'
    """
    text = raw.strip()
    text = re.sub(r"\s+", " ", text)
    text = text.lower()
    # NFKD decompose, strip combining characters (accents)
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return text


def clean_display_name(raw: str) -> str:
    """Clean but preserve accents for pt-BR display.

    '  açaí   com   guaraná  ' → 'Açaí Com Guaraná'
    """
    text = raw.strip()
    text = re.sub(r"\s+", " ", text)
    return text.title()
