const WebSocket = require("ws");
const { SerialPort } = require("serialport");

const wss = new WebSocket.Server({ port: 8080 });

let portInstance = null;

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.action === "open") {
        if (portInstance && portInstance.isOpen) {
          ws.send(
            JSON.stringify({ type: "log", data: "Porta já está aberta." })
          );
          return;
        }

        portInstance = new SerialPort({
          path: data.port,
          baudRate: data.baudRate || 9600,
        });

        portInstance.on("open", () => {
          ws.send(
            JSON.stringify({ type: "log", data: `Porta ${data.port} aberta.` })
          );
          ws.send(JSON.stringify({ type: "status", data: "open" }));
        });

        // RECEBIMENTO — agora sem conversão para hex
        portInstance.on("data", (chunk) => {
          try {
            const text = chunk.toString("utf8");
            ws.send(JSON.stringify({ type: "log", data: "RX: " + text }));
          } catch (err) {
            ws.send(
              JSON.stringify({
                type: "log",
                data: "RX (erro ao decodificar UTF-8)",
              })
            );
          }
        });

        portInstance.on("error", (err) => {
          ws.send(JSON.stringify({ type: "error", data: err.message }));
        });
      }

      if (data.action === "send") {
        if (!portInstance || !portInstance.isOpen) {
          ws.send(
            JSON.stringify({ type: "error", data: "Porta não está aberta." })
          );
          return;
        }
        let buffer;
        if (data.type === "hex") {
          buffer = Buffer.from(data.payload.replace(/[^0-9a-f]/gi, ""), "hex");
        } else {
          buffer = Buffer.from(data.payload, "utf8");
        }
        portInstance.write(buffer);
        ws.send(
          JSON.stringify({
            type: "log",
            data: "TX: " + buffer.toString("utf8"),
          })
        );
      }

      if (data.action === "close") {
        if (portInstance && portInstance.isOpen) {
          portInstance.close(() => {
            ws.send(JSON.stringify({ type: "log", data: "Porta fechada." }));
          });
        }
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: "error", data: err.message }));
    }
  });
});

console.log("Servidor WebSocket rodando na porta 8080");
