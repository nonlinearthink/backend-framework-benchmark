# Install oha

[oha](https://github.com/hatoo/oha) is the HTTP load generator used by `bun run benchmark`.

Official guide: [github.com/hatoo/oha#installation](https://github.com/hatoo/oha#installation)

## Cargo (all platforms)

Requires stable Rust, `make`, and `cmake`:

```bash
cargo install oha
```

## Pre-built binaries

Download from the [GitHub Releases](https://github.com/hatoo/oha/releases) page, or from the Publish workflow artifacts for each commit.

## Platform-specific

**macOS (Homebrew)**

```bash
brew install oha
```

**Windows (winget)**

```powershell
winget install hatoo.oha
```

**Arch Linux**

```bash
pacman -S oha
```

**Debian (Azlux repository)**

```bash
echo "deb [signed-by=/usr/share/keyrings/azlux-archive-keyring.gpg] http://packages.azlux.fr/debian/ stable main" | sudo tee /etc/apt/sources.list.d/azlux.list
sudo wget -O /usr/share/keyrings/azlux-archive-keyring.gpg https://azlux.fr/repo.gpg
sudo apt update
sudo apt install oha
```

## Docker

```bash
docker pull ghcr.io/hatoo/oha
docker run --rm -it --network=host ghcr.io/hatoo/oha:latest https://example.com
```

## Verify

```bash
oha --version
```
