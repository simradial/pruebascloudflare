export interface SensorReading {
    ts?:  number; // Timestamp
    temp: number; // Celsius
    hum:  number; // Humidity
    txt?:  string; // Display Title
  }