"""Shared, polite HTTP fetching for every source fetcher (AGENTS.md source rules).

- Identifies the project honestly; never impersonates a browser or another site.
- Reads each host's robots.txt once, refuses disallowed paths and honours its
  Crawl-delay (never faster than MIN_DELAY_SECONDS between requests to a host).
- Retries transient server errors with backoff; stops immediately on 401/403/429
  (access control or rate limiting) instead of working around it.
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.robotparser
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

USER_AGENT = "MeraMPDataCollector/1.0 (+https://github.com/Alok-Pandey-Coder/MPScoreBoard)"
MIN_DELAY_SECONDS = 1.5
TIMEOUT_SECONDS = 30
RETRIES = 2

_robots: dict[str, urllib.robotparser.RobotFileParser | None] = {}
_last_request: dict[str, float] = {}


class FetchBlocked(Exception):
    """The source refused access (robots.txt, 401/403 or 429). Do not retry or work around it."""


def _robots_for(scheme: str, host: str) -> urllib.robotparser.RobotFileParser | None:
    if host not in _robots:
        parser = urllib.robotparser.RobotFileParser()
        try:
            with urlopen(Request(f"{scheme}://{host}/robots.txt", headers={"User-Agent": USER_AGENT}), timeout=TIMEOUT_SECONDS) as r:
                parser.parse(r.read().decode("utf-8", errors="replace").splitlines())
        except urllib.error.HTTPError as err:
            # A missing robots.txt (4xx) places no restrictions. A 5xx leaves the
            # rules unknown, so it is raised and the fetch stops rather than guessing.
            if 400 <= err.code < 500:
                parser = None
            else:
                raise
        _robots[host] = parser
    return _robots[host]


def _delay_for(host: str, parser: urllib.robotparser.RobotFileParser | None) -> float:
    crawl_delay = parser.crawl_delay(USER_AGENT) if parser else None
    return max(MIN_DELAY_SECONDS, float(crawl_delay or 0))


def fetch_bytes(url: str) -> bytes:
    parts = urlsplit(url)
    parser = _robots_for(parts.scheme, parts.netloc)
    if parser and not parser.can_fetch(USER_AGENT, url):
        raise FetchBlocked(f"robots.txt disallows {url}")

    delay = _delay_for(parts.netloc, parser)
    for attempt in range(RETRIES + 1):
        wait = _last_request.get(parts.netloc, 0) + delay - time.monotonic()
        if wait > 0:
            time.sleep(wait)
        _last_request[parts.netloc] = time.monotonic()
        try:
            with urlopen(Request(url, headers={"User-Agent": USER_AGENT}), timeout=TIMEOUT_SECONDS) as response:
                return response.read()
        except urllib.error.HTTPError as err:
            if err.code in (401, 403, 429):
                raise FetchBlocked(f"HTTP {err.code} from {url}") from err
            if err.code < 500 or attempt == RETRIES:
                raise
        except urllib.error.URLError:
            if attempt == RETRIES:
                raise
        time.sleep(delay * (attempt + 2))
    raise AssertionError("unreachable")


def fetch_json(url: str) -> dict:
    return json.loads(fetch_bytes(url))
