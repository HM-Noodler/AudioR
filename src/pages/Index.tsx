import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Volume2, AlertCircle } from "lucide-react";
import { useVapi } from "@/hooks/useVapi";

const Index = () => {
  const [showTranscript, setShowTranscript] = useState(false);

  const {
    isConnected,
    isRecording,
    isSpeaking,
    volume,
    error,
    transcript,
    connect,
    disconnect,
    toggleMute,
    isInitialized,
  } = useVapi({
    apiKey: import.meta.env.VITE_VAPI_API_KEY || '',
    assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
  });

  const handleConnect = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect();
    }
  };

  const handleMicToggle = async () => {
    if (isConnected) {
      await toggleMute();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Voice Assistant</h1>
            <p className="text-muted-foreground">
              {isConnected ? "Connected and ready" : "Click connect to start"}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center space-y-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
              {isInitialized && (
                <span className="text-xs text-muted-foreground">
                  (Vapi Ready)
                </span>
              )}
            </div>

            {/* Main Microphone Button */}
            <div className="relative">
              <Button
                onClick={handleMicToggle}
                disabled={!isConnected}
                size="lg"
                className={`w-20 h-20 rounded-full transition-all ${
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600 text-white scale-110" 
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              
              {/* Volume indicator ring */}
              {isConnected && volume > 0 && (
                <div 
                  className="absolute inset-0 rounded-full border-4 border-blue-400 animate-pulse"
                  style={{ 
                    transform: `scale(${1 + volume * 0.3})`,
                    opacity: volume * 0.7 
                  }}
                />
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {isRecording ? "Listening... Tap to mute" : "Tap to start talking"}
            </p>

            {/* Connect/Disconnect Button */}
            <Button
              onClick={handleConnect}
              variant="outline"
              className="w-full"
              disabled={!isInitialized}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              {isConnected ? "Disconnect" : "Connect"}
            </Button>

            {/* Show Transcript Button */}
            {transcript && (
              <Button
                onClick={() => setShowTranscript(!showTranscript)}
                variant="ghost"
                size="sm"
              >
                {showTranscript ? "Hide" : "Show"} Transcript
              </Button>
            )}
          </div>

          {/* Recording Animation */}
          {isRecording && (
            <div className="flex justify-center space-x-1">
              {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
                <div
                  key={i}
                  className={`w-2 bg-primary rounded-full animate-pulse ${
                    i === 0 || i === 4 ? 'h-8' : i === 1 || i === 3 ? 'h-6' : 'h-4'
                  }`}
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          )}

          {/* Transcript Display */}
          {showTranscript && transcript && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-left">
              <h4 className="text-sm font-medium mb-2">Transcript:</h4>
              <p className="text-sm text-muted-foreground">{transcript}</p>
            </div>
          )}

          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="text-sm text-blue-600 font-medium animate-pulse">
              🔊 Assistant is speaking...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
