#!make

-include .env
export $(shell sed 's/=.*//' .env)

ENV_NAME ?= dev
export AWS_REGION ?= ca-central-1


TERRAFORM_DIR = terraform/
PROJECT_CODE = $(LZ2_PROJECT)-$(ENV_NAME)


export PROJECT_NAME = ets
export LZ2_PROJECT = klwrig

# Git Stuff 
export COMMIT_SHA?=$(shell git rev-parse --short=7 HEAD)
export REPO_LOCATION=$(shell git rev-parse --show-toplevel)

define TFVARS_DATA
project_name = "$(PROJECT_NAME)"
target_env = "$(ENV_NAME)"
project_code = "$(PROJECT_CODE)"
git_version = "ETS-$(COMMIT_SHA)"
api_zip = "build/server.zip"
ets_to_sbc_zip = "build/etsToSbc.zip"
phac_to_sbc_zip = "build/phacToSbc.zip"
endef
export TFVARS_DATA

define TF_BACKEND_CFG
workspaces { name = "$(LZ2_PROJECT)-$(ENV_NAME)" }
hostname     = "app.terraform.io"
organization = "bcgov"
endef
export TF_BACKEND_CFG

# ============================================================= #
# Terraform automation
# ============================================================= #

env-print: 
	@tput setaf 1; 
	@echo -e "\n\n"
	@echo -e "=========================================================="
	@echo -e "!!!!! You are terraforming $(ENV_NAME) !!!!!"
	@echo -e "=========================================================="
	@echo -e "\n\n"
	@tput setaf 9

write-config-tf: 
	@echo "$$TFVARS_DATA" > $(TERRAFORM_DIR)/.auto.tfvars
	@echo "$$TF_BACKEND_CFG" > $(TERRAFORM_DIR)/backend.hcl

init: write-config-tf
	# Initializing the terraform environment
	@terraform -chdir=$(TERRAFORM_DIR) init -input=false \
		-reconfigure \
		-backend-config=backend.hcl

plan: init
	# Creating all AWS infrastructure.
	@terraform -chdir=$(TERRAFORM_DIR) plan

apply: init
	# Creating all AWS infrastructure.
	@terraform -chdir=$(TERRAFORM_DIR) apply -auto-approve -input=false


force-unlock: init
	terraform -chdir=$(TERRAFORM_DIR) force-unlock $(LOCK_ID)

destroy: init
	terraform -chdir=$(TERRAFORM_DIR) destroy

all: build-client build-lambdas init apply

# ============================================================= #
# Builds 
# ============================================================= #

build-client:
	rm -rf ./terraform/build/client || true
	npm install --prefix client
	npm run --prefix client build
	mkdir -p ./terraform/build
	mv ./client/build ./terraform/build/client

build-lambdas:
	
	@echo -e "\n\n\n============================="
	@echo "Cleaning up previous builds"
	@echo "============================="
	rm -rf ./terraform/build/server || true
	mkdir -p ./terraform/build
	
	
	@echo -e "\n\n\n============================="
	@echo "Install Node Modules in all packages"
	@echo "============================="
	npm install --production --prefix server
	npm install --production --prefix server/lambda/layer/common/nodejs/custom_modules
	npm install --production --prefix server/lambda/layer/common/nodejs

	@echo -e "\n\n\n============================="
	@echo "Copy backend to temp folder to start build"
	@echo "============================="
	cp -r ./server ./terraform/build/server

	@echo -e "\n\n\n============================="
	@echo "Optimize node modules size"
	@echo "============================="
	npx modclean -n default:safe,default:caution -er -D terraform/build/server

	curl -s https://gobinaries.com/tj/node-prune |  PREFIX=. sh
	./node-prune terraform/build/server
	rm node-prune
	
	@echo -e "\n\n\n============================="
	@echo "Build Main Server lambda"
	@echo "============================="
	cd $(REPO_LOCATION)/terraform/build/server && zip -rq $(REPO_LOCATION)/terraform/build/server.zip *

	@echo -e "\n\n\n============================="
	@echo "Copy Node Modules, Remove custom_modules symlink, Copy custom_modules aaannnd ZIP"
	@echo "============================="

	@cp -r $(REPO_LOCATION)/terraform/build/server/lambda/layer/common/nodejs/node_modules $(REPO_LOCATION)/terraform/build/server/lambda/phacToSbc
	@rm $(REPO_LOCATION)/terraform/build/server/lambda/phacToSbc/node_modules/custom_modules
	@cp -r $(REPO_LOCATION)/terraform/build/server/lambda/layer/common/nodejs/custom_modules $(REPO_LOCATION)/terraform/build/server/lambda/phacToSbc/node_modules/custom_modules
	cd $(REPO_LOCATION)/terraform/build/server/lambda/phacToSbc && zip -rq $(REPO_LOCATION)/terraform/build/phacToSbc.zip *

	@cp -r $(REPO_LOCATION)/terraform/build/server/lambda/layer/common/nodejs/node_modules $(REPO_LOCATION)/terraform/build/server/lambda/etsToSbc
	@rm $(REPO_LOCATION)/terraform/build/server/lambda/etsToSbc/node_modules/custom_modules
	@cp -r $(REPO_LOCATION)/terraform/build/server/lambda/layer/common/nodejs/custom_modules $(REPO_LOCATION)/terraform/build/server/lambda/etsToSbc/node_modules/custom_modules
	cd $(REPO_LOCATION)/terraform/build/server/lambda/etsToSbc && zip -rq $(REPO_LOCATION)/terraform/build/etsToSbc.zip *

# ============================================================= #
# Local Development 
# ============================================================= #

build-local:
	@echo "Building local app image"
	@docker-compose -f docker-compose.dev.yml build

run-local:
	@echo "Running local app container"
	@docker-compose -f docker-compose.dev.yml up

run-local-db:
	@echo "Running local DB container"
	@docker-compose -f docker-compose.dev.yml up mongodb

run-e2e-test:
	@npm test --prefix server

run-local-lambda-phacToSbc:
	@aws lambda invoke --endpoint http://localhost:9001 --no-sign-request --function-name index.handler --cli-binary-format raw-in-base64-out --payload '{}' output.json

run-local-lambda-etsToSbc:
	@aws lambda invoke --endpoint http://localhost:9002 --no-sign-request --function-name index.handler --cli-binary-format raw-in-base64-out --payload '{}' output.json

close-local:
	@echo "Stopping local app container"
	@docker-compose -f docker-compose.dev.yml down

local-db-seed:
	@echo "Seeding local DB container"
	@docker exec -it $(PROJECT_NAME)-server npm run db:seed

local-server-tests:
	@echo "Running tests in local app container"
	@docker exec -it $(PROJECT_NAME)-server npm test