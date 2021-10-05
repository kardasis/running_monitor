#!/usr/bin/env python3
import serial


ticks = []  # type: List[int]

def process_tick(ms):
    if len(ticks) == 0:
        print("first tick")
    ticks.append(ms)

if __name__ == '__main__':
    ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=1)
    ser.flush()
    last_tick = 0
    while True:
        if ser.in_waiting > 0:
            line = ser.readline().decode('utf-8').rstrip()
            try: 
                timestamp = int(line)
                process_tick(timestamp)
                last_tick = timestamp
            except:
                print("err")
                print(line)

