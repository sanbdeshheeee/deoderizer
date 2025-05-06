# deoderizer
hello world

//*code starts here*//
"use client";

import { useState, useEffect, useId } from "react";
import * as React from "react"; // Import React for component definitions
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ArrowLeft, Bell, Info, Wrench, Bluetooth, BluetoothConnected, BluetoothSearching, BluetoothOff, Scan, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Component Definitions ---

// 1. CircularProgressIndicator Component Definition
interface CircularProgressIndicatorProps {
  title: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
}

function CircularProgressIndicator({
  title,
  value,
  min,
  max,
  unit,
  size = 110,
  strokeWidth = 10,
  colorClass = "stroke-accent",
}: CircularProgressIndicatorProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const range = max - min;
  const clampedValue = Math.max(min, Math.min(max, value));
  const progress = range === 0 ? 0 : ((clampedValue - min) / range);
  const offset = circumference * (1 - progress);
  const formattedValue = unit === 'ppm' ? clampedValue.toFixed(2) : clampedValue.toFixed(unit === '°C' ? 1 : 0);

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={0 0 ${size} ${size}}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            className="stroke-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            className={colorClass}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {formattedValue}
          </span>
           {unit !== '%' && unit !== 'AQI' && <span className="text-xs text-muted-foreground -mt-0.5">{unit}</span>}
           {unit === '%' && <span className="text-xs text-muted-foreground -mt-0.5">%</span>}
           {unit === 'AQI' && <span className="text-xs text-muted-foreground -mt-0.5">AQI</span>}
        </div>
      </div>
      <div className="flex justify-between w-full px-2 text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// 2. SprayControl Component Definition
interface SprayControlProps {
  label: string;
  min: number;
  max: number;
  initialValue?: number;
  step?: number;
  unit: string;
  onValueChange?: (value: number) => void;
}

function SprayControl({
  label,
  min,
  max,
  initialValue = min,
  step = 1,
  unit,
  onValueChange,
}: SprayControlProps) {
  const [value, setValue] = useState(initialValue);
  const sliderId = useId(); // Use useId hook here

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSliderChange = (newValue: number[]) => {
    const singleValue = newValue[0];
    setValue(singleValue);
    if (onValueChange) {
      onValueChange(singleValue);
    }
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full px-2 py-1">
       <Label htmlFor={sliderId} className="w-14 text-right text-base font-medium text-muted-foreground shrink-0">
         {value}{unit}
       </Label>
       <Button variant="ghost" size="sm" onClick={handleDecrement} className="text-muted-foreground hover:text-foreground shrink-0 h-6 w-6 p-0">
         <Minus className="h-3 w-3" />
         <span className="sr-only">Decrease {label}</span>
       </Button>
       <div className="flex-grow flex flex-col items-center gap-0.5">
          <span className="text-xs font-medium text-muted-foreground self-center">{label}</span>
          <Slider
            id={sliderId}
            min={min}
            max={max}
            step={step}
            value={[value]}
            onValueChange={handleSliderChange}
            className={cn("w-full", "data-[color=accent]")}
            aria-label={${label} control slider}
          />
       </div>
       <Button variant="ghost" size="sm" onClick={handleIncrement} className="text-muted-foreground hover:text-foreground shrink-0 h-6 w-6 p-0">
         <Plus className="h-3 w-3" />
         <span className="sr-only">Increase {label}</span>
       </Button>
     </div>
  );
}

// 3. DeodourizerHeader Component Definition
interface DeodourizerHeaderProps {
  status: string;
  userWantsToConnect: boolean;
  onConnectToggle: (checked: boolean) => void;
}

interface BluetoothDevice {
    id: string;
    name: string;
}

function DeodourizerHeader({ status, userWantsToConnect, onConnectToggle }: DeodourizerHeaderProps) {
  const isConnected = status === "Online";
  const isConnecting = status === "Connecting...";
  const isFailed = status === "Connection Failed";
  const isOffline = status === "Offline" || isFailed;

  const [isScanning, setIsScanning] = useState(false);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<BluetoothDevice[]>([]);

  let StatusIcon = BluetoothOff;
  let statusColorClass = "text-red-300";
  let ringColorClass = "bg-red-500";

  if (isConnected) {
     StatusIcon = BluetoothConnected;
     statusColorClass = "text-green-300";
     ringColorClass = "bg-green-400";
  } else if (isConnecting) {
      StatusIcon = BluetoothSearching;
      statusColorClass = "text-yellow-300";
      ringColorClass = "bg-yellow-400 animate-pulse";
  }

  const handleScanDevices = () => {
    if (isScanning) return;

    console.log("Scanning for Bluetooth devices...");
    setIsScanning(true);
    setDiscoveredDevices([]);
    setShowDeviceList(true);

    setTimeout(() => {
      const devices: BluetoothDevice[] = [
        { id: "00:11:22:33:AA:BB", name: "Living Room Speaker" },
        { id: "11:22:33:44:BB:CC", name: "My Phone" },
        { id: "22:33:44:55:CC:DD", name: "Smart Deodorizer XYZ" },
        { id: "33:44:55:66:DD:EE", name: "Kitchen Display" },
        { id: "44:55:66:77:EE:FF", name: "Unknown Device" },
        { id: "55:66:77:88:FF:00", name: "Bedroom Lamp" },
      ];
      setDiscoveredDevices(devices);
      setIsScanning(false);
      console.log("Scan complete. Devices found:", devices);
    }, 3000);
  };

  const handleSelectDevice = (device: BluetoothDevice) => {
      console.log("Attempting to connect to:", device.name, (${device.id}));
      setShowDeviceList(false);
      // Optionally trigger connection here
      // onConnectToggle(true); // Or handle connection directly if needed
  }

  return (
    <>
      <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-xl font-bold">DEODOURIZER</h1>
            <div className="flex items-center gap-1.5">
               <span className={cn("h-2 w-2 rounded-full", ringColorClass)}></span>
               <p className={cn("text-xs font-medium opacity-90", statusColorClass)}>{status}</p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center space-x-2 mr-1">
            <Switch
              id="bluetooth-connect"
              checked={userWantsToConnect}
              onCheckedChange={onConnectToggle}
              className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-muted-foreground/50 transform scale-90"
              disabled={isConnecting}
            />
            <Label htmlFor="bluetooth-connect" className="sr-only">
              {userWantsToConnect ? "Disconnect Bluetooth" : "Connect Bluetooth"}
            </Label>
            <StatusIcon className={cn("h-5 w-5", statusColorClass)} />
          </div>
           <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80" onClick={handleScanDevices} disabled={isScanning}>
             {isScanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Scan className="h-5 w-5" />}
             <span className="sr-only">{isScanning ? 'Scanning...' : 'Scan for devices'}</span>
           </Button>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
            <Wrench className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
            <Info className="h-5 w-5" />
            <span className="sr-only">Information</span>
          </Button>
        </div>
      </header>

       <Sheet open={showDeviceList} onOpenChange={setShowDeviceList}>
          <SheetContent side="bottom" className="h-3/4 flex flex-col">
             <SheetHeader>
               <SheetTitle>{isScanning ? 'Scanning for Devices...' : 'Available Bluetooth Devices'}</SheetTitle>
               <SheetDescription>
                 {isScanning ? 'Please wait while we search for nearby devices.' : 'Select a device to connect.'}
               </SheetDescription>
             </SheetHeader>
             <div className="flex-grow overflow-hidden py-4">
                <ScrollArea className="h-full">
                  {isScanning && (
                     <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                     </div>
                   )}
                   {!isScanning && discoveredDevices.length === 0 && (
                      <div className="flex justify-center items-center h-full text-muted-foreground">
                         No devices found. Try scanning again.
                      </div>
                    )}
                   {!isScanning && discoveredDevices.length > 0 && (
                     <div className="grid gap-2">
                        {discoveredDevices.map((device) => (
                           <Button
                              key={device.id}
                              variant="outline"
                              className="justify-start w-full text-left h-auto py-2 px-3"
                              onClick={() => handleSelectDevice(device)}
                            >
                               <Bluetooth className="mr-2 h-4 w-4" />
                               <div className="flex flex-col">
                                 <span className="font-medium">{device.name}</span>
                                 <span className="text-xs text-muted-foreground">{device.id}</span>
                               </div>
                             </Button>
                         ))}
                      </div>
                     )}
                 </ScrollArea>
             </div>
             <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                {!isScanning && (
                    <Button onClick={handleScanDevices} disabled={isScanning}>
                      <Scan className="mr-2 h-4 w-4" />
                      Rescan
                   </Button>
                )}
              </SheetFooter>
          </SheetContent>
        </Sheet>
    </>
  );
}


// --- Main DeodourizerDashboard Component ---

export default function DeodourizerDashboard() {
  // --- Sensor States ---
  const [temperature, setTemperature] = useState(31.3);
  const [humidity, setHumidity] = useState(56.2);
  const [airQuality, setAirQuality] = useState(80); // AQI
  const [hcho, setHcho] = useState(1.37); // Formaldehyde in ppm

  // --- Control States ---
  const [spray1Interval, setSpray1Interval] = useState(10); // minutes
  const [spray2Interval, setSpray2Interval] = useState(40); // minutes
  const [fanSpeed, setFanSpeed] = useState(70); // percentage
  const [isDeviceOn, setIsDeviceOn] = useState(true); // On/Off state

  // --- Connection State ---
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Offline");
  const [userWantsToConnect, setUserWantsToConnect] = useState(false);

  // Simulate connection attempt
  useEffect(() => {
    let connectTimeout: NodeJS.Timeout | null = null;
    if (userWantsToConnect && !isConnected) {
      setStatusMessage("Connecting...");
      connectTimeout = setTimeout(() => {
        const success = Math.random() > 0.3;
        if (success) {
          setIsConnected(true);
          setStatusMessage("Online");
          console.log("Bluetooth Connected (Simulated)");
        } else {
          setIsConnected(false);
          setUserWantsToConnect(false);
          setStatusMessage("Connection Failed");
          setTimeout(() => setStatusMessage("Offline"), 2000);
          console.error("Bluetooth Connection Failed (Simulated)");
        }
      }, 1500);
    } else if (!userWantsToConnect && isConnected) {
      setIsConnected(false);
      setStatusMessage("Offline");
      console.log("Bluetooth Disconnected (Simulated)");
    }
    return () => {
      if (connectTimeout) clearTimeout(connectTimeout);
    };
  }, [userWantsToConnect, isConnected]);

  // Simulate data updates if connected and device is on
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isConnected && isDeviceOn) {
      intervalId = setInterval(() => {
        setTemperature((prev) => parseFloat((prev + (Math.random() - 0.5) * 0.2).toFixed(1)));
        setHumidity((prev) => parseFloat((prev + (Math.random() - 0.5) * 1).toFixed(0)));
        setAirQuality((prev) => parseFloat((prev + (Math.random() - 0.5) * 5).toFixed(0)));
        setHcho((prev) => parseFloat((prev + (Math.random() - 0.5) * 0.05).toFixed(2)));

        // Clamp values
        setTemperature(t => Math.max(0, Math.min(100, t)));
        setHumidity(h => Math.max(0, Math.min(100, h)));
        setAirQuality(aq => Math.max(0, Math.min(500, aq)));
        setHcho(hc => Math.max(0, Math.min(3, hc)));
        setFanSpeed(fs => Math.max(0, Math.min(100, fs))); // Also clamp fan speed if needed
      }, 3000);
    } else {
      if (intervalId) clearInterval(intervalId);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isConnected, isDeviceOn]);

  // --- Handlers ---
  const handleToggleDevice = (checked: boolean) => {
    setIsDeviceOn(checked);
    console.log(Device toggled ${checked ? 'ON' : 'OFF'});
  };

  const handleConnectionToggle = (checked: boolean) => {
    setUserWantsToConnect(checked);
    if (!checked) {
      setIsConnected(false);
      setStatusMessage("Offline");
    }
  };

  const handleFanSpeedChange = (value: number[]) => {
    setFanSpeed(value[0]);
  };

  // --- Render ---
  return (
    // Apply aspect ratio and max-width for phone-like display
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-col h-screen max-w-md mx-auto bg-background shadow-lg overflow-hidden aspect-[9/16]">
        <DeodourizerHeader
          status={statusMessage}
          userWantsToConnect={userWantsToConnect}
          onConnectToggle={handleConnectionToggle}
        />

        <div className="flex-grow flex p-3 gap-3 overflow-y-auto">
          {/* Left side */}
          <div className="flex-grow flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <CircularProgressIndicator
                title="TEMPERATURE"
                value={temperature}
                min={0}
                max={100}
                unit="°C"
                colorClass="stroke-accent"
                size={110}
              />
              <CircularProgressIndicator
                title="HUMIDITY"
                value={humidity}
                min={0}
                max={100}
                unit="%"
                colorClass="stroke-accent"
                size={110}
              />
              <CircularProgressIndicator
                title="AIR QUALITY"
                value={airQuality}
                min={0}
                max={500}
                unit="AQI"
                colorClass="stroke-gray-400"
                size={110}
              />
              <CircularProgressIndicator
                title="HCHO"
                value={hcho}
                min={0}
                max={3}
                unit="ppm"
                colorClass="stroke-accent"
                size={110}
              />
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <SprayControl
                 label="SPRAY 1"
                 min={5}
                 max={60}
                 step={5}
                 initialValue={spray1Interval}
                 unit="min"
                 onValueChange={setSpray1Interval}
              />
               <SprayControl
                 label="SPRAY 2"
                 min={5}
                 max={60}
                 step={5}
                 initialValue={spray2Interval}
                 unit="min"
                 onValueChange={setSpray2Interval}
               />
            </div>
          </div>

          {/* Right side */}
          <div className="flex-shrink-0 w-16 flex flex-col items-center justify-between h-[calc(100%-0.5rem)] self-center gap-3 bg-card rounded-lg p-1.5 shadow-inner">
              <div className="flex-grow flex flex-col items-center justify-center w-full">
                 <Label className="text-xs text-muted-foreground mb-1">FAN</Label>
                 <div className="relative h-full w-6 bg-muted rounded-full overflow-hidden my-1">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-accent transition-all duration-300 ease-out"
                      style={{ height: ${fanSpeed}% }}
                    />
                   <Slider
                      orientation="vertical"
                      min={0}
                      max={100}
                      step={1}
                      value={[fanSpeed]}
                      onValueChange={handleFanSpeedChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Fan Speed"
                    />
                 </div>
                  <span className="text-sm font-medium text-foreground mt-1">{fanSpeed.toFixed(0)}%</span>
               </div>

               <div className={cn(
                      "relative z-10 p-1.5 rounded-full flex items-center justify-center",
                       isDeviceOn ? 'bg-destructive' : 'bg-muted'
                  )}>
                    <Switch
                      checked={isDeviceOn}
                      onCheckedChange={handleToggleDevice}
                      className="data-[state=checked]:bg-accent data-[state=unchecked]:bg-muted-foreground transform scale-75"
                      aria-label="Deodorizer On/Off"
                    />
               </div>
          </div>
        </div>
      </div>
    </main>
  );
}
