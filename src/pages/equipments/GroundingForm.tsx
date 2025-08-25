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

export default function GroundingForm({ sendData }: Props) {
  const { t } = useTranslation();

  const FormSchema = z.object({
    grd1: z.boolean(),
    grd2: z.boolean(),
    grd3: z.boolean(),
    esd1: z.boolean(),
    esd2: z.boolean(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      grd1: false,
      grd2: false,
      grd3: false,
      esd1: false,
      esd2: false,
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
        {t("app.equipment.groundingConfig")}
      </h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          <div className="flex lg:flex-row flex-col gap-6">
            <FormField
              control={form.control}
              name="grd1"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange(true)
                            : field.onChange(false);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">GRD1</FormLabel>
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="grd2"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange(true)
                            : field.onChange(false);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">GRD2</FormLabel>
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="grd3"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange(true)
                            : field.onChange(false);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">GRD3</FormLabel>
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="esd1"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange(true)
                            : field.onChange(false);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">ESD1</FormLabel>
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="esd2"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange(true)
                            : field.onChange(false);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">ESD2</FormLabel>
                  </FormItem>
                );
              }}
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
