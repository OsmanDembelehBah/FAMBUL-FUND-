.PHONY: test test-web test-intelligence test-ussd run-web run-intelligence run-ussd

test: test-web test-intelligence test-ussd
	@echo "\n=============================================="
	@echo "🎉 ALL POLYGLOT TEST SUITES PASSED SUCCESSFULLY!"
	@echo "=============================================="

test-web:
	@echo "🧪 Running Vitest (Next.js Frontend & Scoring Engine)..."
	cd web && npx vitest run

test-intelligence:
	@echo "🧪 Running Pytest (FastAPI Intelligence Service & Forecasting)..."
	cd intelligence-service && PYTHONPATH=. ./venv/bin/pytest -v tests/

test-ussd:
	@echo "🧪 Running Go Test (USSD State Machine, Lockouts & Split Logic)..."
	cd ussd-gateway && go test -v ./...

run-web:
	cd web && npm run dev

run-intelligence:
	cd intelligence-service && ./venv/bin/uvicorn main:app --port 8000 --reload

run-ussd:
	cd ussd-gateway && go run main.go
