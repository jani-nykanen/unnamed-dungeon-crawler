all: out

# Heh, make out
out:
	tsc

server:
	python3 -m http.server

