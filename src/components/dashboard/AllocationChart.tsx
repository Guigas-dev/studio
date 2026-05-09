"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

const data = [
  { name: 'Ações', value: 35, color: '#8633E6' },
  { name: 'FIIs', value: 25, color: '#0D9FFA' },
  { name: 'ETFs', value: 15, color: '#00C49F' },
  { name: 'Renda Fixa', value: 15, color: '#FFBB28' },
  { name: 'Cripto', value: 10, color: '#FF8042' },
]

export function AllocationChart() {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg font-headline font-semibold">Alocação por Ativo</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F1824', border: 'none', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(val) => [`${val}%`, 'Alocação']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}