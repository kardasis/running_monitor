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
  if (sensor_state == HIGH && (millis() - rising_edges.first() > 2))
  {
    if (rising_edges.unshift(millis())) // push timestamp to circular buffer
    {
      Serial.println("buffer filling");
    }
    else
    {
      int delta_time_ms = rising_edges.first() - rising_edges.last();
      float cycles_per_second = 1000.0 * (TIMESTAMP_ARRAY_SIZE - 1) / delta_time_ms;
      float mph = cycles_per_second/2.933333;

      for (int i = 0 ; i < TIMESTAMP_ARRAY_SIZE ; i++ ) {
        // Serial.print(rising_edges[i] - rising_edges.last());
        // Serial.print(", ");
      }
      // Serial.println("---");
      // Serial.println(delta_time_ms);
      Serial.println(mph);
    }
  }
  else
  {
    // Serial.println("falling edge");
  }
}

void loop() {}