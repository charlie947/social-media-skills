import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock


SCRIPT = (
    Path(__file__).resolve().parents[1]
    / "skills"
    / "youtube-thumbnail"
    / "scripts"
    / "generate_atlas.py"
)
SPEC = importlib.util.spec_from_file_location("generate_atlas", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class AtlasThumbnailTest(unittest.TestCase):
    def test_generation_posts_once_then_polls_get(self):
        calls = []
        responses = iter(
            [
                {"code": 200, "data": {"id": "p1", "status": "starting"}},
                {"code": 200, "data": {"id": "p1", "status": "processing"}},
                {
                    "code": 200,
                    "data": {
                        "status": "completed",
                        "outputs": ["https://example.com/out.png"],
                    },
                },
            ]
        )

        def request(url, api_key, method="GET", body=None, content_type=None):
            calls.append((method, body))
            return next(responses)

        with (
            mock.patch.object(
                MODULE, "upload_reference", return_value="https://example.com/in.png"
            ),
            mock.patch.object(MODULE, "request_json", side_effect=request),
            mock.patch.object(MODULE, "download_image", return_value="thumbnail.png"),
            mock.patch.object(MODULE.time, "sleep"),
        ):
            result = MODULE.generate(
                "prompt", "face.png", "thumbnail.png", "key", max_polls=2
            )

        self.assertEqual(result, "thumbnail.png")
        self.assertEqual([method for method, _ in calls], ["POST", "GET", "GET"])
        payload = json.loads(calls[0][1])
        self.assertEqual(payload["images"], ["https://example.com/in.png"])
        self.assertEqual(payload["aspect_ratio"], "16:9")
        self.assertEqual(payload["resolution"], "1k")

    def test_upload_requires_https_url(self):
        with tempfile.NamedTemporaryFile(suffix=".png") as image:
            image.write(b"image")
            image.flush()
            with mock.patch.object(
                MODULE,
                "request_json",
                return_value={
                    "code": 200,
                    "data": {"download_url": "http://example.com/in.png"},
                },
            ):
                with self.assertRaisesRegex(RuntimeError, "HTTPS"):
                    MODULE.upload_reference(image.name, "key")

    def test_polling_is_bounded(self):
        with (
            mock.patch.object(
                MODULE, "upload_reference", return_value="https://example.com/in.png"
            ),
            mock.patch.object(
                MODULE,
                "request_json",
                side_effect=[
                    {"code": 200, "data": {"id": "p1", "status": "starting"}},
                    {"code": 200, "data": {"id": "p1", "status": "processing"}},
                ],
            ),
            mock.patch.object(MODULE.time, "sleep"),
        ):
            with self.assertRaisesRegex(RuntimeError, "timed out"):
                MODULE.generate(
                    "prompt", "face.png", "thumbnail.png", "key", max_polls=1
                )


if __name__ == "__main__":
    unittest.main()
