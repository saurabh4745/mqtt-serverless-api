import mqtt from 'mqtt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { host, port, username, password, topic, message } = req.body;

  if (!host || !port || !topic || !message) {
    return res.status(400).json({
      success: false,
      message: 'Missing required parameters',
    });
  }

  const url = `mqtt://${host}:${port}`;
  const options = {
    username,
    password,
  };

  try {
    const client = mqtt.connect(url, options);

    client.on('connect', () => {
      client.publish(topic, message, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Failed to publish message',
            error: err.message,
          });
        }

        client.end();
        return res.status(200).json({
          success: true,
          message: `Message published to topic '${topic}'`,
        });
      });
    });

    client.on('error', (err) => {
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to MQTT broker',
        error: err.message,
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
