git pull &&
arduino-cli compile --fqbn arduino:avr:diecimila:cpu=atmega328 runner &&
arduino-cli upload -p /dev/ttyUSB0 --fqbn arduino:avr:diecimila:cpu=atmega328 runner
