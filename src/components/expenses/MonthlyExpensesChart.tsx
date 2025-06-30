
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { month: 'Jan', expenses: 45000 },
  { month: 'Feb', expenses: 42000 },
  { month: 'Mar', expenses: 48000 },
  { month: 'Apr', expenses: 46000 },
  { month: 'May', expenses: 51000 },
  { month: 'Jun', expenses: 49000 },
  { month: 'Jul', expenses: 52000 },
  { month: 'Aug', expenses: 48000 },
  { month: 'Sep', expenses: 47000 },
  { month: 'Oct', expenses: 45000 },
  { month: 'Nov', expenses: 43000 },
  { month: 'Dec', expenses: 41000 },
];

const MonthlyExpensesChart = () => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
        <p className="text-sm text-muted-foreground">Monthly expenses for the current year</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-sm"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-sm"
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="expenses" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
                name="Total Expenses"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyExpensesChart;
