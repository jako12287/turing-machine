import { useMemo, useState } from "react";
import "./App.css";

type MachineState = "q0" | "q1" | "qf";

interface StepLog {
  step: number;
  state: MachineState;
  read: string;
  action: string;
  words: number;
}

const BLANK = "□";

const stateLabels: Record<MachineState, string> = {
  q0: "Buscando palabra",
  q1: "Leyendo palabra",
  qf: "Finalizado",
};

function App() {
  const [input, setInput] = useState("");
  const [tape, setTape] = useState<string[]>([]);
  const [head, setHead] = useState(0);
  const [state, setState] = useState<MachineState>("q0");
  const [words, setWords] = useState(0);
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [started, setStarted] = useState(false);

  // 🔥 NUEVO: controla si estamos dentro de palabra
  const [inWord, setInWord] = useState(false);

  const isFinished = state === "qf";

  const currentSymbol = useMemo(() => {
    return tape[head] ?? BLANK;
  }, [tape, head]);

  const initializeMachine = () => {
    const cleanedInput = input.trim();

    const newTape =
      cleanedInput.length > 0
        ? [...cleanedInput.split(""), BLANK]
        : [BLANK];

    setTape(newTape);
    setHead(0);
    setState("q0");
    setWords(0);
    setLogs([]);
    setStarted(true);
    setInWord(false); // 🔥 reinicia estado lógico
  };

  const resetMachine = () => {
    setTape([]);
    setHead(0);
    setState("q0");
    setWords(0);
    setLogs([]);
    setStarted(false);
    setInWord(false);
  };

const nextStep = () => {
  if (!started || isFinished) return;

  const symbol = tape[head] ?? BLANK;
  const isBlank = symbol === BLANK;
  const isSpace = symbol === " ";
  const isLetter = !isBlank && !isSpace;

  let nextHead = head;
  let nextWords = words;
  let action = "";

  if (isLetter) {
    if (!inWord) {
      nextWords += 1;
      action = "Detecta inicio de palabra y suma 1";
    } else {
      action = "Sigue dentro de la palabra";
    }

    nextHead += 1;
    setState("q1");
    setInWord(true);
  } else if (isSpace) {
    action = "Encuentra espacio, separa palabras";

    nextHead += 1;
    setState("q0");
    setInWord(false);
  } else {
    action = "Llega al final de la cadena y termina el proceso";

    setState("qf");
  }

  const newLog: StepLog = {
    step: logs.length + 1,
    state,
    read: symbol,
    action,
    words: nextWords,
  };

  setLogs((prevLogs) => [newLog, ...prevLogs]);
  setHead(nextHead);
  setWords(nextWords);
};

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Matemáticas discretas</p>
        <h1>Máquina de Turing para conteo de palabras</h1>
        <h2 className="description">
          Simulación visual de una máquina de Turing que recorre una cadena de
          texto, detecta palabras y cuenta cuántas aparecen en la entrada.
        </h2>
      </section>

      <section className="card controls">
        <label htmlFor="inputText">Cadena de entrada</label>

        <textarea
          id="inputText"
          value={input}
          disabled={started && !isFinished}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escribe una frase..."
        />

        <div className="buttons">
          <button onClick={initializeMachine}>Iniciar</button>
          <button onClick={nextStep} disabled={!started || isFinished}>
            Paso siguiente
          </button>
          <button className="secondary" onClick={resetMachine}>
            Reiniciar
          </button>
        </div>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Cinta unidimensional</h2>

          {started ? (
            <div className="tape">
              {tape.map((symbol, index) => (
                <div
                  key={`${symbol}-${index}`}
                  className={`cell ${index === head ? "active" : ""}`}
                >
                  <span>{symbol === " " ? "␠" : symbol}</span>
                  {index === head && <strong>▲</strong>}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">Inicia la máquina para visualizar la cinta.</p>
          )}
        </article>

        <article className="card status">
          <h2>Estado actual</h2>

          <div className="statusBox">
            <p>
              Estado: <strong>{stateLabels[state]}</strong>
            </p>
            <p>
              Símbolo leído: <strong>{currentSymbol}</strong>
            </p>
            <p>
              Posición del cabezal: <strong>{head}</strong>
            </p>
            <p>
              Palabras detectadas: <strong>{words}</strong>
            </p>
          </div>

          {isFinished && (
            <div className="result">
              Resultado final: la cadena contiene <strong>{words}</strong>{" "}
              palabra(s).
            </div>
          )}
        </article>
      </section>

      <section className="card">
        <h2>Registro paso a paso</h2>

        {logs.length > 0 ? (
          <div className="logs">
            {logs.map((log) => (
              <div className="logItem" key={log.step}>
                <strong>Paso {log.step}</strong>
                <span>Estado: {stateLabels[log.state]}</span>
                <span>Lee: {log.read === " " ? "␠" : log.read}</span>
                <span>{log.action}</span>
                <span>Conteo: {log.words}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty">
            Aquí aparecerá el recorrido de la máquina paso a paso.
          </p>
        )}
      </section>
    </main>
  );
}

export default App;