/**
 * Host half of the BTW side-question bundle.
 *
 * Exposes one buffered POST route inside Connection's authenticated fence. The
 * route relays the aside conversation to the default model route and streams
 * newline-delimited JSON back to the browser, so the answer never enters the
 * Session log and never interrupts the main conversation.
 */

/** Services required to answer a side question. */
export const inject = ['connection', 'llm'];

/** Fixed instruction that keeps aside answers short and plain. */
const SYSTEM_PROMPT = [
  'You answer a quick side question asked from a panel beside a coding session.',
  'The user does not want this to interrupt or alter their main conversation.',
  'Answer directly and concisely in plain text.',
  'Do not use Markdown headings, tables, or code fences.',
  'Do not ask for permission and do not call tools.',
].join(' ');

/** Largest accepted aside conversation, in characters of user and assistant text. */
const MAX_TEXT_CHARS = 32_000;

/** Largest accepted number of turns. */
const MAX_TURNS = 60;

/** Route path the browser half posts to. */
const ASK_PATH = '/api/btw.ask';

/**
 * Validate the browser body and normalize it to model messages.
 * @param value - decoded JSON request body.
 * @returns normalized turn list, or a reason string when the body is invalid.
 */
function readTurns(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return { reason: 'body must be an object' };
  const { messages } = value;
  if (!Array.isArray(messages) || messages.length === 0) return { reason: 'messages must be a non-empty array' };
  if (messages.length > MAX_TURNS) return { reason: 'too many messages' };
  const turns = [];
  let chars = 0;
  for (const message of messages) {
    if (typeof message !== 'object' || message === null || Array.isArray(message)) return { reason: 'message must be an object' };
    const { role, text } = message;
    if (role !== 'user' && role !== 'assistant') return { reason: 'role must be user or assistant' };
    if (typeof text !== 'string' || text.trim().length === 0) return { reason: 'text must be a non-empty string' };
    chars += text.length;
    if (chars > MAX_TEXT_CHARS) return { reason: 'conversation is too long' };
    turns.push({ role, text });
  }
  const last = turns[turns.length - 1];
  if (last.role !== 'user') return { reason: 'the last message must be a user message' };
  return { turns };
}

/**
 * Resolve the model route for one aside call.
 * @param ctx - Host plugin context.
 * @returns provider and model, or undefined when nothing is configured.
 */
function resolveRoute(ctx) {
  const selection = ctx.get('agentDefaultModel')?.currentSelection();
  if (selection === undefined) return undefined;
  if (typeof selection.provider !== 'string' || typeof selection.model !== 'string') return undefined;
  return { provider: selection.provider, model: selection.model };
}

/**
 * Compose the aside transcript as one user message.
 *
 * The aside history is plugin-owned and has no Session messages behind it, so it
 * travels as plain text rather than as assistant messages that would need a
 * durable id and model source.
 * @param turns - normalized user and assistant turns.
 * @returns the single user message content blocks.
 */
function transcript(turns) {
  const lines = turns.map((turn) => `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.text}`);
  const text = lines.length === 1 ? lines[0] : ['Side conversation so far:', ...lines].join('\n');
  return [{ type: 'text', text }];
}

/**
 * Answer one aside call as a stream of newline-delimited JSON events.
 * @param ctx - Host plugin context.
 * @param request - browser POST request.
 * @returns the streaming response.
 */
async function answer(ctx, request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response('invalid JSON body', { status: 400 });
  }
  const parsed = readTurns(body);
  if (parsed.reason !== undefined) return new Response(parsed.reason, { status: 400 });
  const route = resolveRoute(ctx);
  if (route === undefined) return new Response('no default model is configured', { status: 409 });

  const encoder = new TextEncoder();
  const controller = new AbortController();
  const onAbort = () => {
    controller.abort();
  };
  if (request.signal.aborted) controller.abort();
  else request.signal.addEventListener('abort', onAbort, { once: true });

  const stream = new ReadableStream({
    async start(sink) {
      const send = (event) => {
        sink.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      try {
        const options = {
          provider: route.provider,
          model: route.model,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: transcript(parsed.turns) }],
          signal: controller.signal,
        };
        for await (const chunk of ctx.llm.stream(options)) {
          if (chunk.type === 'text-delta') {
            if (chunk.text.length > 0) send({ type: 'delta', text: chunk.text });
            continue;
          }
          if (chunk.type !== 'finish') continue;
          if (chunk.reason.kind === 'error' || chunk.reason.kind === 'aborted') {
            const failure = chunk.reason.failure;
            throw new Error(failure.message.length > 0 ? failure.message : failure.code);
          }
        }
        send({ type: 'done' });
      } catch (error) {
        const message = error instanceof Error && error.message.length > 0 ? error.message : 'side question failed';
        try {
          send({ type: 'error', message });
        } catch {}
      } finally {
        request.signal.removeEventListener('abort', onAbort);
        try {
          sink.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

/**
 * Register the aside route for the plugin's lifetime.
 * @param ctx - Host plugin context.
 */
export function apply(ctx) {
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: ASK_PATH,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: (request) => answer(ctx, request),
      }),
    'btw-aside: ask route',
  );
}
