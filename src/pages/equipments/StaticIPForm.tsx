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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface Props {
  sendData: (data: any) => void;
}

export default function StaticIPForm({ sendData }: Props) {
  const { t } = useTranslation();

  const FormSchema = z
    .object({
      static: z.boolean(),
      staticIP: z.string().optional(),
      netmask: z.string().optional(),
      gateway: z.string().optional(),
    })
    .refine(
      (data) => {
        // Se static for true, todos os campos devem ser preenchidos
        if (data.static) {
          return data.staticIP && data.netmask && data.gateway;
        }
        // Se static for false, não há restrições
        return true;
      },
      {
        message: t("app.form.required"),
        path: ["staticIP"], // Define onde o erro será mostrado
      }
    );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      static: true,
      staticIP: "",
      netmask: "",
      gateway: "",
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
        {t("app.equipment.staticIPConfig")}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          <div>
            <FormField
              control={form.control}
              name="static"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          form.setValue("staticIP", "");
                          form.setValue("netmask", "");
                          form.setValue("gateway", "");
                          return checked
                            ? field.onChange(true)
                            : field.onChange(false);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      {t("app.equipment.useStaticIP")}
                    </FormLabel>
                  </FormItem>
                );
              }}
            />
          </div>
          {form.watch("static") && (
            <div className="flex lg:flex-row flex-col gap-6">
              <FormField
                control={form.control}
                name="staticIP"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t("app.equipment.staticIP")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("app.form.placeholder.staticIP")}
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
                name="netmask"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t("app.equipment.netmask")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("app.form.placeholder.netmask")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gateway"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t("app.equipment.gateway")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("app.form.placeholder.gateway")}
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <Button type="submit" className="flex flex-end">
            {t("app.btn.send")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
