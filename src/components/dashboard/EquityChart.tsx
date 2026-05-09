"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { month: "Jan", value: 45000 },
  { month: "Fev", value: 48000 },
  { month: "Mar", value: 47500 },
  { month: "Abr", value: 52000 },
  { month: "Mai", value: 58000 },
  { month: "Jun", value: 65000 },
  { month: "Jul", value: 68000 },
  { month: "Ago", value: 72000 },
  { month: "Set", value: 78000 },
  { month: "Out", value: 82000 },
  { month: "Nov", value: 84520 },
]

export function EquityChart() {
  return (
    <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg font-headline font-semibold">Evolução Patrimonial</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8633E6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8633E6" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(val) => `R$ ${val/1000}k`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F1824', borderColor: '#2a2230', borderRadius: '8px' }}
              itemStyle={{ color: '#8633E6' }}
              formatter={(val: number) => [`R$ ${val.toLocaleString()}`, 'Patrimônio']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8633E6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}