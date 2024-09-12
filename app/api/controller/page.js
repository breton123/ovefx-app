import { WebSocketServer } from "ws";

let wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws) => {
	ws.on("message", (message) => {
		console.log("Received:", message);
	});

	ws.send("Connected to WebSocket server");
});

export default function handler(req, res) {
	if (req.socket.server.wss) {
		res.status(200).end();
		return;
	}

	req.socket.server.wss = wss;

	res.status(200).end();
}
