import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';

const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public');

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
  const {method, url: path, headers} = request;
  const {pathname, search} = url.parse(path); // url.parse 得到基本路径

  if (method !== 'GET') {
    response.statusCode = 405;
    response.end();
    return;
  }

  // response.setHeader('Content-Type', 'text/html; charset=utf-8');
  let filename = pathname.substring(1);
  if (filename === '') {
    filename = 'index.html';
  }
  fs.readFile(p.resolve(publicDir, filename), (error, data) => {
    if (error) {
      if (error.errno === -4058) {
        response.statusCode = 404;
        fs.readFile(p.resolve(publicDir, '404.html'), (error, data) => {
          response.end(data);
        });
      } else {
        response.statusCode = 500;
        response.end('The server is busy, please try again later');
      }
    } else {
      // 添加缓存
      response.setHeader('Cache-Control', 'public, max-age=31536000');
      // 返回文件内容
      response.end(data);
    }
  });

});
server.listen(8888);