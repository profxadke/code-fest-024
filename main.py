#!/usr/bin/env python3

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from base64 import b64decode
from os import path


class CodeInput(BaseModel):
    html: str
    css: str
    js: str
    time_taken: int  # NOTE: Unit: seconds 2700s (min. time for submission)


app = FastAPI()


@app.get('/')
def return_index():
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
    return FileResponse('static/index.html')


@app.put('/code')
def save_code(code: CodeInput):
    # print(code)
    html_code = b64decode(code.html)
    css_code = b64decode(code.css)
    js_code = b64decode(code.js)
    time_taken = code.time_taken
    # TODO: Know user/AUTH module for this CRAP. And, saving above code to disk (with auth and timing)
    return {'Upload': 'Complete!'}


@app.get('/{file_path:path}')
def return_static_file(file_path: str):
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
    if path.isfile(f'static/{file_path}'):
        return FileResponse(f'static/{file_path}')
    raise HTTPException(status_code=404, detail=f'Requested file /{file_path} not found.')


if __name__ == '__main__':
    __import__('uvicorn').run('main:app', port=2580, reload=True)
    if path.isdir('__pycache__'): __import__('shutil').rmtree('__pycache__')
