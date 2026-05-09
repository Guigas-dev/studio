"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

const data = [
  { month: "Jan", carteira: 100, cdi: 100 },
  { month: "Fev", carteira: 102.5, cdi: 101.1 },
  { month: "Mar", carteira: 101.8, cdi: 102.2 },
  { month: "Abr", carteira: 105.2, cdi: 103.3 },
  { month: "Mai", carteira: 108.4, cdi: 104.5 },
  { month: "Jun", carteira: 112.1, cdi: 105.7 },
  { month: "Jul", carteira: 110.5, cdi: 106.9 },
  { month: "Ago", carteira: 115.8, cdi: 108.1 },
  { month: "Set", carteira: 119.2, cdi: 109.3 },
  { month: "Out", carteira: 122.5, cdi: 110.5 },
  { month: "Nov", carteira: 125.4, cdi: 111.8 },
]

export function BenchmarkChart() {
  return (
    <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg font-headline font-semibold">Carteira vs CDI (Acumulado)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F1824', borderColor: '#2a2230', borderRadius: '8px' }}
              formatter={(val: number) => [`${val.toFixed(1)}%`, '']}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line
              type="monotone"
              dataKey="carteira"
              name="Minha Carteira"
              stroke="#8633E6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="cdi"
              name="CDI"
              stroke="#8a8a8a"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
