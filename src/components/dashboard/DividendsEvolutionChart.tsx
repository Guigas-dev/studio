"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { month: "Jan", value: 320 },
  { month: "Fev", value: 450 },
  { month: "Mar", value: 380 },
  { month: "Abr", value: 510 },
  { month: "Mai", value: 490 },
  { month: "Jun", value: 620 },
  { month: "Jul", value: 580 },
  { month: "Ago", value: 710 },
  { month: "Set", value: 850 },
  { month: "Out", value: 790 },
  { month: "Nov", value: 920 },
]

export function DividendsEvolutionChart() {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg font-headline font-semibold">Evolução de Proventos</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2230" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#8a8a8a', fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#8a8a8a', fontSize: 12 }}
              tickFormatter={(val) => `R$ ${val}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F1824', borderColor: '#2a2230', borderRadius: '8px' }}
              itemStyle={{ color: '#0D9FFA' }}
              formatter={(val: number) => [`R$ ${val.toLocaleString()}`, 'Proventos']}
            />
            <Bar
              dataKey="value"
              fill="#0D9FFA"
              radius={[4, 4, 0, 0]}
              fillOpacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
