# Docker Logs Tail

Tail logs from Docker containers to check for errors and monitor application behavior.

## Instructions

When user requests to check container logs:

1. **Discover running containers**: First, list all running containers to see what's available:

   ```bash
   docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
   ```

2. **Ask user which container(s)**: Present the list and ask which container(s) they want to monitor

3. **Use appropriate command**: Run `docker logs` with suitable flags based on their needs

## Common Commands

### List running containers

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
```

### Tail logs for a specific container

```bash
docker logs -f <container_name>
```

### Tail logs with timestamps

```bash
docker logs -f --timestamps <container_name>
```

### Tail last N lines

```bash
docker logs -f --tail 100 <container_name>
```

### Check logs since specific time

```bash
docker logs -f --since 5m <container_name>
```

### View logs from all containers (with docker compose)

```bash
docker compose logs -f
```

### View logs from specific services

```bash
docker compose logs -f <service1> <service2>
```

### Filter for errors

```bash
docker logs <container_name> 2>&1 | grep -i error
```

## Usage Flow

1. Run `docker ps` to discover available containers
2. Present the container list to the user
3. Ask which container(s) they want to tail
4. Ask if they want any filters (errors only, last N lines, since time, etc.)
5. Execute the appropriate `docker logs` command
