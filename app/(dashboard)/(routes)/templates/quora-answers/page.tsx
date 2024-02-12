"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import OutputBox from "@/components/output-box";
import { useRouter } from "next/navigation";
import { HistoryType } from "@prisma/client";

const formSchema = z.object({
  questionTitle: z.string().min(4).max(100),
  infoToInclude: z.string().min(10).max(1500),
  toneOfVoice: z.string().min(4),
});

const Page = () => {
  const [output, setOutput] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questionTitle: "",

      infoToInclude: "",
      toneOfVoice: "",
    },
  });

  const router = useRouter();

  const { mutate, isLoading } = useMutation({
    mutationFn: async ({
      infoToInclude,
      questionTitle,
      toneOfVoice,
    }: z.infer<typeof formSchema>) => {
      const { data } = await axios.post("/api/lumina", {
        prompt: `Write a Quora Question response to the question:- "${questionTitle}" the info that must be included in the answer is ${infoToInclude}, and the tone of voice of the response is ${toneOfVoice}. Remember to only write responses to the given Question title .`,
      });

      await axios.post("/api/history", {
        prompt: `question title : ${questionTitle} | tone of voice : ${toneOfVoice} | info to include : ${infoToInclude}`,
        content: data,
        type: HistoryType.QUORA_ANSWERS,
      });

      return data;
    },
    onSuccess(data, variables, context) {
      setOutput(data);
      router.refresh();
    },
    onError(error: any, variables, context) {
      toast.error(error.message);
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values);
  }
  return (
    <div className="flex-1 py-6 px-4 lg:px-8 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between mb-4">
            <FormField
              control={form.control}
              name="questionTitle"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Question Title or Link</FormLabel>
                  <FormControl>
                    <Input placeholder="Write the question" {...field} />
                  </FormControl>
                  <FormDescription className="text-right">
                    {form.watch("questionTitle").length}/100
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toneOfVoice"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Tone Of Voice</FormLabel>
                  <FormControl>
                    <Input placeholder="Witty, Persuasive" {...field} />
                  </FormControl>
                  <FormDescription className="text-right">
                    {form.watch("toneOfVoice").length}/100
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="infoToInclude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Information To Include</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write the necessary details for a comprehensive response."
                    className="resize-none"
                    {...field}
                    rows={5}
                  />
                </FormControl>
                <FormDescription className="text-right">
                  {form.watch("infoToInclude").length}/1500
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 size={20} className="mr-2 animate-spin" />}
            Generate
          </Button>
        </form>
      </Form>

      {output && <OutputBox output={output} />}
    </div>
  );
};

export default Page;
