module.exports = function(RED) {
    const dgram = require('dgram');

    function UdpRequestNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', function(msg) {
            const host = msg.ip || config.host;
            const port = Number(msg.port || config.port);
            let sendBuf = msg.payload;
            const timeout = Number(msg.timeout || config.timeout || 1000);

            node.status({ fill:"yellow", shape:"dot", text:"sending" });

            // 参数校验‑payload空
            if(sendBuf === null || sendBuf === undefined){
                const out = RED.util.cloneMessage(msg);
                out.payload = null;
                out.udp_status = "param_error";
                out.response = null;
                out.error = "payload不能为null或undefined";
                node.status({ fill:"red", shape:"dot", text:"param error" });
                node.send(out);
                return;
            }

            // 非Buffer自动转utf8 Buffer发送
            if (!Buffer.isBuffer(sendBuf)) {
                sendBuf = Buffer.from(String(sendBuf), "utf8");
            }

            // ip/port校验
            if (!host || !port || isNaN(port)) {
                const out = RED.util.cloneMessage(msg);
                out.payload = null;
                out.udp_status = "param_error";
                out.response = null;
                out.error = "参数错误：需要ip和port";
                node.status({ fill:"red", shape:"dot", text:"param error" });
                node.send(out);
                return;
            }

            let settled = false;
            const client = dgram.createSocket('udp4');
            let timer;

            const finish = (outMsg) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                try { client.close(); } catch(e){}
                node.send(outMsg);
            };

            // 收到UDP应答
            client.on('message', (recvBuf, rinfo) => {
                node.log("UDP收到数据，长度：" + recvBuf.length + " bytes, hex:" + recvBuf.toString("hex"));
                const out = RED.util.cloneMessage(msg);
                out.payload = recvBuf;
                out.udp_status = "ok";
                out.rinfo = rinfo;
                delete out.error;

                try {
                    // 尝试utf‑8解码得到response
                    out.response = recvBuf.toString("utf8");
                } catch(err){
                    // 解码失败回退为十六进制字符串
                    out.response = "decode_fail:" + recvBuf.toString("hex");
                }
                node.status({ fill:"green", shape:"dot", text:"ok" });
                finish(out);
            });

            // socket底层错误
            client.on('error', (err) => {
                node.log("UDP socket error:" + err.message);
                const out = RED.util.cloneMessage(msg);
                out.payload = null;
                out.udp_status = "socket_error";
                out.response = null;
                out.error = err.message;
                node.status({ fill:"red", shape:"dot", text:"socket error" });
                finish(out);
            });

            // send发送回调
            client.send(sendBuf, port, host, (err) => {
                if (err) {
                    node.log("UDP send error:" + err.message);
                    const out = RED.util.cloneMessage(msg);
                    out.payload = null;
                    out.udp_status = "send_error";
                    out.response = null;
                    out.error = err.message;
                    node.status({ fill:"red", shape:"dot", text:"send error" });
                    finish(out);
                }
            });

            // 超时
            timer = setTimeout(() => {
                node.log("UDP timeout");
                const out = RED.util.cloneMessage(msg);
                out.payload = null;
                out.udp_status = "timeout";
                out.response = null;
                out.error = "UDP request timeout";
                node.status({ fill:"red", shape:"dot", text:"timeout" });
                finish(out);
            }, timeout);
        });
    }
    RED.nodes.registerType("udp-request",UdpRequestNode);
}
