"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  FormField,
  FormItem,
  Form,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface Props {
  sendData: (data: any) => void;
}

export default function MQTTForm({ sendData }: Props) {
  const { t } = useTranslation();

  const FormSchema = z.object({
    host: z.string().min(1, {
      message: t("app.form.required"),
    }),
    port: z.string().min(1, {
      message: t("app.form.required"),
    }),
    user: z.string(),
    pass: z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      host: "192.168.1.16",
      port: "1883",
      user: "user",
      pass: "pass",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      sendData(data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="gap-6 flex flex-col">
      <h2 className="text-1xl font-bold text-flex">
        {t("app.equipment.mqttConfig")}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          <div className="flex lg:flex-row flex-col gap-6">
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem className="lg:w-[300px] w-full">
                  <FormLabel>{t("app.common.host")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("app.form.placeholder.host")}
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("app.common.port")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("app.form.placeholder.port")}
                      type="number"
                      {...field}
                      className="lg:w-[300px] w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("app.common.user")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("app.form.placeholder.mqttUser")}
                      type="text"
                      {...field}
                      className="lg:w-[300px] w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("app.common.pass")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("app.form.placeholder.mqttPassword")}
                      type="text"
                      {...field}
                      className="lg:w-[300px] w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="flex flex-end">
            {t("app.btn.send")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
