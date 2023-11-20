FROM python:3.11-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY requirements.txt requirements.txt

RUN pip3 install -r requirements.txt
RUN mkdir -p upload

COPY . .

EXPOSE 5787

CMD [ "python3", "app.py" ]
