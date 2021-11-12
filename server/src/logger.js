const { createLogger, format, transports } = require('winston');

const loggerFactory = (startTime) => {
  const logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    transports: [
      new transports.File({ filename: `${__dirname}/../logs/${startTime}.log`, json: false })
    ]
  })
  return logger
}

module.exports = loggerFactory
