import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { CountUp } from "./count-up";

export default function StatCard({ title, value, icon: Icon, description }) {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium dark:text-gray-200">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <CountUp end={typeof value === "number" ? value : 0} className="text-2xl font-bold dark:text-white" />
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
