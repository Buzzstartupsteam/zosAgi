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
import MultipleOutput from "@/components/mutliple-output";
import OutputBox from "@/components/output-box";
import { HistoryType } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcher } from "@/lib/utils";

const formSchema = z.object({
  companyName: z.string().min(4).max(100),
  productDescription: z.string().min(10).max(1500),
  pageTitle: z.string().min(4).max(100),
  keywords: z.string().min(4),
  numberOfGeneration: z.number(),
});

const Page = () => {
  const [output, setOutput] = useState<string[] | []>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      pageTitle: "",
      productDescription: "",
      keywords: "",
      numberOfGeneration: 3,
    },
  });
  const router = useRouter();
  const { mutate, isLoading } = useMutation({
    mutationKey: ["product"],
    mutationFn: async ({
      pageTitle,
      productDescription,
      companyName,
      keywords,
      numberOfGeneration,
    }: z.infer<typeof formSchema>) => {
      const prompt = `Write an SEO meta title and meta description of the page with page title ${pageTitle}, for the company named ${companyName}. The description of the product is ${productDescription}. Write an SEO meta title and meta description using the keywords ${keywords}. The SEO meta title and meta description should be compelling so that the viewer is tempted to interact. Remember to only write an SEO meta title and meta description for the given input page title. Note:- Do not write other than the SEO meta title and meta description. Important point:- The meta-title has a word limit of 10 words so do not write the meta-title more than 10 words and the meta-description has a word limit of 20 words so do not write the meta-description more than 20 words.
      Response format:-
      Title:- meta title
      Meta-Description:- meta description`;
      const dataArray = await Promise.all(
        Array(numberOfGeneration)
          .fill("")
          .map((_, i) => fetcher(prompt))
      );
      await axios.post("/api/history", {
        prompt: `page title : ${pageTitle} | company name : ${companyName} | keywords : ${keywords} | product description : ${productDescription}`,
        content: dataArray.join("|"),
        type: HistoryType.SEO_TITLE_AND_META_DESCRIPTIONS,
      });
      return dataArray;
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
              name="companyName"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name of your company" {...field} />
                  </FormControl>
                  <FormDescription className="text-right">
                    {form.watch("companyName").length}/100
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pageTitle"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Page Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Page title" {...field} />
                  </FormControl>
                  <FormDescription className="text-right">
                    {form.watch("pageTitle").length}/100
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="Keywords for the page" {...field} />
                  </FormControl>
                  <FormDescription className="text-right">
                    {form.watch("keywords").length}/100
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="numberOfGeneration"
            render={({ field }) => (
              <FormItem className="space-y-1 my-4">
                <FormLabel>Number Of Generations</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="bg-transparent text-gray-800 dark:text-white w-52 capitalize">
                      <SelectValue
                        className="capitalize"
                        placeholder="Number Of Generations"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[15rem] overflow-y-auto">
                    {[1, 2, 3].map((num) => (
                      <SelectItem
                        className="capitalize"
                        key={num}
                        value={num.toString()}
                      >
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What is the page about?"
                    {...field}
                    className="resize-none"
                    rows={5}
                  />
                </FormControl>
                <FormDescription className="text-right">
                  {form.watch("productDescription").length}/1500
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

      <MultipleOutput outputs={output} />
    </div>
  );
};

export default Page;
