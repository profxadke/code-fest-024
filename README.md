# codeFest 2024

> Pehele istamaal kaare, fir viswaas kaare.

### First of all, DO NOT FORGET to set `.env` using `.env.example` so that OAUTH would work. [ ` https://github.com/settings/applications/new ` ]

Name: CodeFest-024
HomepageURL: https://domain.tld/
AuthorizationCallbackURL: https://domain.tld/auth/callback

```
cp .env.example .env
vim .env  # or, lvim/nvim/nano/mousepad would work too.
```

First time:

```
python3 -m virtualenv .venv && source .venv/bin/activate && pip install -Ur requirements.txt && python3 ./main.py
```

Not first time:

```
source .venv/bin/activate && && python3 ./main.py
```
