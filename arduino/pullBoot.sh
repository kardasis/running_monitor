# run once: arduino-cli core install arduino:avr
# run once: arduino-cli lib install CircularBuffer
# run once: arduino-cli lib install SparkFun_MPU-9250_9_DOF_IMU_Breakout

git pull &&
arduino-cli compile --fqbn arduino:avr:diecimila:cpu=atmega328 runner &&
arduino-cli upload -p /dev/ttyUSB0 --fqbn arduino:avr:diecimila:cpu=atmega328 runner
