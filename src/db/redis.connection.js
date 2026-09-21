import { createClient } from "redis"

const client = createClient({
  url: "rediss://default:gQAAAAAAAU8LAAIgcDEyNDViYzcxOWM0ODU0ZGQ5YWIwNjU0OTAzMjQyMzk2Yw@diverse-mastiff-85771.upstash.io:6379"
});

client.on("error", function(err) {
  throw err;
});
export default client
await client.connect()
await client.set('foo','bar');

