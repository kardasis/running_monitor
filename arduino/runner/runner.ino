#include <CircularBuffer.h>
#include <Wire.h>
#define MPU9250_ADDRESS 0x68

#define ACC_FULL_SCALE_2_G 0x00
#define ACC_FULL_SCALE_4_G 0x08
#define ACC_FULL_SCALE_8_G 0x10
#define ACC_FULL_SCALE_16_G 0x18


#define TIMESTAMP_ARRAY_SIZE 13

int HALL_EFFECT_SENSOR_INPUT_PIN = 2;
int timestamps[TIMESTAMP_ARRAY_SIZE];
int sensor_state = 0;
CircularBuffer<long, TIMESTAMP_ARRAY_SIZE> rising_edges;
long lastMillis = millis();
float mph;
float incline;

void setup()
{
  Wire.begin();
  Serial.begin(9600);

   // Set accelerometers low pass filter at 5Hz
  I2CwriteByte(MPU9250_ADDRESS, 29, 0x06);

  // Configure accelerometers range
  I2CwriteByte(MPU9250_ADDRESS, 28, ACC_FULL_SCALE_2_G);

  pinMode(13, OUTPUT);

  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(HALL_EFFECT_SENSOR_INPUT_PIN, INPUT);

  attachInterrupt(digitalPinToInterrupt(HALL_EFFECT_SENSOR_INPUT_PIN), on_sensor_change, CHANGE);
}

void on_sensor_change()
{
  sensor_state = digitalRead(HALL_EFFECT_SENSOR_INPUT_PIN); // read the input pin
  digitalWrite(LED_BUILTIN, sensor_state);
  long timestamp = millis();
  if (sensor_state == HIGH && (timestamp - rising_edges.first() > 2))
  {
    if (rising_edges.unshift(timestamp))
    {
      // Serial.println('{"message": "buffer filling"}');
    }
    else
    {
      int delta_time_ms = rising_edges.first() - rising_edges.last();
      float cycles_per_second = 1000.0 * (TIMESTAMP_ARRAY_SIZE - 1) / delta_time_ms;
      mph = cycles_per_second / 2.933333;
      incline = 0.0;
    }
  }
}

void loop()
{
  long thisMillis = millis();

  // once per second, send a dataPoint
  // if (lastMillis + 1000 <= thisMillis) {
  //   lastMillis = thisMillis;
  //   Serial.print("{\"millis\": ");
  //   Serial.print(lastMillis);
  //   Serial.print(", \"speed\": ");
  //   Serial.print(mph);
  //   Serial.print(", \"incline\": ");
  //   Serial.print(incline);
  //   Serial.println("}");

  // }

  uint8_t Buf[6];
  I2Cread(MPU9250_ADDRESS, 0x3B, 14, Buf);

  // Create 16 bits values from 8 bits data
  int16_t ax = -(Buf[0] << 8 | Buf[1]);
  int16_t ay = -(Buf[2] << 8 | Buf[3]);
  int16_t az = Buf[4] << 8 | Buf[5];

  Serial.print(ax, DEC);
  Serial.print("\t");
  Serial.print(ay, DEC);
  Serial.print("\t");
  Serial.print(az, DEC);
  Serial.print("\t");

  Serial.println("");
  delay(50);
}

// This function read Nbytes bytes from I2C device at address Address.
// Put read bytes starting at register Register in the Data array.
void I2Cread(uint8_t Address, uint8_t Register, uint8_t Nbytes, uint8_t *Data)
{
  // Set register address
  Wire.beginTransmission(Address);
  Wire.write(Register);
  Wire.endTransmission();

  // Read Nbytes
  Wire.requestFrom(Address, Nbytes);
  uint8_t index = 0;
  while (Wire.available())
    Data[index++] = Wire.read();
}

// Write a byte (Data) in device (Address) at register (Register)
void I2CwriteByte(uint8_t Address, uint8_t Register, uint8_t Data)
{
  // Set register address
  Wire.beginTransmission(Address);
  Wire.write(Register);
  Wire.write(Data);
  Wire.endTransmission();
}
