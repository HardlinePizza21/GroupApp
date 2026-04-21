.PHONY: up down clean

up:
	docker compose up --build

down:
	docker compose down

# Borra volúmenes (Postgres + node_modules en contenedor). Próximo `make up` reinstala deps.
clean:
	docker compose down -v
