import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { useDockerLogs } from "@/hooks/useDockerLogs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TerminalLogs from "@/components/ui/TerminalLogs";
import Loader from "@/components/ui/loader";

export default function DockerLogsCard() {
  const { dockerLogs, connected, goLive, stopLive } = useDockerLogs()
  const [selectedTab, setSelectedTab] = useState(null)
  const [connectionType, setConnectionType] = useState(null)

  useEffect(() => {
    if (dockerLogs.length > 0 && !selectedTab) {
      setSelectedTab(dockerLogs[0].name)
    }
  }, [dockerLogs])

  useEffect(() => {
    const localTypeConnection = localStorage.getItem('localTypeConnection')
    if (localTypeConnection) {
      setConnectionType(localTypeConnection)
    } else {
      localStorage.setItem('localTypeConnection', 'polling')
      setConnectionType('polling')
    }
  }, [])

  // Manage live subscription based on connectionType + selectedTab
  useEffect(() => {
    if (!selectedTab) return

    if (connectionType === 'Live') {
      goLive(selectedTab)
    } else {
      stopLive()
    }

    // Stop live stream on unmount or before switching
    return () => {
      if (connectionType === 'Live') stopLive()
    }
  }, [connectionType, selectedTab])

  const activeContainer = dockerLogs?.find(c => c.name === selectedTab)

  if (!connected || dockerLogs?.length === 0) {
    return (
      <Card className="md:mx-5 p-1 md:p-4">
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
        <div className="flex justify-between items-center mb-2">
          <TabsList>
            {dockerLogs?.map((container) => (
              <TabsTrigger key={container.name} value={container.name}>
                {container.name.split('-').slice(-2).join('-')}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-2">
            {connectionType === 'Live' && (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Live
              </span>
            )}
            <ButtonGroup aria-label="Button group">
              <Button
                className={`${connectionType == 'polling' ? 'bg-yellow-700' : 'bg-gray-800'} hover:bg-yellow-600 rounded-md`}
                onClick={() => {
                  setConnectionType('polling')
                  localStorage.setItem('localTypeConnection', 'polling')
                }}
              >
                Polling
              </Button>
              <Button
                className={`${connectionType == 'Live' ? 'bg-blue-500' : 'bg-gray-800'} hover:bg-blue-400 rounded-md`}
                onClick={() => {
                  setConnectionType('Live')
                  localStorage.setItem('localTypeConnection', 'Live')
                }}
              >
                Live
              </Button>
            </ButtonGroup>
          </div>
        </div>

        <TabsContent value={selectedTab} className="w-full">
          {activeContainer && (
            <TerminalLogs
              key={selectedTab}
              logs={activeContainer?.logs}
              containerName={selectedTab}
            />
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}