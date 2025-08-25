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

import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  sendData: (data: any) => void;
}

export default function CustomForm({ sendData }: Props) {
  const { t } = useTranslation();

  const FormSchema = z.object({
    custom: z.string().min(1, {
      message: t("app.form.required"),
    }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      custom: "",
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
        {t("app.equipment.customConfig")}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          <div className="flex lg:flex-row flex-col gap-6">
            <FormField
              control={form.control}
              name="custom"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t("app.equipment.customCommand")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("app.form.placeholder.customCommand")}
                      {...field}
                      className="w-full"
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
