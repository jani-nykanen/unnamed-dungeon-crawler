all: out

# Heh, make out
out:
	tsc

out_npx:
	npx tsc

server:
	python3 -m http.server

linecount:
	(cd src; find . -name '*.ts' | xargs wc -l)
