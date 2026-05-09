"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts"

const data = [
  { subject: 'Diversificação', A: 85, fullMark: 100 },
  { subject: 'Dividend Yield', A: 70, fullMark: 100 },
  { subject: 'Crescimento', A: 90, fullMark: 100 },
  { subject: 'Risco/Retorno', A: 75, fullMark: 100 },
  { subject: 'Liquidez', A: 60, fullMark: 100 },
  { subject: 'Eficiência Fiscal', A: 80, fullMark: 100 },
]

export function EfficiencyChart() {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg font-headline font-semibold">Eficiência da Carteira</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#2a2230" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#8a8a8a', fontSize: 10 }} />
            <Radar
              name="Eficiência"
              dataKey="A"
              stroke="#8633E6"
              fill="#8633E6"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
