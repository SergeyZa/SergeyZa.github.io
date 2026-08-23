# Previewing locally

Run the site in Docker:

```sh
docker compose up
```

Then open:

```text
http://localhost:4000
```

If you want a one-off container command instead:

```sh
docker run --rm -it -p 4000:4000 -v "${PWD}:/site" -w /site ruby:3.3 sh -lc "bundle install && bundle exec jekyll serve --host 0.0.0.0 --livereload"
```
