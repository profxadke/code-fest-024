#!/usr/bin/env python3


import jwt
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi_sso.sso.github import GithubSSO
from pydantic import BaseModel
from base64 import b64decode
from os import path, mkdir


class CodeInput(BaseModel):
    html: str
    css: str
    js: str
    time_taken: int  # NOTE: Unit: seconds 2700s (min. time for submission)


CLIENT_ID = 'Ov23liONtBo0t1UWeNZ2'
CLIENT_SECRET = 'b49c5f2ff7d44fd8266cb99a6e46e5fdaadcfae5'

if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
app = FastAPI()
templates = Jinja2Templates(directory="templates")
if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
origins = [
    'http://localhost:2580',
    'http://localhost',
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


sso = GithubSSO(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri="http://localhost:2580/auth/callback",
    allow_insecure_http=True,
)


@app.get('/', response_class=HTMLResponse)
def return_index(request: Request):
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
    token = request.cookies.get("token")
    if token:
        decoded = jwt.decode(token, CLIENT_SECRET, algorithms="HS256")
        return templates.TemplateResponse(
                request=request, name="index.html", context={"username": decoded['sub'], 'avatar': decoded['avatar']}
            )
    return FileResponse('static/index.html')


@app.get("/auth/login")
async def oauth_init():
    """Github OAUTH Redirection.."""
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
    with sso:
        return await sso.get_login_redirect()


@app.get("/auth/callback", include_in_schema=False)
async def auth_callback(request: Request):
    """Verify login"""
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
    code = request.query_params['code']
    with sso:
        user = await sso.verify_and_process(request)
        user = dict(user)
        sub = user['display_name']
        user['client_id'] = CLIENT_ID
        user['code'] = code
        token = jwt.encode({
            'sub': sub,
            'id': user['id'],
            'email': user['email'],
            'avatar': user['picture'],
            'iat': int(datetime.now().timestamp())
            }, CLIENT_SECRET, algorithm="HS256")
        return templates.TemplateResponse(
                request=request, name="auth.html", context={"token": token}
            )


@app.put('/code')
def save_code(code: CodeInput, request: Request):
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
    token = request.headers["X-TOKEN"]
    if token:
        if code.time_taken == 270000:
            raise HTTPException(detail="YOU SHOULD FIRST START THE TIMER BEFORE SUBMISSION.", status_code=400)
        decoded = jwt.decode(token, CLIENT_SECRET, algorithms="HS256")
        token_owner = decoded['id'] + '_' + decoded['sub']
        dir_path = f'./saved_codes/{token_owner}'
        try:
            mkdir(dir_path)
        except Exception:
            raise HTTPException(detail="Looks like you've already submitted your code, ignoring this entry.", status_code=400)
        html_code = b64decode(code.html)
        open(f"{dir_path}/index.html", "wb").write(html_code)
        css_code = b64decode(code.css)
        open(f"{dir_path}/style.css", "wb").write(css_code)
        js_code = b64decode(code.js)
        open(f"{dir_path}/script.js", "wb").write(js_code)
        time_taken = code.time_taken
        open(f"{dir_path}/took.txt", "w").write(str(time_taken))
        return {'Good': f'Uploaded! You took {time_taken}/2700 seconds to complete the given task.'}
    raise HTTPException(detail="Authenticate yourself, first.", status_code=401)


@app.get('/{file_path:path}')
def return_static_file(file_path: str):
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
    if path.isfile(f'static/{file_path}'):
        return FileResponse(f'static/{file_path}')
    raise HTTPException(status_code=404, detail=f'Requested file /{file_path} not found.')


if __name__ == '__main__':
    __import__('uvicorn').run('main:app', port=2580, reload=True)
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
