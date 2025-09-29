# @yourorg/siderun (MVP CLI scaffold)

This directory contains an experimental TypeScript scaffold for a CLI named `@yourorg/siderun` (MVP). It is provided for product/context purposes and is separate from the front-end "SideRun" flying-border effect implemented in the repository root (`js/siderun.js`, `styles/siderun.css`).

Status: MVP scaffold. Commands and APIs may change before v1.

## Install

Global (after first publish):

```
npm i -g @yourorg/siderun
```

Check:

```
siderun --version
```

## Quickstart

```
# Create an example config
siderun init

# Run demo job
siderun run --config ./siderun.config.json --job demo

# Show status
siderun status
```

## Config

siderun.config.json example:

```
{
  "jobs": {
    "demo": {
      "steps": [
        { "name": "echo hello", "command": "node -e \"console.log('hello')\"" },
        { "name": "sleep", "command": "node -e \"setTimeout(()=>console.log('done'),200)\"" }
      ]
    }
  }
}
```

## Development

- Build: npm run build
- Test: npm test
- Lint: npm run lint

## License

MIT
