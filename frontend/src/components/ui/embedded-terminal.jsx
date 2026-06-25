import { Box, Text } from "ink";
import { useEffect, useMemo, useState } from "react";
import stripAnsi from "strip-ansi";

/**
 * Renders a pseudo-terminal session inside the TUI.
 * Requires optional dependency `node-pty` (native build).
 */
export const EmbeddedTerminal = ({
  command,
  args = [],
  cwd,
  width = 80,
  height = 24,
  onExit
}) => {
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState(null);

  useEffect(() => {
    let p = null;
    let cancelled = false;

    (async () => {
      try {
        const loadPty = new Function('return import("node-pty")');
        const mod = await loadPty();
        if (cancelled) {
          return;
        }
        const pty = mod.spawn(command, args, {
          cols: width,
          cwd,
          name: "xterm-color",
          rows: height,
        });
        p = pty;
        pty.onData((d) => {
          setRaw((prev) => (prev + d).slice(-500_000));
        });
        pty.onExit((e) => {
          onExit?.(e.exitCode);
        });
      } catch {
        setErr(
          "Install optional peer: node-pty (native build required for your platform)."
        );
      }
    })();

    return () => {
      cancelled = true;
      if (p) {
        p.kill();
      }
    };
  }, [command, args, cwd, width, height, onExit]);

  const lines = useMemo(() => stripAnsi(raw).split("\n").slice(-height), [raw, height]);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      width={width}>
      {err ? (
        <Text color="red">{err}</Text>
      ) : (
        lines.map((line, i) => <Text key={i}>{line}</Text>)
      )}
    </Box>
  );
};
