require 'json'
require 'pp'

def analyzeDetails(deets)
   ticks = deets['ticks'].map(&:to_i)
   tick_deltas = []
   ticks.each_with_index do |t, i|
     if (i > 0)
       tick_deltas.push(t - ticks[i-1])
     end
   end
   PP.pp tick_deltas, $>, 100
   mean = tick_deltas.sum/tick_deltas.length
   pp mean
end

file = File.open("1636727808671.log")
file_data = file.readlines.map { |l| JSON.parse(l)}
n = file_data.length
file_data.each_with_index do |dp, i|
  if i > 0 && i < n-1
    prev_speed = file_data[i-1]['immediateSpeed']
    next_speed = file_data[i+1]['immediateSpeed']
    speed = file_data[i]['immediateSpeed']
    if (speed > prev_speed + 0.2) && (speed > next_speed + 0.2) 
        pp '---------'
        pp "#{prev_speed.round(2)} #{speed.round(2)} #{next_speed.round(2)}"

        analyzeDetails(dp)
    end
  end
end
file.close




