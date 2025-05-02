import mqtt from 'mqtt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { host, port, username, password } = req.body;

  if (!host || !port) {
    return res.status(400).json({
      success: false,
      message: 'Host and port are required',
    });
  }

  const url = `mqtt://${host}:${port}`;
  const options = {
    connectTimeout: 5001,
    reconnectPeriod: 0,
    clean: true,
    username,
    password,
  };

  try {
    const client = mqtt.connect(url, options);

    const timeout = setTimeout(() => {
      client.end();
      return res.status(408).json({
        success: false,
        message: 'Connection timeout',
      });
    }, 7000);

    client.on('connect', () => {
      clearTimeout(timeout);
      client.end();
      return res.status(200).json({
        success: true,
        message: 'Connected successfully',
      });
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      return res.status(500).json({
        success: false,
        message: `Connection error: ${err.message}`,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}
