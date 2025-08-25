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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CustomForm from "./CustomFrom";

export default function Config() {
  const { t } = useTranslation();

  const [currentCommand, setCurrentCommand] = useState<any>(null);
  const [port, setPort] = useState<any | null>(null);
  const baudRate = 115200;

  const [reader, setReader] = useState<any>(null);
  const [writer, setWriter] = useState<any>(null);
  const [, setInputDone] = useState<any>(null);
  const [, setOutputStream] = useState<any>(null);

  const dataBuffer = useRef<string>("");
  const processTimer = useRef<any>(null);
  const isReading = useRef<boolean>(false);

  const handleCommand = useCallback((command: string, data: any) => {
    switch (command) {
      case "apply":
        return `restart`;
      case "staticIP":
        return `set_ip_config ${data.static ? "1" : "0"} "${data.staticIP}" "${
          data.netmask
        }" "${data.gateway}"`;
      case "mqttConfig":
        return `set_mqtt_config ${data.host} ${data.port} "${data.user}" "${data.pass}"`;
      case "ntpConfig":
        return `set_ntp_config ${data.host} ${data.port}`;
      case "customConfig":
        return `${data.custom}`;
      case "groundingConfig":
        return `set_gnd_enabled ${data.grd1 ? 1 : 0} ${data.grd2 ? 1 : 0} ${
          data.grd3 ? 1 : 0
        } ${data.esd1 ? 1 : 0} ${data.esd2 ? 1 : 0}`;
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
      form: <StaticIPForm sendData={(data) => sendCommand("staticIP", data)} />,
    },
    {
      name: t("app.equipment.mqttConfig"),
      value: "mqttConfig",
      form: <MQTTForm sendData={(data) => sendCommand("mqttConfig", data)} />,
    },
    {
      name: t("app.equipment.ntpConfig"),
      value: "ntpConfig",
      form: <NTPForm sendData={(data) => sendCommand("ntpConfig", data)} />,
    },
    {
      name: t("app.equipment.groundingConfig"),
      value: "groundingConfig",
      form: (
        <GroundingForm
          sendData={(data) => sendCommand("groundingConfig", data)}
        />
      ),
    },
    {
      name: t("app.equipment.customCommand"),
      value: "customConfig",
      form: (
        <CustomForm sendData={(data) => sendCommand("customConfig", data)} />
      ),
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

  const handleToast = useCallback((message: string) => {
    switch (true) {
      case message.includes("Configurações de MQTT salvas"):
        toast.success("Configurações de MQTT salvas com sucesso!", {
          position: "top-right",
        });
        break;
      case message.includes("Configurações de rede salvas"):
        toast.success("Configurações de rede salvas com sucesso!", {
          position: "top-right",
        });
        break;
      case message.includes("Configurações de NTP salvas"):
        toast.success("Configurações de NTP salvas com sucesso!", {
          position: "top-right",
        });
        break;
      case message.includes("Configurações de monitoramento de GND salvas"):
        toast.success(
          "Configurações de monitoramento de GND salvas com sucesso!",
          {
            position: "top-right",
          }
        );
        break;
      case message.includes("Unrecognized command"):
        toast.error("Comando não reconhecido.", {
          position: "top-right",
        });
        break;
      case message.includes("Command returned non-zero error code"):
        toast.error("Ocorreu um erro ao processar o comando.", {
          position: "top-right",
        });
        break;
      case message.includes("Configuração de rede inválida"):
        toast.error("Configuração de rede inválida.", {
          position: "top-right",
        });
        break;
      default:
        break;
    }
  }, []);

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

  const processBufferedData = useCallback(() => {
    if (dataBuffer.current.length > 0) {
      const lines = dataBuffer.current.split("\r\n");

      const lastLine = lines.pop() || "";

      // Processar cada linha completa
      lines.forEach((line) => {
        if (line.trim().length > 0) {
          // Ignorar linhas vazias
          const processedData = processAnsiColors(line);
          handleToast(processedData);
          log(processedData);
        }
      });

      dataBuffer.current = lastLine;
    }
  }, [handleToast, log, processAnsiColors]);

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
            if (dataBuffer.current.length > 0) {
              const processedData = processAnsiColors(dataBuffer.current);
              handleToast(processedData);
              log(processedData);
              dataBuffer.current = "";
            }
            break;
          }

          if (value) {
            dataBuffer.current += value;

            if (dataBuffer.current.includes("\r\n")) {
              processBufferedData();
            }

            if (processTimer.current) {
              clearTimeout(processTimer.current);
            }

            processTimer.current = setTimeout(() => {
              if (dataBuffer.current.length > 0) {
                const processedData = processAnsiColors(dataBuffer.current);
                handleToast(processedData);
                log(processedData);
                dataBuffer.current = "";
              }
            }, 100);
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
  }, [log, reader, processBufferedData, handleToast, processAnsiColors]);

  const handleDisconnect = useCallback(async () => {
    window.location.reload();
  }, []);

  const handleSelectPort = useCallback(async () => {
    try {
      if (!("serial" in navigator)) {
        toast.error("Serial API not supported");
        return;
      }

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

      const textDecoder = new TextDecoderStream("utf-8");
      const readableStreamClosed = newPort.readable.pipeTo(
        textDecoder.writable
      );
      const inputStream = textDecoder.readable;

      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(newPort.writable);

      setInputDone(readableStreamClosed);
      setOutputStream(textEncoder.writable);

      // Criar reader e writer
      const newReader = inputStream.getReader();
      const newWriter = textEncoder.writable.getWriter();

      setReader(newReader);
      setWriter(newWriter);
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
            <BreadcrumbLink href="/">
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

      <div className="grid gap-4 grid-cols-4">
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

        {!port ? (
          <Button className="w-full" onClick={handleSelectPort}>
            {t("app.btn.connect")}
          </Button>
        ) : (
          <>
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleDisconnect}
            >
              {t("app.btn.disconnect")}
            </Button>
            <Button
              className="w-full"
              onClick={() => sendCommand("apply", null)}
            >
              {t("app.btn.apply")}
            </Button>
          </>
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
