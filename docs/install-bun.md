# Install Bun

Official guide: [bun.com/docs/installation](https://bun.com/docs/installation)

## macOS & Linux

```bash
curl -fsSL https://bun.com/install | bash
```

## Windows

Requires Windows 10 version 1809 or later.

```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```

## Package managers

```bash
npm install -g bun
```

```bash
brew install oven-sh/bun/bun
```

```bash
scoop install bun
```

## Verify

Open a new terminal and run:

```bash
bun --version
bun --revision
```

If `bun` is not found, add `~/.bun/bin` (macOS/Linux) or `%USERPROFILE%\.bun\bin` (Windows) to your `PATH`. See the [official PATH instructions](https://bun.com/docs/installation).

## Upgrade

```bash
bun upgrade
```

Homebrew and Scoop users should use `brew upgrade bun` or `scoop update bun` instead.
