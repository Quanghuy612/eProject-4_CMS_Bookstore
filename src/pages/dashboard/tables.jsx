import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Progress,
  Button,
  IconButton,
  Input,
  Select,
  Option,
  Switch
} from "@material-tailwind/react";
import { 
  EllipsisVerticalIcon,
  ClockIcon,
  CalendarIcon,
  CalendarDaysIcon,
  SunIcon,
  MoonIcon,
  ArrowPathIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
  BellIcon,
  GlobeAltIcon,
  MapPinIcon,
  CloudIcon,
  WifiIcon,
  Battery100Icon,
  SignalIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import { 
  EllipsisVerticalIcon as EllipsisVerticalSolid,
  SunIcon as SunSolid,
  MoonIcon as MoonSolid
} from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";

export function Tables() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClockRunning, setIsClockRunning] = useState(true);
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Ho_Chi_Minh");
  const [temperature, setTemperature] = useState(28);
  const [weather, setWeather] = useState("sunny");
  const [batteryLevel, setBatteryLevel] = useState(85);

  useEffect(() => {
    let interval;
    if (isClockRunning) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockRunning]);

  const formatTime = (date, is24HourFormat) => {
    return date.toLocaleTimeString('vi-VN', {
      hour12: !is24HourFormat,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDayOfWeek = (date) => {
    return date.toLocaleDateString('vi-VN', { weekday: 'long' });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Chào buổi sáng! ☀️";
    if (hour < 18) return "Chào buổi chiều! 🌤️";
    return "Chào buổi tối! 🌙";
  };

  const getWeatherIcon = () => {
    switch(weather) {
      case 'sunny': return <SunIcon className="h-8 w-8 text-yellow-500" />;
      case 'cloudy': return <CloudIcon className="h-8 w-8 text-gray-500" />;
      case 'rainy': return <CloudIcon className="h-8 w-8 text-blue-500" />;
      default: return <SunIcon className="h-8 w-8 text-yellow-500" />;
    }
  };

  const toggleClock = () => {
    setIsClockRunning(!isClockRunning);
  };

  const resetClock = () => {
    setCurrentTime(new Date());
  };

  const timezones = [
    { value: "Asia/Ho_Chi_Minh", label: "Hà Nội, Việt Nam" },
    { value: "Asia/Tokyo", label: "Tokyo, Nhật Bản" },
    { value: "America/New_York", label: "New York, USA" },
    { value: "Europe/London", label: "London, UK" },
    { value: "Australia/Sydney", label: "Sydney, Australia" }
  ];

  const getCurrentTimezone = () => {
    return timezones.find(tz => tz.value === selectedTimezone)?.label || "Hà Nội, Việt Nam";
  };

  return (
    <div className="mt-8 mb-8 flex flex-col gap-8">
      {/* Modern Clock and Date Dashboard */}
      <Card className="shadow-xl overflow-hidden">
        <CardHeader 
          variant="gradient" 
          color={isDarkMode ? "gray" : "blue"} 
          className="p-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Typography variant="h4" color="white" className="font-bold">
                📅 Bảng điều khiển Thời gian
              </Typography>
              <Typography variant="small" color="white" className="opacity-90">
                {getGreeting()}
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                color="white"
                checked={isDarkMode}
                onChange={() => setIsDarkMode(!isDarkMode)}
                label={
                  <div className="flex items-center gap-2">
                    {isDarkMode ? (
                      <MoonIcon className="h-4 w-4 text-white" />
                    ) : (
                      <SunIcon className="h-4 w-4 text-white" />
                    )}
                    <Typography color="white" className="font-medium">
                      {isDarkMode ? "Tối" : "Sáng"}
                    </Typography>
                  </div>
                }
              />
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Clock Card */}
            <Card className="lg:col-span-2 shadow-lg border border-blue-gray-100">
              <CardBody className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  {/* Digital Clock */}
                  <div className="mb-6">
                    <Typography variant="h1" className="font-bold text-6xl md:text-7xl tracking-tighter bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatTime(currentTime, is24Hour)}
                    </Typography>
                    <Typography variant="h6" color="blue-gray" className="mt-2">
                      {formatDate(currentTime)}
                    </Typography>
                  </div>

                  {/* Analog Clock Visualization */}
                  <div className="relative w-64 h-64 mx-auto my-8">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                    
                    {/* Hour marks */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const angle = (i * 30) * Math.PI / 180;
                      const x = 120 + 100 * Math.sin(angle);
                      const y = 120 - 100 * Math.cos(angle);
                      return (
                        <div
                          key={i}
                          className="absolute w-8 h-8 flex items-center justify-center text-lg font-bold"
                          style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
                        >
                          {i === 0 ? 12 : i}
                        </div>
                      );
                    })}

                    {/* Hour hand */}
                    <div
                      className="absolute bg-blue-900 rounded-full"
                      style={{
                        width: '6px',
                        height: '60px',
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -100%) rotate(${currentTime.getHours() % 12 * 30 + currentTime.getMinutes() * 0.5}deg)`,
                        transformOrigin: 'bottom center'
                      }}
                    />

                    {/* Minute hand */}
                    <div
                      className="absolute bg-blue-700 rounded-full"
                      style={{
                        width: '4px',
                        height: '80px',
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -100%) rotate(${currentTime.getMinutes() * 6}deg)`,
                        transformOrigin: 'bottom center'
                      }}
                    />

                    {/* Second hand */}
                    <div
                      className="absolute bg-red-500 rounded-full"
                      style={{
                        width: '2px',
                        height: '90px',
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -100%) rotate(${currentTime.getSeconds() * 6}deg)`,
                        transformOrigin: 'bottom center'
                      }}
                    />

                    {/* Center dot */}
                    <div className="absolute w-4 h-4 bg-blue-900 rounded-full left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>

                  {/* Clock Controls */}
                  <div className="flex items-center gap-4 mt-6">
                    <Button
                      color={isClockRunning ? "red" : "green"}
                      variant="gradient"
                      className="flex items-center gap-2"
                      onClick={toggleClock}
                    >
                      {isClockRunning ? (
                        <>
                          <PauseIcon className="h-4 w-4" />
                          Tạm dừng
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4" />
                          Tiếp tục
                        </>
                      )}
                    </Button>
                    
                    <Button
                      color="blue"
                      variant="outlined"
                      className="flex items-center gap-2"
                      onClick={resetClock}
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      Đặt lại
                    </Button>
                    
                    <Switch
                      checked={is24Hour}
                      onChange={() => setIs24Hour(!is24Hour)}
                      label={
                        <Typography variant="small" className="font-medium">
                          {is24Hour ? "24h" : "12h"}
                        </Typography>
                      }
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Sidebar with additional info */}
            <div className="space-y-6">
              {/* Timezone Card */}
              <Card className="shadow-md border border-blue-gray-100">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <GlobeAltIcon className="h-6 w-6 text-blue-500" />
                    <Typography variant="h6" color="blue-gray" className="font-bold">
                      Múi giờ
                    </Typography>
                  </div>
                  
                  <Select
                    label="Chọn múi giờ"
                    value={selectedTimezone}
                    onChange={(value) => setSelectedTimezone(value)}
                    className="mb-4"
                  >
                    {timezones.map((tz) => (
                      <Option key={tz.value} value={tz.value}>
                        {tz.label}
                      </Option>
                    ))}
                  </Select>
                  
                  <div className="flex items-center gap-2 text-sm text-blue-gray-600">
                    <MapPinIcon className="h-4 w-4" />
                    <span>Hiện tại: {getCurrentTimezone()}</span>
                  </div>
                </CardBody>
              </Card>

              {/* Weather Card */}
              <Card className="shadow-md border border-blue-gray-100">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getWeatherIcon()}
                      <Typography variant="h6" color="blue-gray" className="font-bold">
                        Thời tiết
                      </Typography>
                    </div>
                    <Chip
                      color="blue"
                      value={`${temperature}°C`}
                      className="font-bold"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Typography variant="small" color="blue-gray">
                        Nhiệt độ:
                      </Typography>
                      <Typography variant="small" className="font-bold">
                        {temperature}°C
                      </Typography>
                    </div>
                    <div className="flex justify-between">
                      <Typography variant="small" color="blue-gray">
                        Độ ẩm:
                      </Typography>
                      <Typography variant="small" className="font-bold">
                        65%
                      </Typography>
                    </div>
                    <div className="flex justify-between">
                      <Typography variant="small" color="blue-gray">
                        Gió:
                      </Typography>
                      <Typography variant="small" className="font-bold">
                        10 km/h
                      </Typography>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Device Status Card */}
              <Card className="shadow-md border border-blue-gray-100">
                <CardBody className="p-6">
                  <Typography variant="h6" color="blue-gray" className="font-bold mb-4">
                    Trạng thái thiết bị
                  </Typography>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <WifiIcon className="h-5 w-5 text-green-500" />
                        <Typography variant="small">Wi-Fi</Typography>
                      </div>
                      <Chip
                        color="green"
                        value="Đã kết nối"
                        size="sm"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SignalIcon className="h-5 w-5 text-green-500" />
                        <Typography variant="small">Tín hiệu</Typography>
                      </div>
                      <Chip
                        color="green"
                        value="Mạnh"
                        size="sm"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Battery100Icon className="h-5 w-5 text-green-500" />
                        <Typography variant="small">Pin</Typography>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={batteryLevel} color="green" className="w-20" />
                        <Typography variant="small" className="font-bold">
                          {batteryLevel}%
                        </Typography>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DevicePhoneMobileIcon className="h-5 w-5 text-blue-500" />
                        <Typography variant="small">Thiết bị</Typography>
                      </div>
                      <Chip
                        color="blue"
                        value="Online"
                        size="sm"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Day Progress Card */}
              <Card className="shadow-md border border-blue-gray-100">
                <CardBody className="p-6">
                  <Typography variant="h6" color="blue-gray" className="font-bold mb-4">
                    Tiến độ ngày
                  </Typography>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Typography variant="small">Ngày đã trôi qua</Typography>
                        <Typography variant="small" className="font-bold">
                          {((currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60) * 100).toFixed(1)}%
                        </Typography>
                      </div>
                      <Progress 
                        value={(currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60) * 100}
                        color="blue" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <Typography variant="small">Tuần này</Typography>
                        <Typography variant="small" className="font-bold">
                          {((currentTime.getDay() + 1) / 7 * 100).toFixed(1)}%
                        </Typography>
                      </div>
                      <Progress 
                        value={(currentTime.getDay() + 1) / 7 * 100}
                        color="green" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <Typography variant="small">Tháng này</Typography>
                        <Typography variant="small" className="font-bold">
                          {(currentTime.getDate() / 30 * 100).toFixed(1)}%
                        </Typography>
                      </div>
                      <Progress 
                        value={currentTime.getDate() / 30 * 100}
                        color="purple" 
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="border border-blue-gray-100 shadow-sm">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h6" className="text-blue-gray-600">
                      Ngày trong tuần
                    </Typography>
                    <Typography variant="h4" className="font-bold text-blue-gray-900">
                      {formatDayOfWeek(currentTime)}
                    </Typography>
                  </div>
                  <CalendarDaysIcon className="h-10 w-10 text-blue-500" />
                </div>
              </CardBody>
            </Card>

            <Card className="border border-blue-gray-100 shadow-sm">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h6" className="text-blue-gray-600">
                      Tuần thứ
                    </Typography>
                    <Typography variant="h4" className="font-bold text-blue-gray-900">
                      {Math.ceil(currentTime.getDate() / 7)}
                    </Typography>
                  </div>
                  <CalendarIcon className="h-10 w-10 text-green-500" />
                </div>
              </CardBody>
            </Card>

            <Card className="border border-blue-gray-100 shadow-sm">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h6" className="text-blue-gray-600">
                      Ngày trong năm
                    </Typography>
                    <Typography variant="h4" className="font-bold text-blue-gray-900">
                      {Math.floor((currentTime - new Date(currentTime.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))}
                    </Typography>
                  </div>
                  <SunIcon className="h-10 w-10 text-yellow-500" />
                </div>
              </CardBody>
            </Card>

            <Card className="border border-blue-gray-100 shadow-sm">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h6" className="text-blue-gray-600">
                      Múi giờ
                    </Typography>
                    <Typography variant="h4" className="font-bold text-blue-gray-900">
                      GMT+7
                    </Typography>
                  </div>
                  <GlobeAltIcon className="h-10 w-10 text-purple-500" />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Calendar Widget */}
          <Card className="mt-8 border border-blue-gray-100 shadow-md">
            <CardHeader className="bg-blue-50 p-4">
              <Typography variant="h5" color="blue-gray" className="font-bold">
                📅 Lịch tháng {currentTime.getMonth() + 1}/{currentTime.getFullYear()}
              </Typography>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-7 gap-2 text-center">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                  <div key={day} className="font-bold text-blue-gray-700 p-2">
                    {day}
                  </div>
                ))}
                
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - new Date(currentTime.getFullYear(), currentTime.getMonth(), 1).getDay() + 2;
                  const isToday = day === currentTime.getDate();
                  const isCurrentMonth = day > 0 && day <= new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 0).getDate();
                  
                  return (
                    <div
                      key={i}
                      className={`
                        p-3 rounded-lg transition-all duration-200
                        ${isToday 
                          ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                          : isCurrentMonth 
                            ? 'hover:bg-blue-50 cursor-pointer' 
                            : 'text-gray-300'
                        }
                      `}
                    >
                      <Typography 
                        variant="small" 
                        className={`
                          font-bold 
                          ${isToday ? 'text-white' : isCurrentMonth ? 'text-blue-gray-800' : 'text-gray-400'}
                        `}
                      >
                        {isCurrentMonth ? day : ''}
                      </Typography>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center mt-6">
                <Typography variant="small" color="blue-gray" className="italic">
                  Hôm nay là ngày {currentTime.getDate()} tháng {currentTime.getMonth() + 1} năm {currentTime.getFullYear()}
                </Typography>
              </div>
            </CardBody>
          </Card>
        </CardBody>
      </Card>
    </div>
  );
}

export default Tables;