#include <CircularBuffer.h>

#define TIMESTAMP_ARRAY_SIZE 13

int HALL_EFFECT_SENSOR_INPUT_PIN = 2;
int timestamps[TIMESTAMP_ARRAY_SIZE];
int sensor_state = 0;
CircularBuffer<long, TIMESTAMP_ARRAY_SIZE> rising_edges;

void setup()
{
  Serial.begin(9600);

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
      Serial.println("buffer filling");
    }
    else
    {
      int delta_time_ms = rising_edges.first() - rising_edges.last();
      float cycles_per_second = 1000.0 * (TIMESTAMP_ARRAY_SIZE - 1) / delta_time_ms;
      float mph = cycles_per_second/2.933333;
      float incline = 0.0;

      Serial.print("{\"millis\": ");
      Serial.print(timestamp);
      Serial.print(", \"speed\": ");
      Serial.print(mph);
      Serial.print(", \"incline\": ");
      Serial.print(incline);
      Serial.println("}");
    }
  }
}

void loop() {}
