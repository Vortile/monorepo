import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SectionCardsProps = {
  totalEmails: number;
  deliveryRate: number;
  bounceRate: number;
  activeRecipients: number;
};

export const SectionCards = ({
  totalEmails,
  deliveryRate,
  bounceRate,
  activeRecipients,
}: SectionCardsProps) => (
  <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-4">
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Total Emails Sent</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {totalEmails.toLocaleString()}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />—
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">Total emails in the system</div>
      </CardFooter>
    </Card>
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Delivery Rate</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {deliveryRate.toFixed(1)}%
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            {deliveryRate >= 95 ? <IconTrendingUp /> : <IconTrendingDown />}—
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">
          {deliveryRate >= 95 ? "Strong deliverability" : "Needs improvement"}
        </div>
      </CardFooter>
    </Card>
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Bounce Rate</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {bounceRate.toFixed(1)}%
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            {bounceRate <= 2 ? <IconTrendingDown /> : <IconTrendingUp />}—
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">
          {bounceRate <= 2 ? "Under control" : "Needs attention"}
        </div>
      </CardFooter>
    </Card>
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Active Recipients</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {activeRecipients.toLocaleString()}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />—
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">Unique recipients</div>
      </CardFooter>
    </Card>
  </div>
);
