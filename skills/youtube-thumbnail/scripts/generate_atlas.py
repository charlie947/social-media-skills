#!/usr/bin/env python3
"""Generate a YouTube thumbnail from a reference photo through Atlas Cloud."""

import argparse
import json
import mimetypes
import os
import secrets
import time
import urllib.error
import urllib.request
from pathlib import Path


API_BASE = "https://api.atlascloud.ai"
MODEL = "google/nano-banana-2-lite/edit"


def request_json(url, api_key, method="GET", body=None, content_type=None):
    headers = {"Accept": "application/json", "Authorization": f"Bearer {api_key}"}
    if content_type:
        headers["Content-Type"] = content_type
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"Atlas Cloud request failed with HTTP {exc.code}") from exc
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Atlas Cloud request failed: {exc}") from exc
    if payload.get("code") not in (0, 200):
        message = payload.get("message") or payload.get("msg") or "unknown error"
        raise RuntimeError(f"Atlas Cloud API error: {message}")
    return payload


def upload_reference(path, api_key):
    source = Path(path)
    if not source.is_file():
        raise RuntimeError(f"Reference image not found: {path}")
    boundary = f"----thumbnail-{secrets.token_hex(16)}"
    media_type = mimetypes.guess_type(source.name)[0] or "application/octet-stream"
    body = b"".join(
        [
            f"--{boundary}\r\n".encode(),
            f'Content-Disposition: form-data; name="file"; filename="{source.name}"\r\n'.encode(),
            f"Content-Type: {media_type}\r\n\r\n".encode(),
            source.read_bytes(),
            f"\r\n--{boundary}--\r\n".encode(),
        ]
    )
    payload = request_json(
        f"{API_BASE}/api/v1/model/uploadMedia",
        api_key,
        method="POST",
        body=body,
        content_type=f"multipart/form-data; boundary={boundary}",
    )
    url = payload.get("data", {}).get("download_url")
    if not isinstance(url, str) or not url.startswith("https://"):
        raise RuntimeError("Atlas Cloud upload did not return an HTTPS URL")
    return url


def output_url(data):
    outputs = data.get("outputs")
    if isinstance(outputs, list) and outputs and isinstance(outputs[0], str):
        return outputs[0]
    return data.get("output") if isinstance(data.get("output"), str) else None


def download_image(url, output_path):
    if not url.startswith("https://"):
        raise RuntimeError("Atlas Cloud returned a non-HTTPS output URL")
    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    try:
        with urllib.request.urlopen(url, timeout=60) as response:
            destination.write_bytes(response.read())
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise RuntimeError(f"Unable to download generated thumbnail: {exc}") from exc
    return str(destination)


def generate(prompt, reference_path, output_path, api_key, max_polls=60):
    reference_url = upload_reference(reference_path, api_key)
    request_body = json.dumps(
        {
            "model": MODEL,
            "prompt": prompt,
            "images": [reference_url],
            "aspect_ratio": "16:9",
            "resolution": "1k",
        }
    ).encode("utf-8")

    # Generation POSTs are intentionally never retried.
    submitted = request_json(
        f"{API_BASE}/api/v1/model/generateImage",
        api_key,
        method="POST",
        body=request_body,
        content_type="application/json",
    )
    data = submitted.get("data", {})
    immediate_url = output_url(data)
    if data.get("status") == "completed" and immediate_url:
        return download_image(immediate_url, output_path)

    prediction_id = data.get("id")
    if not isinstance(prediction_id, str) or not prediction_id:
        raise RuntimeError("Atlas Cloud response did not include a prediction id")
    for _ in range(max_polls):
        time.sleep(3)
        result = request_json(
            f"{API_BASE}/api/v1/model/prediction/{prediction_id}", api_key
        ).get("data", {})
        if result.get("status") == "completed":
            url = output_url(result)
            if not url:
                raise RuntimeError("Atlas Cloud completed without an output URL")
            return download_image(url, output_path)
        if result.get("status") == "failed":
            raise RuntimeError(
                f"Atlas Cloud generation failed: {result.get('error', 'unknown error')}"
            )
    raise RuntimeError("Atlas Cloud generation timed out while polling")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reference", required=True, help="Reference portrait path")
    parser.add_argument(
        "--prompt-file", required=True, help="Approved prompt text file"
    )
    parser.add_argument("--output", default="youtube-thumbnail.png")
    parser.add_argument("--api-key", help="Overrides ATLASCLOUD_API_KEY")
    args = parser.parse_args()
    api_key = args.api_key or os.environ.get("ATLASCLOUD_API_KEY")
    if not api_key:
        parser.error("pass --api-key or set ATLASCLOUD_API_KEY")
    prompt = Path(args.prompt_file).read_text(encoding="utf-8").strip()
    if not prompt:
        parser.error("prompt file is empty")
    print(generate(prompt, args.reference, args.output, api_key))


if __name__ == "__main__":
    main()
