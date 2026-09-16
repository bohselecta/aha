FROM node:24.18.0-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d AS web
WORKDIR /build
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/site/package.json apps/site/package.json
RUN npm ci --ignore-scripts
COPY apps/web apps/web
COPY packages/contracts packages/contracts
COPY packages/workbench packages/workbench
RUN npm run build

FROM python:3.13.7-slim-bookworm@sha256:adafcc17694d715c905b4c7bebd96907a1fd5cf183395f0ebc4d3428bd22d92d
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PYTHONPATH=/app/services/api AHA_DATA_ROOT=/data/cases
WORKDIR /app
COPY requirements.lock ./
RUN apt-get update && apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-eng poppler-utils libseccomp2 && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.lock && useradd --uid 10001 --create-home aha && mkdir /data /spool && chown aha:aha /data /spool
COPY services services
COPY packages packages
COPY scripts scripts
COPY --from=web /build/apps/web/dist apps/web/dist
RUN chmod -R a+rX /app/apps/web/dist
USER 10001:10001
EXPOSE 8080
CMD ["python","scripts/container.py"]
