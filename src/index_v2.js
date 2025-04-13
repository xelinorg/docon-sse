import { createSecureServer, constants } from 'http2';
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

const {
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_CONTENT_TYPE,
} = constants;

const options = {
  key: fs.readFileSync(path.resolve('./crypto/docon-sse.key.pem')),
  cert: fs.readFileSync(path.resolve('./crypto/docon-sse.crt.pem')),
};

const server = createSecureServer(options);
server.on('stream', (stream, headers, flags) => {
  const method = headers[HTTP2_HEADER_METHOD];
  const reqpath = headers[HTTP2_HEADER_PATH];

  if (reqpath === '/sse') {
    consumers.indexOf(stream) < 0 && consumers.push(stream)
    stream.respond({
      [HTTP2_HEADER_STATUS]: 200,
      [HTTP2_HEADER_CONTENT_TYPE]: 'text/event-stream; charset=utf-8',
    });
    stream.write('data: {"message": "hello docon-sse"}\n\n');
  } else {
    if (reqpath === '/client.js') {
      stream.respond({
        [HTTP2_HEADER_STATUS]: 200,
        [HTTP2_HEADER_CONTENT_TYPE]: 'application/javascript; charset=utf-8',
      });
      fs.createReadStream(path.resolve('./src/client.js')).pipe(stream);
    } else if (reqpath === '/'){
      stream.respond({
        [HTTP2_HEADER_STATUS]: 200,
        [HTTP2_HEADER_CONTENT_TYPE]: 'text/html; charset=utf-8',
      });
      fs.createReadStream(path.resolve('./src/index.html')).pipe(stream);
    }
  }
});

monitor({ consumer: consumerStream });

server.listen(9999);