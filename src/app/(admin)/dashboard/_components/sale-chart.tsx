"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
     Card,
     CardContent,
     CardDescription,
     CardFooter,
     CardHeader,
     CardTitle,
} from "@/components/ui/card";
import {
     ChartContainer,
     ChartTooltip,
     ChartTooltipContent,
} from "@/components/ui/chart";
const chartData = [
     { month: "January", desktop: 186, mobile: 80 },
     { month: "February", desktop: 305, mobile: 200 },
     { month: "March", desktop: 237, mobile: 120 },
     { month: "April", desktop: 73, mobile: 190 },
     { month: "May", desktop: 209, mobile: 130 },
     { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
     desktop: {
          label: "Desktop",
          color: "hsl(var(--chart-1))",
     },
     mobile: {
          label: "Mobile",
          color: "hsl(var(--chart-2))",
     },
}; // Remove `satisfies ChartConfig` as it is TypeScript-specific

export function SaleChart() {
     return (
          <Card className="md:w-1/2 w-full">
               <CardHeader>
                    <CardTitle>Bar Chart - Multiple</CardTitle>
                    <CardDescription>January - June 2025</CardDescription>
               </CardHeader>
               <CardContent>
                    <ChartContainer
                         config={chartConfig}
                         className="dark:text-white"
                    >
                         <BarChart
                              accessibilityLayer
                              data={chartData}
                              className="dark:text-white"
                         >
                              <CartesianGrid
                                   vertical={false}
                                   className="dark:text-white"
                              />
                              <XAxis
                                   dataKey="month"
                                   tickLine={true}
                                   tickMargin={10}
                                   axisLine={true}
                                   tickFormatter={(value) => value.slice(0, 3)}
                                   className="dark:text-white"
                              />
                              <ChartTooltip
                                   cursor={false}
                                   content={
                                        <ChartTooltipContent indicator="dashed" />
                                   }
                                   className="dark:text-white"
                              />
                              <Bar
                                   dataKey="desktop"
                                   fill="var(--color-desktop)"
                                   radius={4}
                                   className="dark:text-white"
                              />
                              <Bar
                                   dataKey="mobile"
                                   fill="var(--color-mobile)"
                                   radius={4}
                                   className="dark:text-white"
                              />
                         </BarChart>
                    </ChartContainer>
               </CardContent>
               <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none">
                         Trending up by 5.2% this month{" "}
                         <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-primaryColor">
                         Showing total visitors for the last 6 months
                    </div>
               </CardFooter>
          </Card>
     );
}
