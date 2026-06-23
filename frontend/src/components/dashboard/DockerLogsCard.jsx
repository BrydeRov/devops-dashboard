import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Ban,
  MinusCircle,
  AlertTriangle,
  HelpCircle,
  GitBranch, 
  GitCommit,
} from 'lucide-react';
import { useDockerLogs } from "@/hooks/useDockerLogs";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";

export default function DockerLogsCard() {
  const { dockerLogs, connected } = useDockerLogs()

  console.log(dockerLogs)

  return(
    <Card size="sm" className="w-full max-w-sm">
        DOCKER LOGS CARD
     </Card>
  )
}