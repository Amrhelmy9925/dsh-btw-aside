# BTW side question

A DSH bundle that adds a **BTW** entry to the right sidebar. Ask a question there
and read the answer beside your work, without sending anything into the main
conversation.

The aside call is a separate model request: it does not append Session events,
does not touch the Chat history, and does not interrupt a running turn.

Author: Amr Ahmed Helmy.

## What you get

- A **BTW** button in the session header, beside the other utilities.
- A right-sidebar tab type `btw` with its own chip title.
- An aside conversation: question, streamed answer, stop, clear, retry.
- Aside history is kept in memory per session for the page lifetime, so closing
  and reopening the tab keeps the thread.

## Requirements

- DSH with the right Sidebar (`@deepseek-ai/dsh-client-ui-sidebar-right`).
- A configured default model; the aside request reuses the default selection
  (`provider` + `model`).

## Install

From this directory, in a DSH session:

```
plugin_manager action=install_bundle target=<absolute path to this folder>
```

Or from a clone:

```
plugin_manager action=install_bundle target=/absolute/path/to/dsh-btw-aside
```

Installation writes the profile bundle selection; no manual edit of
`cordis.patch.yml` is required.

## How it works

| Half | File | Role |
|---|---|---|
| Host | `index.js` | Registers `POST /api/btw.ask` inside Connection's authenticated fence. Validates the aside turns, resolves the default model route, and streams newline-delimited JSON events. |
| Client | `client.js` | Registers the tab type, the tab body and chip title, and the header button. Renders the panel and consumes the stream. |

Request body:

```json
{ "messages": [{ "role": "user", "text": "why is the sky blue?" }] }
```

Response body (`application/x-ndjson`):

```json
{"type":"delta","text":"..."}
{"type":"done"}
```

A failure after the stream starts arrives as `{"type":"error","message":"..."}`.

Limits: 32,000 characters of aside text, 60 turns, and a non-empty last user
turn.

## Security notes

- The route lives under `/api`, so it inherits Connection's Host/Origin fence and
  browser authentication. An unauthenticated caller gets `401`.
- The aside request is user-initiated and does not grant the model any tools,
  file access, or session write path.
- Answers are not persisted by the plugin; only the browser page keeps them.

## Configuration

None. The bundle reads the active default model at call time, so changing the
default model applies to the next question.

## Removing

```
plugin_manager action=remove_bundle target=@local/dsh-btw-aside
```

## Repository layout

```
.
├── index.js                    Host half: POST /api/btw.ask
├── client.js                   Client half: tab type, panel, header button
├── cordis.patch.yml            Bundle insert row
├── package.json                Bundle + client manifest
├── locale/en.json              Display metadata, English
├── locale/zh.json              Display metadata, Simplified Chinese
├── icon.svg                    Plugin icon
├── scripts/
│   ├── build-market-index.mjs  Generate market/index.json from this commit
│   └── validate-index.mjs      Check a format-1 index offline
├── .github/workflows/validate.yml
├── CHANGELOG.md
├── LICENSE
└── README.md
```

## Development checks

```
node --check index.js
node --check client.js
node -e "JSON.parse(require('node:fs').readFileSync('package.json','utf8'))"
```

CI runs these checks, then builds and validates the market index on every push
and pull request.

## Publishing

The package name `@local/dsh-btw-aside` and `"private": true` mark this as a
local bundle. To publish it:

1. Rename the package (for example `@you/dsh-btw-aside`) in `package.json`, and
   the `id` values in `client.js` and `cordis.patch.yml` that reference it.
2. Drop `"private": true` and add `repository` and `homepage`.
3. Publish to npm, then generate the market index from a committed, tagged tree:

   ```
   node scripts/build-market-index.mjs
   node scripts/validate-index.mjs
   ```

   The generator pins the current commit, so commit first and publish that
   commit's index. Serve the resulting `market/index.json` from any HTTPS URL
   and add that URL as a plugin market source in DSH.

An index generated from this checkout names a `git+https` install source, which
works for a public repository. A published npm version can be listed with
`"source": { "type": "npm" }` instead.

## Author

Amr Ahmed Helmy.

## License

MIT. See [LICENSE](LICENSE).

