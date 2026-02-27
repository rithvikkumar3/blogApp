import amqp from "amqplib"
import { redisClient } from "../server.js";
import { sql } from "./db.js";

interface CacheInvalidationMessage {
    action: string,
    keys: string[],
}

export const startCacheConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: process.env.AMQP_PROTOCOL,
            hostname: process.env.AMQP_HOSTNAME,
            port: Number(process.env.AMQP_PORT),
            username: process.env.AMQP_USERNAME,
            password: process.env.AMQP_PASSWORD,

        });

        const channel = await connection.createChannel();

        const queueName = "cache-invalidation";

        await channel.assertQueue(queueName, { durable: true });

        console.log("✅ Blog service cache consumer started");

        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString()) as CacheInvalidationMessage
                    console.log("📩 Blog service recieved cache invalidation message", content);

                    if (content.action === "invalidateCache") {
                        for (const pattern of content.keys) {
                            const keys = await redisClient.keys(pattern)

                            if (keys.length > 0) {
                                await redisClient.del(keys)
                                console.log(`🗑️ Blog service invalidated ${keys.length} cache keys matching: ${pattern}`);

                                const searchQuery = ""
                                const category = ""

                                const cacheKey = `blogs:${searchQuery}:${category}`;

                                const blogs = await sql`SELECT * FROM blogs ORDER BY created_at DESC`;
                                await redisClient.set(cacheKey, JSON.stringify(blogs), {EX: 3600})

                                console.log("🔃 Cache  rebuilt with key: ", cacheKey);
                            }
                        }
                    }

                    channel.ack(msg)
                } catch (error) {
                    console.error("❌ Error processing cache invalidation in blog service: ", error);

                    channel.nack(msg, false, true)
                    
                }
            }
        })
    } catch (error) {
        console.log("❌ Failed to start rabbitmq consumer");
        
    }
}

