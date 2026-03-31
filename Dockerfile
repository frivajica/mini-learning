FROM python:3.11-slim as builder

WORKDIR /app

RUN pip install --upgrade uv

COPY pyproject.toml .
RUN uv pip install --system --no-cache --no-build-isolation --compile .

FROM builder as production

WORKDIR /app

RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup

COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

USER appuser

EXPOSE 3000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "3000"]
