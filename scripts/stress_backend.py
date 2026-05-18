#!/usr/bin/env python3
import argparse
import shutil
import subprocess
import sys


def build_url(base_url: str, endpoint: str) -> str:
    return f"{base_url.rstrip('/')}/{endpoint.lstrip('/')}"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run Apache Benchmark against the backend endpoint (GCP/GKE friendly)."
    )
    parser.add_argument(
        "--base-url",
        required=True,
        help="Backend base URL, for example: http://34.120.10.50",
    )
    parser.add_argument(
        "--endpoint",
        default="/api/auth/health",
        help="Endpoint path to stress (default: /api/auth/health)",
    )
    parser.add_argument(
        "-n",
        "--requests",
        type=int,
        default=50000,
        help="Total number of requests (default: 50000)",
    )
    parser.add_argument(
        "-c",
        "--concurrency",
        type=int,
        default=1000,
        help="Number of multiple requests to make at a time (default: 1000)",
    )
    parser.add_argument(
        "-k",
        "--keep-alive",
        action="store_true",
        help="Enable HTTP KeepAlive in Apache Benchmark",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=None,
        help="Maximum seconds to wait before the request times out",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the generated command without executing it",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if args.requests <= 0 or args.concurrency <= 0:
        print("requests and concurrency must both be greater than 0", file=sys.stderr)
        return 2

    if shutil.which("ab") is None:
        print("Apache Benchmark is not installed. Install 'ab' and retry.", file=sys.stderr)
        return 127

    target_url = build_url(args.base_url, args.endpoint)
    command = [
        "ab",
        "-n",
        str(args.requests),
        "-c",
        str(args.concurrency),
    ]

    if args.keep_alive:
        command.append("-k")

    if args.timeout is not None:
        if args.timeout <= 0:
            print("timeout must be greater than 0", file=sys.stderr)
            return 2
        command.extend(["-s", str(args.timeout)])

    command.append(target_url)

    print("Running:", " ".join(command))
    if args.dry_run:
        return 0

    result = subprocess.run(command, check=False)
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
