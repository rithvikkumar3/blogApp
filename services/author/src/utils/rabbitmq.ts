import amqp from "amqplib"
import dotenv from "dotenv"

dotenv.config()

let channel: amqp.Channel

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: process.env.AMQP_PROTOCOL,
            hostname: process.env.AMQP_HOSTNAME,
            port: Number(process.env.AMQP_PORT),
            username: process.env.AMQP_USERNAME,
            password: process.env.AMQP_PASSWORD,

        });
        channel = await connection.createChannel();
        console.log("🐰 Connected to RabbitMQ");

    } catch (error) {
        console.error("❌ Failed to connect to RabbitMQ", error);
    }
}


export const publishToQueue = async (queueName: string, message: any) => {
    if (!channel) {
        console.log("RabbitMQ channel is not initialized");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    })
};

export const invalidateCacheJob = async (cacheKeys: string[]) => {
    try {
        const message = {
            action: "invalidateCache",
            keys: cacheKeys,
        };
        await publishToQueue("cache-invalidation", message)

        console.log("✅ Cache invalidation job published to RabbitMQ");

    } catch (error) {
        console.error("❌ Failed to publish cache on RabbitMQ", error);

    }
}