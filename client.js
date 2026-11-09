window.__ModuleLoader__.load({
  id: '@local/dsh-btw-aside',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'btwAside';
    const TAB_ID = '@local/dsh-btw-aside';
    const KIND = 'btw';
    const ASK_ROUTE = 'api/btw.ask';

    // Copy that ships with the module; locale dictionaries override per language.
    const en = {
      'meta.title': 'BTW side question',
      'meta.description': 'Ask a question in the right sidebar without touching the main conversation.',
      'tab.title': 'BTW',
      'tab.description': 'Ask a quick aside question.',
      'open.label': 'Ask a side question (BTW)',
      'empty.title': 'Ask a side question',
      'empty.body': 'Answers stay in this panel. The main conversation is not sent, changed, or interrupted.',
      'placeholder': 'Type a question…',
      'send': 'Send',
      'clear': 'Clear',
      'stop': 'Stop',
      'you': 'You',
      'aside': 'BTW',
      'thinking': 'Thinking…',
      'error': 'The side question failed.',
      'retry': 'Retry',
      'hint': 'Enter to send · Shift+Enter for a new line',
    };
    const zh = {
      'meta.title': 'BTW 侧边提问',
      'meta.description': '在右侧栏提问，不影响主对话。',
      'tab.title': 'BTW',
      'tab.description': '快速提一个附带问题。',
      'open.label': '提一个附带问题（BTW）',
      'empty.title': '提一个附带问题',
      'empty.body': '回答只留在这个面板里。主对话不会被发送、修改或中断。',
      'placeholder': '输入问题…',
      'send': '发送',
      'clear': '清空',
      'stop': '停止',
      'you': '你',
      'aside': 'BTW',
      'thinking': '正在思考…',
      'error': '附带提问失败。',
      'retry': '重试',
      'hint': 'Enter 发送 · Shift+Enter 换行',
    };

    const css = [
      '.btwAside_root{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;min-width:0;height:100%;color:var(--dsw-alias-label-primary);}',
      '.btwAside_scroll{flex:1 1 auto;min-height:0;overflow-y:auto;padding:14px 14px 4px;display:flex;flex-direction:column;gap:12px;}',
      '.btwAside_empty{margin:auto;max-width:320px;text-align:center;color:var(--dsw-alias-label-secondary);padding:28px 8px;}',
      '.btwAside_emptyTitle{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);margin-bottom:6px;}',
      '.btwAside_emptyBody{font-size:12.5px;line-height:1.55;}',
      '.btwAside_turn{display:flex;flex-direction:column;gap:4px;}',
      '.btwAside_role{font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--dsw-alias-label-secondary);}',
      '.btwAside_bubble{border-radius:10px;padding:9px 11px;font-size:13px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere;}',
      '.btwAside_user{background:var(--dsw-alias-bg-layer-2);}',
      '.btwAside_assistant{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);}',
      '.btwAside_pending{color:var(--dsw-alias-label-secondary);font-style:italic;}',
      '.btwAside_error{border-radius:8px;border:1px solid var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);font-size:12.5px;padding:8px 10px;white-space:pre-wrap;overflow-wrap:anywhere;}',
      '.btwAside_composer{flex:none;display:flex;flex-direction:column;gap:8px;padding:10px 12px 12px;border-top:1px solid var(--dsw-alias-border-l1);}',
      '.btwAside_input{width:100%;box-sizing:border-box;resize:none;min-height:64px;max-height:220px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1.5;padding:10px 11px;}',
      '.btwAside_input:focus{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-1px;}',
      '.btwAside_input::placeholder{color:var(--dsw-alias-label-secondary);}',
      '.btwAside_row{display:flex;align-items:center;gap:8px;}',
      '.btwAside_spacer{flex:1 1 auto;}',
      '.btwAside_button{appearance:none;border-radius:8px;border:1px solid var(--dsw-alias-brand-primary);background:transparent;color:var(--dsw-alias-brand-primary);font:inherit;font-size:12.5px;font-weight:600;padding:7px 12px;cursor:pointer;}',
      '.btwAside_button:disabled{opacity:.45;cursor:default;}',
      '.btwAside_buttonGhost{appearance:none;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12.5px;padding:7px 11px;cursor:pointer;}',
      '.btwAside_buttonGhost:disabled{opacity:.45;cursor:default;}',
      '.btwAside_hint{font-size:11px;color:var(--dsw-alias-label-secondary);}',
      '.btwAside_trigger{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:28px;padding:0 9px;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;}',
      '.btwAside_trigger:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.btwAside_title{display:inline-flex;align-items:center;gap:6px;min-width:0;}',
      '.btwAside_titleText{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    ].join('');

    /** Decorative speech-bubble-with-spark artwork. */
    function BtwGlyph({ size = 16 }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 20 20',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { flex: 'none' },
        },
        h('path', {
          d: 'M3.4 4.6h8.1a2 2 0 0 1 2 2v4.2a2 2 0 0 1-2 2H7.2l-3 2.6v-2.6H3.4a2 2 0 0 1-2-2V6.6a2 2 0 0 1 2-2Z',
          stroke: 'currentColor',
          strokeWidth: '1.4',
          strokeLinejoin: 'round',
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M17.2 7.1v3.2M15.6 8.7h3.2',
          stroke: 'currentColor',
          strokeWidth: '1.4',
          strokeLinecap: 'round',
        }),
      );
    }

    // Panel history survives tab close/reopen within one page lifetime.
    const histories = new Map();

    /** Parse one newline-delimited JSON event; malformed lines are ignored. */
    function parseEvent(line) {
      try {
        const value = JSON.parse(line);
        return typeof value === 'object' && value !== null ? value : undefined;
      } catch {
        return undefined;
      }
    }

    /** Send one aside conversation and stream its answer into callbacks. */
    async function ask(messages, signal, onDelta) {
      const response = await fetch(ASK_ROUTE, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal,
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(detail.trim().length > 0 ? detail.trim() : `HTTP ${response.status}`);
      }
      if (response.body === null) throw new Error('the answer stream was empty');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let breakAt = buffer.indexOf('\n');
        while (breakAt >= 0) {
          const line = buffer.slice(0, breakAt);
          buffer = buffer.slice(breakAt + 1);
          if (line.trim().length > 0) {
            const event = parseEvent(line);
            if (event?.type === 'delta' && typeof event.text === 'string' && event.text.length > 0) onDelta(event.text);
            else if (event?.type === 'error') throw new Error(typeof event.message === 'string' ? event.message : 'side question failed');
          }
          breakAt = buffer.indexOf('\n');
        }
      }
      if (buffer.trim().length > 0) {
        const event = parseEvent(buffer);
        if (event?.type === 'delta' && typeof event.text === 'string') onDelta(event.text);
        else if (event?.type === 'error') throw new Error(typeof event.message === 'string' ? event.message : 'side question failed');
      }
    }

    /** The right-sidebar aside panel. */
    function BtwPanel({ sessionId, t }) {
      const historyKey = sessionId ?? 'anon';
      const [messages, setMessages] = React.useState(() => histories.get(historyKey) ?? []);
      const [draft, setDraft] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const [error, setError] = React.useState('');
      const scrollRef = React.useRef(null);
      const abortRef = React.useRef(null);
      const focusRef = React.useRef(null);

      React.useEffect(() => {
        focusRef.current?.focus();
      }, []);

      React.useEffect(() => {
        histories.set(historyKey, messages);
      }, [historyKey, messages]);

      React.useEffect(() => {
        const node = scrollRef.current;
        if (node !== null) node.scrollTop = node.scrollHeight;
      }, [messages, busy]);

      React.useEffect(
        () => () => {
          if (abortRef.current !== null) abortRef.current.abort();
        },
        [],
      );

      const run = React.useCallback(
        async (turns) => {
          if (busy) return;
          const assistantIndex = turns.length;
          setMessages([...turns, { role: 'assistant', text: '' }]);
          setError('');
          setBusy(true);
          const controller = new AbortController();
          abortRef.current = controller;
          const dropEmpty = () => {
            setMessages((current) => {
              const copy = current.slice();
              const target = copy[assistantIndex];
              if (target !== undefined && target.text.length === 0) copy.splice(assistantIndex, 1);
              return copy;
            });
          };
          try {
            await ask(turns, controller.signal, (delta) => {
              setMessages((current) => {
                const copy = current.slice();
                const target = copy[assistantIndex];
                if (target === undefined) return current;
                copy[assistantIndex] = { role: 'assistant', text: target.text + delta };
                return copy;
              });
            });
            dropEmpty();
          } catch (failure) {
            const aborted = controller.signal.aborted;
            dropEmpty();
            if (!aborted) setError(failure instanceof Error && failure.message.length > 0 ? failure.message : t('error'));
          } finally {
            if (abortRef.current === controller) abortRef.current = null;
            setBusy(false);
          }
        },
        [busy, t],
      );

      const submit = React.useCallback(() => {
        const text = draft.trim();
        if (text.length === 0 || busy) return;
        setDraft('');
        void run([...messages, { role: 'user', text }]);
      }, [draft, busy, messages, run]);

      const retry = React.useCallback(() => {
        let end = messages.length;
        while (end > 0 && messages[end - 1].role === 'assistant') end -= 1;
        if (end === 0) return;
        void run(messages.slice(0, end));
      }, [messages, run]);

      const stop = React.useCallback(() => {
        abortRef.current?.abort();
      }, []);

      const clear = React.useCallback(() => {
        abortRef.current?.abort();
        setMessages([]);
        setDraft('');
        setError('');
      }, []);

      const onKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
          event.preventDefault();
          void submit();
        }
      };

      return h(
        'div',
        { className: 'btwAside_root', 'data-btw-aside': '' },
        h(
          'div',
          { className: 'btwAside_scroll', ref: scrollRef },
          messages.length === 0 && !busy
            ? h(
                'div',
                { className: 'btwAside_empty' },
                h('div', { className: 'btwAside_emptyTitle' }, t('empty.title')),
                h('div', { className: 'btwAside_emptyBody' }, t('empty.body')),
              )
            : messages.map((message, index) =>
                h(
                  'div',
                  { className: 'btwAside_turn', key: String(index) },
                  h('div', { className: 'btwAside_role' }, message.role === 'user' ? t('you') : t('aside')),
                  h(
                    'div',
                    { className: `btwAside_bubble ${message.role === 'user' ? 'btwAside_user' : 'btwAside_assistant'}` },
                    message.role === 'assistant' && message.text.length === 0 && busy
                      ? h('span', { className: 'btwAside_pending' }, t('thinking'))
                      : message.text,
                  ),
                ),
              ),
          error.length > 0
            ? h(
                'div',
                { className: 'btwAside_error', role: 'alert' },
                error,
                h(
                  'div',
                  { style: { marginTop: '6px' } },
                  h('button', { type: 'button', className: 'btwAside_buttonGhost', onClick: retry, disabled: busy }, t('retry')),
                ),
              )
            : null,
        ),
        h(
          'div',
          { className: 'btwAside_composer' },
          h('textarea', {
            ref: focusRef,
            className: 'btwAside_input',
            placeholder: t('placeholder'),
            value: draft,
            rows: 2,
            onChange: (event) => {
              setDraft(event.target.value);
            },
            onKeyDown,
            'aria-label': t('placeholder'),
          }),
          h(
            'div',
            { className: 'btwAside_row' },
            h('span', { className: 'btwAside_hint' }, t('hint')),
            h('span', { className: 'btwAside_spacer' }),
            h(
              'button',
              { type: 'button', className: 'btwAside_buttonGhost', onClick: clear, disabled: busy || (messages.length === 0 && draft.length === 0) },
              t('clear'),
            ),
            busy
              ? h('button', { type: 'button', className: 'btwAside_buttonGhost', onClick: stop }, t('stop'))
              : h(
                  'button',
                  { type: 'button', className: 'btwAside_button', onClick: () => void submit(), disabled: draft.trim().length === 0 },
                  t('send'),
                ),
          ),
        ),
      );
    }

    /** The tab chip: glyph plus the tab title. */
    function BtwTitle({ t }) {
      return h('span', { className: 'btwAside_title' }, h(BtwGlyph, { size: 15 }), h('span', { className: 'btwAside_titleText' }, t('tab.title')));
    }

    /** The session-header trigger that opens the aside panel. */
    function OpenButton({ t, open }) {
      return h(
        'button',
        {
          type: 'button',
          className: 'btwAside_trigger',
          onClick: open,
          title: t('open.label'),
          'aria-label': t('open.label'),
          'data-btw-aside-open': '',
        },
        h(BtwGlyph, { size: 15 }),
        h('span', null, t('tab.title')),
      );
    }

    return {
      inject: ['slots', 'locale', 'sidebarRightTabs', 'sidebarRight'],
      apply(ctx) {
        const t = ctx.locale.bind(NS);

        ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'btw-aside: copy');

        ctx.effect(() => {
          const selector = `style[data-plugin-css="${TAB_ID}/btwAside.css"]`;
          if (document.querySelector(selector) !== null) return () => {};
          const tag = document.createElement('style');
          tag.dataset.plugin = TAB_ID;
          tag.dataset.pluginCss = `${TAB_ID}/btwAside.css`;
          tag.textContent = css;
          document.head.appendChild(tag);
          return () => {
            tag.remove();
          };
        }, 'btw-aside: styles');

        ctx.effect(
          () =>
            ctx.sidebarRightTabs.register({
              id: TAB_ID,
              kind: KIND,
              priority: 'extension',
              title: () => t('tab.title'),
              guide: [
                {
                  id: 'ask',
                  order: 45,
                  title: () => t('tab.title'),
                  description: () => t('tab.description'),
                  icon: BtwGlyph,
                },
              ],
            }),
          'btw-aside: tab type',
        );

        ctx.slots.inject('sidebar.right.pane.tab', () =>
          ctx.slots.register(
            {
              name: 'sidebar.right.pane.tab',
              key: TAB_ID,
              locale: NS,
            },
            BtwPanel,
          ),
        );

        ctx.slots.inject('sidebar.right.pane.tab.title', () =>
          ctx.slots.register(
            {
              name: 'sidebar.right.pane.tab.title',
              key: TAB_ID,
              locale: NS,
            },
            BtwTitle,
          ),
        );

        ctx.slots.inject('conversation.session.header.utilities', () =>
          ctx.slots.register(
            {
              name: 'conversation.session.header.utilities',
              id: 'btw-aside.open',
              order: 45,
              locale: NS,
              inject: () => ({
                open: () => {
                  ctx.sidebarRight.openTab(KIND);
                },
              }),
            },
            OpenButton,
          ),
        );
      },
    };
  },
});
