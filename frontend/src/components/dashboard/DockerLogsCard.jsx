import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useDockerLogs } from "@/hooks/useDockerLogs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TerminalLogs from "@/components/ui/TerminalLogs";
import Loader from "@/components/ui/loader";

export default function DockerLogsCard() {
  const { dockerLogs, connected } = useDockerLogs()
  const [selectedTab, setSelectedTab] = useState(null)

  useEffect(() => {
    if (dockerLogs.length > 0 && !selectedTab) {
      setSelectedTab(dockerLogs[0].name)
    }
  }, [dockerLogs])

  // Find the selected container by name, not by index
  const activeContainer = dockerLogs.find(c => c.name === selectedTab)

  if (!connected || dockerLogs.length === 0) {
    return (
      <Card className="w-full mx-5 p-4">
        <div className="w-full h-full flex flex-col justify-center items-center gap-2 py-24">
          <Loader />
          <h3 className="text-sm text-gray-400">Cargando logs . . .</h3>
        </div>
      </Card>
    )
  }

  return (
    <Card className="md:mx-5 p-1 px-2">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          {dockerLogs.map((container) => (
            <TabsTrigger key={container.name} value={container.name}>
              {container.name.split('-').slice(-2).join('-')}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedTab} className="w-full">
          {activeContainer && (
            <TerminalLogs
              key={selectedTab}
              logs={activeContainer.logs}
              containerName={selectedTab}
            />
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}