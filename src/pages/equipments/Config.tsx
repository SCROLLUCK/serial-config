/* eslint-disable no-control-regex */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCallback, useEffect, useRef, useState } from "react";
import { Combobox } from "@/components/combo-box";
import StaticIPForm from "./StaticIPForm";
import MQTTForm from "./MQTTForm";
import NTPForm from "./NTPForm";
import GroundingForm from "./GroundingForm";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Config() {
  const { t } = useTranslation();

  const [currentCommand, setCurrentCommand] = useState<any>(null);
  const [port, setPort] = useState<any | null>(null);
  const [baudRate, setBaudRate] = useState<number>(115200);

  const [reader, setReader] = useState<any>(null);
  const [writer, setWriter] = useState<any>(null);
  const [, setInputDone] = useState<any>(null);
  const [, setOutputStream] = useState<any>(null);

  // Buffer para acumular dados recebidos
  const dataBuffer = useRef<string>("");
  // Timer para processar dados acumulados
  const processTimer = useRef<any>(null);
  // Referência para controlar se o loop de leitura está ativo
  const isReading = useRef<boolean>(false);

  const handleCommand = useCallback((command: string, data: any) => {
    // Removi a verificação do inputDone aqui, pois não é relevante para gerar o comando
    switch (command) {
      case "staticIP":
        // Lógica para comando staticIP
        // Exemplo: return `set_static_ip ${data.ip} ${data.netmask} ${data.gateway}`;
        return null;
      case "mqttConfig":
        return `set_mqtt_config ${data.host} ${data.port} "${data.user}" "${data.pass}"`;
      case "ntpConfig":
        // Lógica para comando ntpConfig
        // Exemplo: return `set_ntp_server ${data.server}`;
        return null;
      case "groundingConfig":
        // Lógica para comando groundingConfig
        // Exemplo: return `set_grounding ${data.enabled ? "on" : "off"}`;
        return null;
      default:
        return null;
    }
  }, []);

  const log = useCallback((msg: string) => {
    const logEl = document.getElementById("log");
    const ts = new Date().toLocaleTimeString();
    if (logEl) {
      // Criar elemento com texto pré-formatado
      const p = document.createElement("div");
      p.innerHTML = `<span style="color: #888;">[${ts}]</span> ${msg}`;
      logEl.appendChild(p);
      logEl.scrollTop = logEl.scrollHeight;
    }
  }, []);

  const sendCommand = useCallback(
    async (command: string, data: any) => {
      console.log(port);
      if (!writer || !port) {
        toast.error("Porta não conectada. Conecte-se primeiro.");
        return;
      }

      const msg = handleCommand(command, data);
      if (msg) {
        try {
          const commandWithNewline = msg + "\r\n";
          log(`TX (text): ${commandWithNewline}`);
          await writer.write(commandWithNewline);
        } catch (error) {
          log("Erro ao enviar comando: " + tratarErroSerial(error));
          toast.error("Erro ao enviar comando");
        }
      } else {
        toast.error("Comando não suportado ou dados inválidos.");
      }
    },
    [writer, port, handleCommand, log]
  );

  const commands = [
    {
      name: t("app.equipment.staticIP"),
      value: "staticIP",
      form: <StaticIPForm />,
    },
    {
      name: t("app.equipment.mqttConfig"),
      value: "mqttConfig",
      form: <MQTTForm sendData={(data) => sendCommand("mqttConfig", data)} />,
    },
    {
      name: t("app.equipment.ntpConfig"),
      value: "ntpConfig",
      form: <NTPForm />,
    },
    {
      name: t("app.equipment.groundingConfig"),
      value: "groundingConfig",
      form: <GroundingForm />,
    },
  ];

  // Função para processar códigos ANSI e converter para HTML
  const processAnsiColors = useCallback((text: string): string => {
    return text
      .replace(/\x1b\[0;32m/g, '<span style="color: #00ff00;">') // Verde
      .replace(/\x1b\[0;31m/g, '<span style="color: #ff0000;">') // Vermelho
      .replace(/\x1b\[0;33m/g, '<span style="color: #ffff00;">') // Amarelo
      .replace(/\x1b\[0m/g, "</span>") // Reset
      .replace(/\r\n/g, "<br/>") // Quebras de linha Windows
      .replace(/\n/g, "<br/>"); // Quebras de linha Unix
  }, []);

  // Função para processar dados acumulados
  const processBufferedData = useCallback(() => {
    if (dataBuffer.current.length > 0) {
      const processedData = processAnsiColors(dataBuffer.current);
      log(processedData);
      dataBuffer.current = "";
    }
  }, [log, processAnsiColors]);

  function tratarErroSerial(error: any) {
    if (!error) return "Erro desconhecido";

    if (error.name === "NotFoundError") {
      return "Nenhuma porta serial encontrada ou porta recusada pelo usuário.";
    }
    if (error.name === "NetworkError") {
      return "Falha ao abrir a porta serial (porta pode estar em uso por outro aplicativo).";
    }
    if (error.name === "SecurityError") {
      return "Permissão negada para acessar a porta serial.";
    }
    if (error.name === "InvalidStateError") {
      return "A porta já está aberta ou em estado inválido.";
    }
    if (error.message && error.message.includes("Failed to open serial port")) {
      return "Falha ao abrir a porta serial: verifique se ela está disponível e sem uso.";
    }
    return `Erro inesperado: ${error.message || error.name || error}`;
  }

  const readLoop = useCallback(async () => {
    if (!reader || isReading.current) {
      return;
    }

    isReading.current = true;
    log("Iniciando loop de leitura...");

    try {
      while (isReading.current) {
        try {
          const { value, done } = await reader.read();

          if (done) {
            log("Leitura finalizada.");
            break;
          }

          if (value) {
            // Acumular dados no buffer
            dataBuffer.current += value;

            // Processar após um pequeno delay para agrupar dados fragmentados
            if (processTimer.current) {
              clearTimeout(processTimer.current);
            }

            processTimer.current = setTimeout(() => {
              processBufferedData();
            }, 50);
          }
        } catch (error) {
          log("Erro na leitura: " + tratarErroSerial(error));
          break;
        }
      }
    } finally {
      isReading.current = false;
      if (reader) {
        reader.releaseLock();
      }
    }
  }, [log, reader, processBufferedData]);

  const handleDisconnect = useCallback(async () => {
    window.location.reload();
  }, []);

  const handleSelectPort = useCallback(async () => {
    try {
      if (!("serial" in navigator)) {
        toast.error("Serial API not supported");
        return;
      }

      // Fechar porta existente se houver
      if (port) {
        await handleDisconnect();
      }

      // @ts-ignore
      const newPort = await navigator.serial.requestPort();
      setPort(newPort);
      await newPort.open({
        baudRate: baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
      });

      log(`Porta aberta com baud rate ${baudRate}`);

      // Configurar streams de LEITURA (recebimento de dados)
      const textDecoder = new TextDecoderStream("utf-8"); // Especificar codificação UTF-8
      const readableStreamClosed = newPort.readable.pipeTo(
        textDecoder.writable
      );
      const inputStream = textDecoder.readable;

      // Configurar streams de ESCRITA (envio de dados)
      const textEncoder = new TextEncoderStream(); // Especificar codificação UTF-8
      textEncoder.readable.pipeTo(newPort.writable); // CORREÇÃO: pipe na direção correta

      setInputDone(readableStreamClosed);
      setOutputStream(textEncoder.writable); // Stream para escrita

      // Criar reader e writer
      const newReader = inputStream.getReader();
      const newWriter = textEncoder.writable.getWriter(); // Writer para enviar dados

      setReader(newReader);
      setWriter(newWriter); // Você precisa ter um estado para o writer também
    } catch (error: any) {
      log("Error selecting port: " + tratarErroSerial(error));
      toast.error(`Error selecting port: ${error.message}`);
    }
  }, [baudRate, log, port, handleDisconnect]);

  const closeAllPorts = useCallback(async () => {
    if (!("serial" in navigator)) {
      return;
    }

    try {
      // @ts-ignore
      const ports = await navigator.serial.getPorts();
      for (const port of ports) {
        if (port.readable || port.writable) {
          try {
            await port.close();
            log(`Porta fechada: ${port.getInfo()}`);
          } catch (error) {
            console.error("Erro ao fechar porta:", error);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao listar portas:", error);
    }
  }, [log]);

  useEffect(() => {
    return () => {
      handleDisconnect();
      closeAllPorts();
    };
  }, [closeAllPorts, handleDisconnect]);

  // Efeito para iniciar o loop de leitura quando o reader muda
  useEffect(() => {
    if (reader && !isReading.current) {
      readLoop();
    }
  }, [reader, readLoop]);

  return (
    <div className="grid xl:w-[70%] md:w-[100%] sx:w-full items-center gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/equipments">
              {t("app.equipment.equipments")}
            </BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbLink href="#">
              {t("app.equipment.configEquipment")}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold text-flex">
        {t("app.equipment.configEquipment")}
      </h1>

      <div className="grid gap-4 grid-cols-3">
        <Combobox
          options={commands.map((command: any) => ({
            value: command.value,
            label: `${command.name}`,
          }))}
          width="w-full"
          value={currentCommand?.value ?? null}
          onValueChange={(value) =>
            setCurrentCommand(
              commands.find((command: any) => command.value === value)
            )
          }
          placeholder={t("app.form.placeholder.selectCommand")}
          disabled={false}
        />

        <Input
          value={baudRate}
          type="text"
          width="w-full"
          placeholder="Baud rate"
          onChange={(e) => setBaudRate(Number(e.target.value))}
        />
        {!port ? (
          <Button className="w-full" onClick={handleSelectPort}>
            {t("app.btn.connect")}
          </Button>
        ) : (
          <Button
            className="w-full"
            variant="destructive"
            onClick={handleDisconnect}
          >
            {t("app.btn.disconnect")}
          </Button>
        )}
      </div>
      {
        commands.find((command) => command.value === currentCommand?.value)
          ?.form
      }
      <div
        id="log"
        className="w-full bg-black text-white h-[500px] overflow-y-auto p-4 rounded font-mono text-sm break-words"
        style={{ whiteSpace: "pre-wrap" }}
      ></div>
    </div>
  );
}
