int HALL_EFFECT_SENSOR_INPUT_PIN = 2;
int sensor_state = 0;
long lastMillis = millis();

void setup()
{
  Serial.begin(9600);

  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(HALL_EFFECT_SENSOR_INPUT_PIN, INPUT);

  attachInterrupt(digitalPinToInterrupt(HALL_EFFECT_SENSOR_INPUT_PIN), on_sensor_falling, FALLING);
}

void on_sensor_falling()
{
  long timestamp = millis();
  Serial.print(timestamp, DEC);
  Serial.print("\n");
}

void loop()
{ }
