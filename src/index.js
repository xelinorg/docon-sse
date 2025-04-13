import http from 'http';
import { Transform } from 'stream'
import fs from 'fs';
import path from 'path';

import { monitor } from 'docon';

const consumers = [];

const createTransformStream = () => {
  return new Transform({
    decodeStrings: false,
    encoding: 'utf8',
    transform(chunk, enc, next) {
      next(null, chunk.toString());
    }
  })
}
const consumerStream = createTransformStream()
consumerStream.on('data', (data) => {
  console.log('got data:', JSON.parse(data));
  for (const consumer of consumers) {
    consumer.write(`data: ${data}\n\n`)
  }
})

consumerStream.on('error', (error) => {
  console.log('got error:', error);
})

const server = http.createServer();
monitor({ consumer:consumerStream });
server.on('request', (req, res) => {
  console.log('>>> ', req.url);
  if (req.url === '/sse') {
    consumers.indexOf(res) < 0 && consumers.push(res)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write('data: {"message": "hello docon-sse"}\n\n');
  } else {
    if (req.url === '/client.js') {
      res.setHeader('Content-Type', 'application/javascript')
      fs.createReadStream(path.resolve('./src/client.js')).pipe(res);
    } else if (req.url === '/'){
      res.setHeader('Content-Type', 'text/html')
      fs.createReadStream(path.resolve('./src/index.html')).pipe(res);
    }
  }
});

server.listen(9999);