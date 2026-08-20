from typing import Any


def build_ydl_opts(extra: dict[str, Any] | None = None) -> dict[str, Any]:
    extractor_args: dict[str, Any] = {
        "youtube": {
            "player_client": ["web", "android", "tv_embedded"],
        }
    }

    opts: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "extractor_args": extractor_args,
    }

    if extra:
        extra_extractor_args = extra.get("extractor_args")
        opts.update(extra)
        if extra_extractor_args:
            merged = {**extractor_args}
            for key, value in extra_extractor_args.items():
                merged[key] = {**merged.get(key, {}), **value}
            opts["extractor_args"] = merged

    return opts
