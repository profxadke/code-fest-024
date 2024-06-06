#!/usr/bin/env python3


import jwt
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, RedirectResponse
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
if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')

sso = GithubSSO(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri="http://localhost:2580/auth/callback",
    allow_insecure_http=True,
)

@app.get('/')
def return_index(request: Request):
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
    token = request.cookies.get("token")
    decoded = jwt.decode(token, CLIENT_SECRET, algorithms="HS256")
    # TODO: auto-set sub and avatar to UI below: (Jinja2)
    return FileResponse('static/index.html')


@app.get("/auth/login")
async def oauth_init():
    """Github OAUTH Redirection.."""
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
    with sso:
        return await sso.get_login_redirect()


@app.get("/auth/callback", include_in_schema=False)
async def auth_callback(request: Request, response: Response):
    """Verify login"""
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
    code = request.query_params['code']
    with sso:
        user = await sso.verify_and_process(request)
        user = dict(user)
        user['client_id'] = CLIENT_ID
        user['code'] = code
        token = jwt.encode({
            'sub': user['display_name'],
            'id': user['id'],
            'email': user['email'],
            'avatar': user['picture'],
            'iat': int(datetime.now().timestamp())
            }, CLIENT_SECRET, algorithm="HS256")
        response.set_cookie("token", token, httponly=True)
        return RedirectResponse('/')


@app.put('/code')
def save_code(code: CodeInput, request: Request):
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
    token = request.cookies.get("token")
    decoded = jwt.decode(token, CLIENT_SECRET, algorithms="HS256")
    token_owner = decoded['id'] + '_' + decoded['sub']
    dir_path = f'./saved_codes/{token_owner}'
    mkdir(dir_path)
    html_code = b64decode(code.html)
    open(f"{dir_path}/index.html", "wb").write(html_code)
    css_code = b64decode(code.css)
    open(f"{dir_path}/style.css", "wb").write(css_code)
    js_code = b64decode(code.js)
    open(f"{dir_path}/script.js", "wb").write(js_code)
    time_taken = code.time_taken
    open(f"{dir_path}/took.txt", "w").write(str(time_taken))
    return {'Good': f'Uploaded! You took {time_taken}/2700 seconds to complete the given task.'}


@app.get('/{file_path:path}')
def return_static_file(file_path: str):
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
    if path.isfile(f'static/{file_path}'):
        return FileResponse(f'static/{file_path}')
    raise HTTPException(status_code=404, detail=f'Requested file /{file_path} not found.')


if __name__ == '__main__':
    __import__('uvicorn').run('main:app', port=2580, reload=True)
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
